const express = require('express');
const router = express.Router();
const predictiveController = require('../controllers/predictiveController');

router.get('/warnings', predictiveController.getEarlyWarnings);

module.exports = router;
