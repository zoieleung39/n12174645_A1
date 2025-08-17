const express = require('express');
const { getItems, addItem, updateItem, deleteItem } = require('../controllers/itemController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/').get(protect, getItems).post(protect, addItem);
router.route('/:id').put(protect, updateItem).delete(protect, deleteItem);

module.exports = router;
