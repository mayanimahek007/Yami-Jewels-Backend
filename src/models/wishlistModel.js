const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Wishlist must belong to a user']
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  diamond: {
    type: mongoose.Schema.ObjectId,
    ref: 'Diamond'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure a user can only wishlist a product or diamond once
wishlistSchema.index({ user: 1, product: 1 }, { unique: true, partialFilterExpression: { product: { $exists: true } } });
wishlistSchema.index({ user: 1, diamond: 1 }, { unique: true, partialFilterExpression: { diamond: { $exists: true } } });

const Wishlist = mongoose.model('Wishlist', wishlistSchema);

module.exports = Wishlist;