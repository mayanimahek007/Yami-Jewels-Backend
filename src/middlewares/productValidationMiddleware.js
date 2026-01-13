const { AppError } = require('../utils/errorHandler');

// Validate product creation
exports.validateProductCreate = (req, res, next) => {
  const { name, sku, categoryName, regularPrice, stock } = req.body;

  // Check if required fields are present
  if (!name) {
    return next(new AppError('Please provide product name', 400));
  }

  if (!sku) {
    return next(new AppError('Please provide product SKU', 400));
  }

  if (!categoryName) {
    return next(new AppError('Please provide category name', 400));
  }

  // Validate prices (regularPrice is optional)
  if (regularPrice !== undefined && regularPrice !== null && regularPrice !== '' && (isNaN(regularPrice) || regularPrice <= 0)) {
    return next(new AppError('Regular price must be a positive number', 400));
  }

  if (req.body.salePrice !== undefined && (isNaN(req.body.salePrice) || req.body.salePrice <= 0)) {
    return next(new AppError('Sale price must be a positive number', 400));
  }

  // Validate stock
  if (stock !== undefined && (isNaN(stock) || stock < 0)) {
    return next(new AppError('Stock must be a non-negative number', 400));
  }

  // Validate metal variations if provided
  if (req.body.metalVariations) {
    if (!Array.isArray(req.body.metalVariations)) {
      return next(new AppError('Metal variations must be an array', 400));
    }

    for (const variation of req.body.metalVariations) {
      if (!variation.type) {
        return next(new AppError('Each metal variation must have a type', 400));
      }
      
      // Validate metal variation prices if provided
      if (variation.regularPrice !== undefined && (isNaN(variation.regularPrice) || variation.regularPrice <= 0)) {
        return next(new AppError('Metal variation regular price must be a positive number', 400));
      }
      
      if (variation.salePrice !== undefined && (isNaN(variation.salePrice) || variation.salePrice <= 0)) {
        return next(new AppError('Metal variation sale price must be a positive number', 400));
      }
    }
  }

  // Images validation is now handled by fileUploadMiddleware

  next();
};

// Validate product update
exports.validateProductUpdate = (req, res, next) => {
  const { regularPrice, salePrice, stock } = req.body;

  // Validate prices if provided
  if (regularPrice !== undefined && (isNaN(regularPrice) || regularPrice <= 0)) {
    return next(new AppError('Regular price must be a positive number', 400));
  }

  if (salePrice !== undefined && (isNaN(salePrice) || salePrice <= 0)) {
    return next(new AppError('Sale price must be a positive number', 400));
  }

  // Validate stock if provided
  if (stock !== undefined && (isNaN(stock) || stock < 0)) {
    return next(new AppError('Stock must be a non-negative number', 400));
  }

  // Validate metal variations if provided
  if (req.body.metalVariations) {
    if (!Array.isArray(req.body.metalVariations)) {
      return next(new AppError('Metal variations must be an array', 400));
    }

    for (const variation of req.body.metalVariations) {
      if (!variation.type) {
        return next(new AppError('Each metal variation must have a type', 400));
      }
      
      // Validate metal variation prices if provided
      if (variation.regularPrice !== undefined && (isNaN(variation.regularPrice) || variation.regularPrice <= 0)) {
        return next(new AppError('Metal variation regular price must be a positive number', 400));
      }
      
      if (variation.salePrice !== undefined && (isNaN(variation.salePrice) || variation.salePrice <= 0)) {
        return next(new AppError('Metal variation sale price must be a positive number', 400));
      }
    }
  }

  // Images validation is now handled by fileUploadMiddleware

  next();
};

// Validate wishlist operations
exports.validateWishlistOperation = (req, res, next) => {
  const { productId } = req.body;

  if (!productId) {
    return next(new AppError('Please provide product ID', 400));
  }

  next();
};