const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Need = require('./models/Need');
const Inventory = require('./models/Inventory');

dotenv.config();

const seedData = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/geosmart';
    await mongoose.connect(uri);
    console.log('Connected to MongoDB at:', uri);

    // Clear existing data
    await Need.deleteMany({});
    await Inventory.deleteMany({});

    // Seed Real-World Inventory
    await Inventory.insertMany([
      { item: 'Inflatable Boats', quantity: 120, unit: 'Units', category: 'Tools', region: 'Mumbai Hub', status: 'Good' },
      { item: 'Food Packets (MRE)', quantity: 1500, unit: 'Packets', category: 'Food', region: 'Indore Central', status: 'Good' },
      { item: 'First Aid Kits', quantity: 45, unit: 'Kits', category: 'Medical', region: 'Kolkata Port', status: 'Critical' },
      { item: 'Blankets', quantity: 300, unit: 'Units', category: 'Shelter', region: 'Delhi Base', status: 'Low' },
      { item: 'Clean Water (Litres)', quantity: 5000, unit: 'Litres', category: 'Water', region: 'Chennai South', status: 'Good' }
    ]);

    // Seed Multilingual Crisis Reports
    await Need.insertMany([
      {
        category: 'Flood',
        description: 'Assam Valley flood. Water levels rising rapidly. Rescue required for 20 families.',
        location: { address: 'Guwahati, Assam', coordinates: { lat: 26.1433, lng: 91.7363 } },
        urgency: 5,
        affectedPeople: 100,
        status: 'Verified',
        detectedLanguage: 'English',
        reportingPhones: ['+919876543210']
      },
      {
        category: 'Medical',
        description: 'मुंबईत इमारत कोसळली. लोक अडकले आहेत. (Building collapsed in Mumbai. People are trapped.)',
        location: { address: 'Dharavi, Mumbai', coordinates: { lat: 19.0760, lng: 72.8777 } },
        urgency: 5,
        affectedPeople: 50,
        status: 'Pending',
        detectedLanguage: 'Marathi',
        reportingPhones: ['+918888888888']
      },
      {
        category: 'Fire',
        description: 'কলকাতা বাজারে আগুন। সাহায্য দরকার। (Fire in Kolkata market. Need help.)',
        location: { address: 'Burrabazar, Kolkata', coordinates: { lat: 22.5726, lng: 88.3639 } },
        urgency: 4,
        affectedPeople: 200,
        status: 'Verified',
        detectedLanguage: 'Bengali',
        reportingPhones: ['+917777777777']
      }
    ]);

    console.log('Seeding Complete: Map and Inventory are now populated with realistic data.');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedData();
