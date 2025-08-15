const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.ObjectId,
    ref: 'Product',
    required: [true, 'Review must belong to a product']
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Review must belong to a user']
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: [true, 'Please provide a rating']
  },
  title: {
    type: String,
    required: [true, 'Please provide a review title'],
    trim: true,
    maxlength: [100, 'Review title cannot exceed 100 characters']
  },
  comment: {
    type: String,
    required: [true, 'Please provide a review comment'],
    trim: true,
    maxlength: [1000, 'Review comment cannot exceed 1000 characters']
  },
  images: [String],
  verified: {
    type: Boolean,
    default: false
  },
  helpful: {
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

// Index for faster queries
reviewSchema.index({ product: 1, user: 1 }, { unique: true });
reviewSchema.index({ product: 1, rating: 1 });

// Update the updatedAt field before saving
reviewSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to calculate average rating
reviewSchema.statics.calcAverageRatings = async function(productId) {
  try {
    const stats = await this.aggregate([
      {
        $match: { product: productId }
      },
      {
        $group: {
          _id: '$product',
          nRating: { $sum: 1 },
          avgRating: { $avg: '$rating' }
        }
      }
    ]);

    if (stats.length > 0) {
      await mongoose.model('Product').findByIdAndUpdate(productId, {
        ratingsQuantity: stats[0].nRating,
        ratingsAverage: Math.round(stats[0].avgRating * 10) / 10
      });
    } else {
      await mongoose.model('Product').findByIdAndUpdate(productId, {
        ratingsQuantity: 0,
        ratingsAverage: 4.5
      });
    }
  } catch (error) {
    console.error('Error calculating average ratings:', error);
  }
};

// Call calcAverageRatings after save
reviewSchema.post('save', function() {
  if (this.product) {
    this.constructor.calcAverageRatings(this.product);
  }
});

// Call calcAverageRatings after deleteOne and deleteMany
reviewSchema.post('deleteOne', { document: true, query: false }, function() {
  if (this.product) {
    this.constructor.calcAverageRatings(this.product);
  }
});

reviewSchema.post('deleteMany', { document: true, query: false }, function(docs) {
  if (docs && docs.length > 0) {
    const productIds = [...new Set(docs.map(doc => doc.product))];
    productIds.forEach(productId => {
      this.constructor.calcAverageRatings(productId);
    });
  }
});

// Handle findOneAndDelete, findOneAndUpdate, and findOneAndRemove
reviewSchema.post(/^findOneAnd/, async function(doc) {
  if (doc && doc.product) {
    await doc.constructor.calcAverageRatings(doc.product);
  }
});

// Handle updateMany and deleteMany operations
reviewSchema.post('updateMany', async function() {
  // For updateMany, we need to find affected products
  const affectedProducts = await this.model.distinct('product', this.getQuery());
  affectedProducts.forEach(productId => {
    this.model.calcAverageRatings(productId);
  });
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
