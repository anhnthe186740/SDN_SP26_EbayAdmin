const express = require('express');
const { getOrderItems, getOrderItem, createOrderItem, updateOrderItem, deleteOrderItem } = require('../controllers/orderItemController');
const router = express.Router();
router.route('/').get(getOrderItems).post(createOrderItem);
router.route('/:id').get(getOrderItem).put(updateOrderItem).delete(deleteOrderItem);
module.exports = router;
