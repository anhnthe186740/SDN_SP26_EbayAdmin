const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
  id: String,
  name: String,
  email: String,
  role: String,
  ip: String,
  '2fa': Boolean
}, {
  timestamps: true
});

module.exports = mongoose.model('Admin', AdminSchema);
