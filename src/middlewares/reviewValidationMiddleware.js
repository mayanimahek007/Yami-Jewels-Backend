const { body, param, validationResult } = require('express-validator');

// Validation rules for creating a review
exports.validateReviewCreate = [
  body('product')
    .optional()
    .isMongoId()
    .withMessage('Please provide a valid product ID'),
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('title')
    .optional()
    .isLength({ min: 3, max: 100 })
    .withMessage('Review title must be between 3 and 100 characters'),
  body('comment')
    .optional()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Review comment must be between 10 and 1000 characters'),
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array'),
  body('images.*.url')
    .optional()
    .isURL()
    .withMessage('Please provide valid image URLs'),
  (req, res, next) => {
    const errors = validationResult(req);
    
    // Check if this is an image-only review (admin uploading only images)
    const isAdmin = req.user && req.user.role === 'admin';
    const hasImages = (req.files && req.files.length > 0) || (req.body.images && req.body.images.length > 0);
    const hasProduct = req.body.product && req.body.product.trim() !== '';
    const hasRating = req.body.rating !== undefined && req.body.rating !== null && req.body.rating !== '';
    const hasTitle = req.body.title && req.body.title.trim() !== '';
    const hasComment = req.body.comment && req.body.comment.trim() !== '';
    
    const isImageOnly = isAdmin && hasImages && !hasProduct && !hasRating && !hasTitle && !hasComment;
    
    // For image-only reviews, filter out errors for missing fields and skip validation
    if (isImageOnly) {
      // Only validate that images exist
      if (!hasImages) {
        return res.status(400).json({
          status: 'fail',
          message: 'At least one image is required for image-only reviews'
        });
      }
      // Filter out errors for product, rating, title, comment fields
      const filteredErrors = errors.array().filter(err => 
        !['product', 'rating', 'title', 'comment'].includes(err.path)
      );
      
      // If there are other errors (like invalid image URLs), return them
      if (filteredErrors.length > 0) {
        return res.status(400).json({
          status: 'fail',
          errors: filteredErrors
        });
      }
      
      return next();
    }
    
    // For regular reviews, validate all required fields
    if (!hasProduct) {
      return res.status(400).json({
        status: 'fail',
        message: 'Product ID is required'
      });
    }
    if (!hasRating) {
      return res.status(400).json({
        status: 'fail',
        message: 'Rating is required'
      });
    }
    if (!hasTitle) {
      return res.status(400).json({
        status: 'fail',
        message: 'Title is required'
      });
    }
    if (!hasComment) {
      return res.status(400).json({
        status: 'fail',
        message: 'Comment is required'
      });
    }
    
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'fail',
        errors: errors.array()
      });
    }
    next();
  }
];

// Validation rules for updating a review
exports.validateReviewUpdate = [
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('title')
    .optional()
    .isLength({ min: 3, max: 100 })
    .withMessage('Review title must be between 3 and 100 characters'),
  body('comment')
    .optional()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Review comment must be between 10 and 1000 characters'),
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array'),
  body('images.*.url')
    .optional()
    .isURL()
    .withMessage('Please provide valid image URLs'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'fail',
        errors: errors.array()
      });
    }
    next();
  }
];

// Validation for product ID parameter
exports.validateProductId = [
  param('productId')
    .isMongoId()
    .withMessage('Please provide a valid product ID'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'fail',
        errors: errors.array()
      });
    }
    next();
  }
];

// Validation for review ID parameter
exports.validateReviewId = [
  param('id')
    .isMongoId()
    .withMessage('Please provide a valid review ID'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'fail',
        errors: errors.array()
      });
    }
    next();
  }
];
