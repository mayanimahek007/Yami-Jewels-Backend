const mongoose = require('mongoose');

const diamondSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Diamond name is required'],
    trim: true
  },
  sku: {
    type: String,
    required: [true, 'SKU is required'],
    unique: true,
    trim: true
  },
  size: {
    type: String,
    trim: true
  },
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock cannot be negative']
  },
  regularPrice: {
    type: Number,
    required: [true, 'Regular price is required'],
    min: [0, 'Price cannot be negative']
  },
  salePrice: {
    type: Number,
    required: [true, 'Sale price is required'],
    min: [0, 'Price cannot be negative']
  },
  images: [{
    type: String
  }],
  videoUrl: {
    type: String
  },
  description: {
    type: String,
    trim: true
  },
  discount: {
    type: Number,
    default: 0,
    min: [0, 'Discount cannot be negative'],
    max: [100, 'Discount cannot exceed 100%']
  },
  bestSeller: {
    type: Boolean,
    default: false
  },
  Stone_NO: {
    type: String,
    default: "",
    trim: true
  },
  Shape: {
    type: String,
    default: "",
    trim: true
  },
  Weight: {
    type: String,
    default: "",
    trim: true
  },
  Color: {
    type: String,
    default: "",
    trim: true
  },
  FancyColor: {
    type: String,
    default: "",
    trim: true
  },
  Clarity: {
    type: String,
    default: "",
    trim: true
  },
  Cut: {
    type: String,
    default: "",
    trim: true
  },
  Polish: {
    type: String,
    default: "",
    trim: true
  }
}, {
  timestamps: true
});

// Index for better query performance
diamondSchema.index({ sku: 1 });
diamondSchema.index({ bestSeller: 1 });
diamondSchema.index({ salePrice: 1 });

const Diamond = mongoose.model('Diamond', diamondSchema);

module.exports = Diamond;
