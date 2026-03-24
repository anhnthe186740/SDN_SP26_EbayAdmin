const mongoose = require('mongoose');

const ReturnRequestSchema = new mongoose.Schema({
  id: String,
  orderId: String,
  userId: String,
  status: {
    type: String,
    enum: ['requested', 'approved', 'rejected'],
    default: 'requested'
  },
  reason: String,
  createdAt: { type: Date, default: Date.now },
  approvalDate: Date,
  refundAmount: Number,
  notes: String
}, {
  timestamps: true
});

module.exports = mongoose.model('ReturnRequest', ReturnRequestSchema);
