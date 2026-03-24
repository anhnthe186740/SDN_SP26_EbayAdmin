const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  id: String,
  title: String,
  message: String,
  type: String,
  userId: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', NotificationSchema);
