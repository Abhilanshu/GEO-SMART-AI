const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema({
  item: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 0
  },
  unit: {
    type: String, // e.g., "pkts", "liters", "units"
    required: true
  },
  warehouseLocation: {
    address: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  category: {
    type: String,
    enum: ['Food', 'Medical', 'Water', 'Shelter', 'Tools'],
    required: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Inventory', InventorySchema);
