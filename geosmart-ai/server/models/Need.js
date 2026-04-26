const mongoose = require('mongoose');

const NeedSchema = new mongoose.Schema({
  location: {
    address: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  category: {
    type: String,
    enum: ['Medical', 'Food', 'Education', 'Shelter', 'Flood', 'Fire', 'Earthquake', 'Other'],
    required: true
  },
  urgency: {
    type: Number, // 1 to 5
    required: true
  },
  affectedPeople: {
    type: Number,
    required: true
  },
  description: String,
  image: String,
  detectedLanguage: { type: String, default: 'English' },
  priorityScore: {
    type: Number,
    default: 0
  },
  assignedVolunteers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['Pending', 'Verified', 'Assigned', 'Resolved'],
    default: 'Pending'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationVotes: {
    type: Number,
    default: 0
  },
  reportingPhones: [String],
  inventoryAllocated: [{
    item: String,
    quantity: Number
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Priority Score Calculation: (urgency * affected) - (vols * 10)
NeedSchema.pre('save', function() {
  this.priorityScore = (this.urgency * this.affectedPeople) - (this.assignedVolunteers.length * 10);
});

module.exports = mongoose.model('Need', NeedSchema);
