const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  id: String,
  username: {
    type: String,
    required: [true, 'Please add a username'],
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Please add a password']
  },
  role: {
    type: String,
    enum: ['admin', 'user', 'seller'],
    default: 'user'
  },
  fullname: {
    type: String,
    required: [true, 'Please add a full name']
  },
  email: {
    type: String,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ],
    default: null
  },
  avatarURL: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', UserSchema);
