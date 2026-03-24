const mongoose = require('mongoose');

const ReturnSchema = new mongoose.Schema({
  reason: String,
  status: String,
  requestDate: Date,
  approvalDate: Date,
  refundAmount: Number,
  notes: String,
  createdAt: Date
});

const DisputeSchema = new mongoose.Schema({
  reason: String,
  status: String,
  disputeDate: Date,
  resolutionDate: Date,
  amountClaimed: Number,
  notes: String,
  description: String,
  resolution: String
});

const OrderSchema = new mongoose.Schema({
  id: String,
  buyerId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'shipped', 'delivered', 'cancelled', 'returned'],
    default: 'pending'
  },
  totalPrice: {
    type: Number,
    required: true
  },
  orderDate: {
    type: Date,
    default: Date.now
  },
  voucher: String,
  returns: [ReturnSchema],
  disputes: [DisputeSchema],
  addressId: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', OrderSchema);
