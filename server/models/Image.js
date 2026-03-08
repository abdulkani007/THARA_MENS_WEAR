const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true,
    index: true
  },
  imageData: {
    type: String,
    required: true
  },
  contentType: {
    type: String,
    default: 'image/jpeg'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ProductImage', imageSchema);
