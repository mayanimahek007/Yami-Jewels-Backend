const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'FAQ question is required'],
    trim: true,
    maxlength: [200, 'FAQ question cannot exceed 200 characters']
  },
  answer: {
    type: String,
    default: '',
    trim: true,
    maxlength: [2000, 'FAQ answer cannot exceed 2000 characters']
  },
  submittedByName: {
    type: String,
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters'],
    default: ''
  },
  submittedByEmail: {
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [150, 'Email cannot exceed 150 characters'],
    default: ''
  },
  isUserSubmitted: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
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

faqSchema.index({ isActive: 1, order: 1, createdAt: -1 });

faqSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

faqSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

const FAQ = mongoose.model('FAQ', faqSchema);

module.exports = FAQ;
