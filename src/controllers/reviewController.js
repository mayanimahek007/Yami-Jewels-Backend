const Review = require('../models/reviewModel');
const Product = require('../models/productModel');
const { AppError } = require('../utils/errorHandler');

// Create a new review
exports.createReview = async (req, res, next) => {
  try {
    const { product, rating, title, comment, images } = req.body;

    // Check if product exists
    const productExists = await Product.findById(product);
    if (!productExists) {
      return next(new AppError('No product found with that ID', 404));
    }

    // Check if user has already reviewed this product
    const existingReview = await Review.findOne({
      product,
      user: req.user._id
    });

    if (existingReview) {
      return next(new AppError('You have already reviewed this product', 400));
    }

    // Create new review
    const newReview = await Review.create({
      product,
      user: req.user._id,
      rating,
      title,
      comment,
      images: images || []
    });

    // Populate user data
    await newReview.populate('user', 'name');

    res.status(201).json({
      status: 'success',
      data: {
        review: newReview
      }
    });
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};

// Get all reviews for a product
exports.getAllReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;
    
    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return next(new AppError('No product found with that ID', 404));
    }

    // Build query
    const queryObj = { product: productId };
    
    // Filter by rating if provided
    if (req.query.rating) {
      queryObj.rating = parseInt(req.query.rating);
    }

    let query = Review.find(queryObj).populate('user', 'name');

    // Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    const reviews = await query;

    // Get total count for pagination
    const totalReviews = await Review.countDocuments(queryObj);

    res.status(200).json({
      status: 'success',
      results: reviews.length,
      total: totalReviews,
      data: {
        reviews
      }
    });
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};

// Get a single review
exports.getReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id).populate('user', 'name');

    if (!review) {
      return next(new AppError('No review found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        review
      }
    });
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};

// Update a review
exports.updateReview = async (req, res, next) => {
  try {
    const { rating, title, comment, images } = req.body;

    const review = await Review.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { rating, title, comment, images, updatedAt: Date.now() },
      {
        new: true,
        runValidators: true
      }
    );

    if (!review) {
      return next(new AppError('No review found with that ID or you are not authorized to update it', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        review
      }
    });
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};

// Delete a review
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!review) {
      return next(new AppError('No review found with that ID or you are not authorized to delete it', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};

// Get user's reviews
exports.getMyReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ user: req.user._id })
      .populate('product', 'name images')
      .sort('-createdAt');

    res.status(200).json({
      status: 'success',
      results: reviews.length,
      data: {
        reviews
      }
    });
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};

// Mark review as helpful
exports.markHelpful = async (req, res, next) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { $inc: { helpful: 1 } },
      { new: true }
    );

    if (!review) {
      return next(new AppError('No review found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        review
      }
    });
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};
