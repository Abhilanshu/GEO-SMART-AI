const Need = require('../models/Need');
const { parseCrisisMessage, analyzeCrisisImage } = require('../utils/gemini');
const { analyzeCrisisWithOllama } = require('../utils/ollama');
const { assessNeedVerification } = require('../utils/predictive');

exports.createNeed = async (req, res) => {
  try {
    const { message, image, phone, ...otherData } = req.body;
    let needData = { ...otherData };

    if (image) {
      const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
      const aiData = await analyzeCrisisImage(base64Data);
      if (aiData) {
        needData = { ...needData, ...aiData, image };
      } else {
        needData = { ...needData, image }; // Fallback to frontend's provided data
      }
    } else if (message) {
      // Hybrid AI: Try local Ollama first, then cloud Gemini
      try {
        const ollamaData = await analyzeCrisisWithOllama(message);
        needData = { ...needData, ...ollamaData };
        console.log("Mission Analysis: Processed by LOCAL OLLAMA");
      } catch (err) {
        const geminiData = await parseCrisisMessage(message);
        needData = { ...needData, ...geminiData };
        console.log("Mission Analysis: Processed by CLOUD GEMINI (Fallback)");
      }
    }
    
    // Ensure required Mongoose fields exist to prevent 500 error
    needData.urgency = needData.urgency || 5;
    needData.category = needData.category || 'Other';
    needData.affectedPeople = needData.affectedPeople || 1;

    if (!needData) throw new Error("Failed to parse report.");

    // Add reporting phone
    if (phone) needData.reportingPhones = [phone];

    // Major Indian Cities simulation
    const cities = [
      { name: 'Delhi', lat: 28.6139, lng: 77.2090 },
      { name: 'Mumbai', lat: 19.0760, lng: 72.8777 },
      { name: 'Bangalore', lat: 12.9716, lng: 77.5946 },
      { name: 'Kolkata', lat: 22.5726, lng: 88.3639 },
      { name: 'Chennai', lat: 13.0827, lng: 80.2707 },
      { name: 'Indore', lat: 22.7196, lng: 75.8577 }
    ];
    const randomCity = cities[Math.floor(Math.random() * cities.length)];

    if (!needData.location || typeof needData.location === 'string') {
        needData.location = {
            address: typeof needData.location === 'string' ? needData.location : `${randomCity.name}, India`,
            coordinates: {
                lat: randomCity.lat + (Math.random() - 0.5) * 0.5,
                lng: randomCity.lng + (Math.random() - 0.5) * 0.5
            }
        };
    }

    const existingNeeds = await Need.find({ status: 'Pending' });
    const { verified, matchCount } = assessNeedVerification(existingNeeds, needData);
    
    const newNeed = new Need({
      ...needData,
      isVerified: verified,
      verificationVotes: matchCount
    });

    const urgency = newNeed.urgency || 3;
    const people = newNeed.affectedPeople || 1;
    newNeed.priorityScore = (urgency * people) - (newNeed.assignedVolunteers.length * 10);
    
    await newNeed.save();

    // EMIT REAL-TIME EVENT
    const io = req.app.get('socketio');
    io.emit('new_need', newNeed);

    res.status(201).json(newNeed);
  } catch (error) {
    console.error("CREATE NEED ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.getNeeds = async (req, res) => {
  try {
    const needs = await Need.find().populate('assignedVolunteers');
    res.json(needs);
  } catch (error) {
    console.error("GET NEEDS ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateNeedStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const updatedNeed = await Need.findByIdAndUpdate(
      id, 
      { status }, 
      { new: true }
    ).populate('assignedVolunteers');

    if (!updatedNeed) return res.status(404).json({ error: "Mission not found" });

    // Notify all dashboards in real-time
    const io = req.app.get('socketio');
    if (io) io.emit('update_need', updatedNeed);

    res.json(updatedNeed);
  } catch (error) {
    console.error("UPDATE STATUS ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};
