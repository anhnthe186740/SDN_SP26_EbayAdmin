const mongoose = require('mongoose');

const ProductItemSchema = new mongoose.Schema({
  productId: String,
  quantity: Number,
  price: Number,
  name: String,
  images: [String]
});

const OrderItemSchema = new mongoose.Schema({
  id: String,
  orderId: {
    type: String,
    required: true
  },
  products: [ProductItemSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('OrderItem', OrderItemSchema);
