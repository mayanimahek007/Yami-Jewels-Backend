const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide product name'],
    trim: true
  },
  sku: {
    type: String,
    required: [true, 'Please provide product SKU'],
    trim: true,
    unique: true
  },
  categoryName: {
    type: String,
    required: [true, 'Please provide category name'],
    trim: true
  },
  size: {
    type: String,
    trim: true
  },
  discount: {
    type: Number,
    default: 0
  },
  bestSeller: {
    type: Boolean,
    default: false
  },
  stock: {
    type: Number,
    required: [true, 'Please provide stock quantity'],
    default: 0
  },
  regularPrice: {
    type: Number,
    required: [true, 'Please provide regular price']
  },
  salePrice: {
    type: Number
  },
  metalVariations: [{
    type: {
      type: String,
      required: [true, 'Please provide metal type']
    },
    color: String,
    karat: String,
    regularPrice: {
      type: Number
    },
    salePrice: {
      type: Number
    },
    additionalInfo: String
  }],
  images: [{
    url: {
      type: String,
      required: [true, 'Please provide image URL']
    },
    alt: String
  }],
  videoUrl: String,
  description: {
    type: String,
    trim: true
  },
  isWishlisted: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
productSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;