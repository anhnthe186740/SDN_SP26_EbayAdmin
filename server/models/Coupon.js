const mongoose = require('mongoose');

const CouponSchema = new mongoose.Schema({
  id: String,
  voucherCode: {
    type: String,
    required: true,
    unique: true
  },
  discountAmount: {
    type: Number,
    required: true
  },
  description: String,
  expiryDate: Date,
  productId: String,
  startDate: {
    type: Date,
    default: null
  },
  maxUsage: {
    type: Number,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Coupon', CouponSchema);
