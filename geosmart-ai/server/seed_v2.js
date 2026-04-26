const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Need = require('./models/Need');
const Inventory = require('./models/Inventory');

dotenv.config();

const seedProData = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/geosmart';
    await mongoose.connect(uri);
    console.log('Connected to MongoDB for Pro Seeding...');

    // Clear existing data for a fresh demo
    await Need.deleteMany({});
    await Inventory.deleteMany({});

    // Seed Strategic Supplies
    await Inventory.insertMany([
      { item: 'Rescue Boats (Zodiac)', quantity: 85, unit: 'Units', category: 'Tools', region: 'Mumbai Navy Dock', status: 'Good' },
      { item: 'Medical Trauma Kits', quantity: 12, unit: 'Kits', category: 'Medical', region: 'Indore GH', status: 'Critical' },
      { item: 'Food Packets (MRE)', quantity: 2400, unit: 'Packets', category: 'Food', region: 'Delhi Logistics Hub', status: 'Good' },
      { item: 'Water Purification Tablets', quantity: 5000, unit: 'Tabs', category: 'Water', region: 'Chennai Port', status: 'Good' },
      { item: 'Fire Retardant Suits', quantity: 30, unit: 'Suits', category: 'Tools', region: 'Pune Fire Base', status: 'Low' }
    ]);

    // Seed Verification Queue (Pending Reports)
    await Need.insertMany([
      {
        category: 'Flood',
        description: 'Severe flooding reported in Kerala. Water entering first floors. Need immediate evacuation boats.',
        location: { address: 'Kochi, Kerala', coordinates: { lat: 9.9312, lng: 76.2673 } },
        urgency: 5,
        affectedPeople: 450,
        status: 'Pending',
        detectedLanguage: 'English',
        image: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&q=80&w=800',
        reportingPhones: ['+919000011111']
      },
      {
        category: 'Fire',
        description: 'Industrial fire in Gujarat warehouse district. Risk of chemical leakage.',
        location: { address: 'Surat, Gujarat', coordinates: { lat: 21.1702, lng: 72.8311 } },
        urgency: 5,
        affectedPeople: 200,
        status: 'Pending',
        detectedLanguage: 'English',
        image: 'https://images.unsplash.com/photo-1545163051-738981607590?auto=format&fit=crop&q=80&w=800',
        reportingPhones: ['+919000022222']
      },
      {
        category: 'Medical',
        description: 'Road accident on Delhi-Agra Expressway. Multiple casualties. Need 3 ambulances.',
        location: { address: 'Mathura, UP', coordinates: { lat: 27.4924, lng: 77.6737 } },
        urgency: 4,
        affectedPeople: 15,
        status: 'Pending',
        detectedLanguage: 'English',
        image: 'https://images.unsplash.com/photo-1587573089734-09cb69c0f2b4?auto=format&fit=crop&q=80&w=800',
        reportingPhones: ['+919000033333']
      }
    ]);

    console.log('✅ PRO SEEDING COMPLETE: Dashboard is now populated with real-time data.');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedProData();
