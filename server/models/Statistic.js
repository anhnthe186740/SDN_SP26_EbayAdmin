const mongoose = require('mongoose');

const StatisticSchema = new mongoose.Schema({
  id: String,
  date: String,
  revenue: Number,
  orders: Number,
  newUsers: Number,
  avgOrderValue: Number,
  itemsSold: Number,
  returnsProcessed: Number,
  disputesResolved: Number
}, {
  timestamps: true
});

module.exports = mongoose.model('Statistic', StatisticSchema);
