const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Need = require('./models/Need');

dotenv.config();

const seedFinalResponse = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/geosmart';
    await mongoose.connect(uri);
    
    await Need.deleteMany({});
    
    await Need.insertMany([
      {
        category: 'Flood',
        description: 'URGENT: Water levels rising in Kochi residential block. Citizens trapped on rooftops.',
        location: { address: 'Kochi, Kerala', coordinates: { lat: 9.9312, lng: 76.2673 } },
        urgency: 5,
        affectedPeople: 250,
        status: 'Pending',
        image: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&q=80&w=800'
      },
      {
        category: 'Fire',
        description: 'Massive warehouse fire near Surat port area. Secondary explosions reported.',
        location: { address: 'Surat, Gujarat', coordinates: { lat: 21.1702, lng: 72.8311 } },
        urgency: 5,
        affectedPeople: 100,
        status: 'Pending',
        image: 'https://images.unsplash.com/photo-1545163051-738981607590?auto=format&fit=crop&q=80&w=800'
      },
      {
        category: 'Medical',
        description: 'Critical Road Accident on Mathura Highway. 3 Ambulances requested.',
        location: { address: 'Mathura, UP', coordinates: { lat: 27.4924, lng: 77.6737 } },
        urgency: 4,
        affectedPeople: 12,
        status: 'Verified',
        assignedVolunteers: [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()],
        image: 'https://images.unsplash.com/photo-1587573089734-09cb69c0f2b4?auto=format&fit=crop&q=80&w=800'
      }
    ]);

    console.log('✅ STRATEGIC SEED COMPLETE: Queue and Volunteers now have live data.');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedFinalResponse();
