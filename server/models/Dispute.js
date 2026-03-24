const mongoose = require('mongoose');

const DisputeSchema = new mongoose.Schema({
  id: String,
  orderId: {
    type: String,
    required: true
  },
  raisedBy: {
    type: String,
    required: true
  },
  reason: String,
  status: {
    type: String,
    enum: ['pending', 'resolved', 'closed'],
    default: 'pending'
  },
  disputeDate: {
    type: Date,
    default: Date.now
  },
  resolutionDate: {
    type: Date,
    default: null
  },
  amountClaimed: Number,
  description: String,
  resolution: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Dispute', DisputeSchema);
