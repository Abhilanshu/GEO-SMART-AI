const express = require('express');
const router = express.Router();
const Need = require('../models/Need');
const { analyzeCrisisWithOllama } = require('../utils/ollama');

/**
 * SMS/USSD Offline Gateway
 * Simulates low-bandwidth crisis reporting
 */
router.post('/incoming', async (req, res) => {
  try {
    const { from, text, location_string } = req.body;
    
    console.log(`📡 [OFFLINE GATEWAY] Incoming SMS from ${from}: ${text}`);

    // AI Processes the raw SMS text
    const aiResult = await analyzeCrisisWithOllama(text);

    const newCrisis = new Need({
      ...aiResult,
      location: {
        address: location_string || 'Location extracted from SMS cell tower',
        coordinates: { lat: 20.5937, lng: 78.9629 } // Simulation
      },
      reportingPhones: [from],
      status: 'Pending', // SMS reports require verification
    });

    await newCrisis.save();

    // Notify Dashboard via Socket.io (if available)
    const io = req.app.get('socketio');
    if (io) io.emit('new_need', newCrisis);

    res.status(200).send("SMS RECEIVED. HELP IS ON THE WAY.");
  } catch (error) {
    console.error("SMS Gateway Error:", error);
    res.status(500).send("ERROR PROCESSING REPORT");
  }
});

module.exports = router;
