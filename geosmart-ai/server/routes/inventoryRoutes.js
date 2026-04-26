const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { auth, authorize } = require('../middleware/auth');

router.get('/', inventoryController.getInventory);
router.get('/all', inventoryController.getInventory); // Secondary route for safety
router.put('/:id', auth, authorize(['NGO', 'Official']), inventoryController.updateInventory);

module.exports = router;
