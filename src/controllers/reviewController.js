const Review = require('../models/reviewModel');
const Product = require('../models/productModel');
const { AppError } = require('../utils/errorHandler');

// Create a new review
exports.createReview = async (req, res, next) => {
  try {
    const { product, rating, title, comment } = req.body;
    const isAdmin = req.user.role === 'admin';

    // Handle uploaded images
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map((file) => `/images/${file.filename}`);
    }

    // Check if this is an image-only review (admin can create image-only reviews)
    const isImageOnly = isAdmin && images.length > 0 && (!product || !rating || !title || !comment);

    if (isImageOnly) {
      // For image-only reviews, create without product, rating, title, comment
      const newReview = await Review.create({
        user: req.user._id,
        images,
        isImageOnly: true,
      });

      // Populate user data
      await newReview.populate('user', 'name');

      return res.status(201).json({
        status: 'success',
        data: { review: newReview },
      });
    }

    // Regular review validation
    if (!product) {
      return next(new AppError('Please provide a product ID', 400));
    }

    // Check if product exists
    const productExists = await Product.findById(product);
    if (!productExists) {
      return next(new AppError('No product found with that ID', 404));
    }

    // Check if user already reviewed this product (only for regular reviews)
    const existingReview = await Review.findOne({
      product,
      user: req.user._id,
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
      images,
      isImageOnly: false,
    });

    // Populate user data
    await newReview.populate('user', 'name');

    res.status(201).json({
      status: 'success',
      data: { review: newReview },
    });
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};

// ✅ Get all reviews across all products
exports.getAllReviews = async (req, res, next) => {
  try {
    const queryObj = {};

    if (req.query.productId) {
      queryObj.product = req.query.productId;
    }
    if (req.query.rating) {
      queryObj.rating = Number(req.query.rating);
    }

    let query = Review.find(queryObj)
      .populate('user', 'name')
      .populate('product', 'name images');

    // Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Pagination
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);

    const reviews = await query;
    const totalReviews = await Review.countDocuments(queryObj);

    res.status(200).json({
      status: 'success',
      results: reviews.length,
      total: totalReviews,
      currentPage: page,
      totalPages: Math.ceil(totalReviews / limit),
      data: { reviews },
    });
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};

// ✅ Get all reviews for a specific product
exports.getProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      return next(new AppError('No product found with that ID', 404));
    }

    const queryObj = { product: productId };
    if (req.query.rating) {
      queryObj.rating = Number(req.query.rating);
    }

    let query = Review.find(queryObj).populate('user', 'name').sort('-createdAt');

    const reviews = await query;
    const total = await Review.countDocuments(queryObj);

    res.status(200).json({
      status: 'success',
      results: reviews.length,
      total,
      data: { reviews },
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
      data: { review },
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
      { new: true, runValidators: true }
    );

    if (!review) {
      return next(new AppError('No review found with that ID or you are not authorized', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { review },
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
      user: req.user._id,
    });

    if (!review) {
      return next(new AppError('No review found with that ID or you are not authorized', 404));
    }

    res.status(204).json({ status: 'success', data: null });
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
      data: { reviews },
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
      data: { review },
    });
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};
