const { body, param, validationResult } = require('express-validator');

// Validation rules for creating a review
exports.validateReviewCreate = [
  body('product')
    .isMongoId()
    .withMessage('Please provide a valid product ID'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('title')
    .isLength({ min: 3, max: 100 })
    .withMessage('Review title must be between 3 and 100 characters'),
  body('comment')
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
