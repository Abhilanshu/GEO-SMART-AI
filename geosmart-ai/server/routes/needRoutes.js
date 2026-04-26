const express = require('express');
const router = express.Router();
const needController = require('../controllers/needController');

// All Mission Control Routes
router.post('/', needController.createNeed);
router.get('/', needController.getNeeds);
router.patch('/:id', needController.updateNeedStatus);
router.put('/:id', needController.updateNeedStatus);

module.exports = router;
