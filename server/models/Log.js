const mongoose = require('mongoose');

const LogSchema = new mongoose.Schema({
  id: Number,
  action: {
    type: String,
    required: true
  },
  user: String,
  timestamp: {
    type: Date,
    default: Date.now
  },
  ip: String,
  level: {
    type: String,
    enum: ['info', 'warn', 'error'],
    default: 'info'
  },
  details: String,
  disputeId: String,
  newStatus: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Log', LogSchema);
