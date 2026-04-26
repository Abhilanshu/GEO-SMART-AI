const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: { type: String, enum: ['Official', 'Volunteer', 'Individual'], default: 'Individual' },
  organization: String, // For NGO/Official
  bio: { type: String, default: "" },
  skills: [{ type: String }],
  missionHistory: [{
    missionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Need' },
    status: { type: String },
    timestamp: { type: Date, default: Date.now }
  }],
  emergencyContact: {
    name: String,
    phone: String
  },
  createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
UserSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Compare password
UserSchema.methods.comparePassword = function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
