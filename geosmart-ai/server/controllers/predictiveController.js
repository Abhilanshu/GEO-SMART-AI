const { generateEarlyWarnings } = require('../utils/predictive');

exports.getEarlyWarnings = (req, res) => {
  try {
    const warnings = generateEarlyWarnings();
    res.json(warnings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
