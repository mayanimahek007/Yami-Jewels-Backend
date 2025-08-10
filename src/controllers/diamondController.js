const Product = require('../models/productModel');
const { AppError } = require('../utils/errorHandler');

// Create a new diamond
exports.createDiamond = async (req, res, next) => {
  try {
    const {
      name,
      sku,
      size,
      stock,
      regularPrice,
      salePrice,
      images,
      videoUrl,
      description,
      discount,
      bestSeller,
      Stone_NO,
      Shape,
      Weight,
      Color,
      Clarity,
      Cut,
      Polish
    } = req.body;

    // Create new diamond with categoryName as 'diamond'
    const newDiamond = await Product.create({
      name,
      sku,
      categoryName: 'diamond',
      size,
      stock,
      regularPrice,
      salePrice,
      images,
      videoUrl,
      description,
      discount: discount || 0,
      bestSeller: bestSeller || false,
      Stone_NO: Stone_NO || "",
      Shape: Shape || "",
      Weight: Weight || "",
      Color: Color || "",
      Clarity: Clarity || "",
      Cut: Cut || "",
      Polish: Polish || ""
    });

    res.status(201).json({
      status: 'success',
      data: {
        diamond: newDiamond
      }
    });
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};

// Get all diamonds
exports.getAllDiamonds = async (req, res, next) => {
  try {
    // Build query for diamonds only
    const queryObj = { categoryName: 'diamond', ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObj[el]);

    // Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

    let query = Product.find(JSON.parse(queryStr));

    // Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Field limiting
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    } else {
      query = query.select('-__v');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 100;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    // Execute query
    const diamonds = await query;

    res.status(200).json({
      status: 'success',
      results: diamonds.length,
      data: {
        diamonds
      }
    });
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};

// Get diamond by ID
exports.getDiamondById = async (req, res, next) => {
  try {
    const diamond = await Product.findOne({
      _id: req.params.id,
      categoryName: 'diamond'
    });

    if (!diamond) {
      return next(new AppError('No diamond found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        diamond
      }
    });
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};

// Update diamond
exports.updateDiamond = async (req, res, next) => {
  try {
    const diamond = await Product.findOneAndUpdate(
      { _id: req.params.id, categoryName: 'diamond' },
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!diamond) {
      return next(new AppError('No diamond found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        diamond
      }
    });
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};

// Delete diamond
exports.deleteDiamond = async (req, res, next) => {
  try {
    const diamond = await Product.findOneAndDelete({
      _id: req.params.id,
      categoryName: 'diamond'
    });

    if (!diamond) {
      return next(new AppError('No diamond found with that ID', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};

// Get diamonds by price range
exports.getDiamondsByPriceRange = async (req, res, next) => {
  try {
    const { minPrice, maxPrice } = req.query;

    let priceFilter = { categoryName: 'diamond' };
    
    if (minPrice || maxPrice) {
      priceFilter.salePrice = {};
      if (minPrice) priceFilter.salePrice.$gte = parseFloat(minPrice);
      if (maxPrice) priceFilter.salePrice.$lte = parseFloat(maxPrice);
    }

    const diamonds = await Product.find(priceFilter).sort('salePrice');

    res.status(200).json({
      status: 'success',
      results: diamonds.length,
      data: {
        diamonds
      }
    });
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};

// Get best seller diamonds
exports.getBestSellerDiamonds = async (req, res, next) => {
  try {
    const diamonds = await Product.find({
      categoryName: 'diamond',
      bestSeller: true
    }).sort('-createdAt').limit(20);

    res.status(200).json({
      status: 'success',
      results: diamonds.length,
      data: {
        diamonds
      }
    });
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};

// Get diamonds on sale
exports.getOnSaleDiamonds = async (req, res, next) => {
  try {
    const diamonds = await Product.find({
      categoryName: 'diamond',
      discount: { $gt: 0 }
    }).sort('-discount');

    res.status(200).json({
      status: 'success',
      results: diamonds.length,
      data: {
        diamonds
      }
    });
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};
