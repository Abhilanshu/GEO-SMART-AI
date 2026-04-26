const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  action: { 
    type: String, 
    required: true // e.g., 'DISPATCH_SENT', 'RESOURCE_ALLOCATED', 'CRISIS_VERIFIED'
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId, // ID of the Need or Inventory item
    required: true
  },
  details: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  ipAddress: String
});

module.exports = mongoose.model('AuditLog', AuditLogSchema);
