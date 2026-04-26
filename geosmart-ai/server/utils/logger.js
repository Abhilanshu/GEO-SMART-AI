const AuditLog = require('../models/AuditLog');

const logAction = async (userId, role, action, details, targetId = null) => {
  try {
    const log = new AuditLog({
      userId,
      role,
      action,
      details,
      targetId
    });
    await log.save();
    console.log(`[AUDIT LOG]: ${role} performed ${action}`);
  } catch (err) {
    console.error("Audit Logging Error:", err);
  }
};

module.exports = { logAction };
