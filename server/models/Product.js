const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  id: String,
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true
  },
  visible: {
    type: Boolean,
    default: true
  },
  sellerId: {
    type: String, // Keep as string for now to match migration, or use mongoose.Schema.ObjectId
    required: true
  },
  categoryId: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
    required: [true, 'Please add a price']
  },
  images: [String],
  voucher: {
    type: String,
    default: null
  },
  description: {
    type: String,
    default: null
  },
  isAuction: {
    type: Boolean,
    default: false
  },
  auctionEndTime: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', ProductSchema);
