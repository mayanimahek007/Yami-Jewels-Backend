const Diamond = require('../models/diamondModel');
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

    // Process images - extract URLs from objects if they come as objects
    let processedImages = [];
    if (images) {
      if (Array.isArray(images)) {
        processedImages = images.map(image => {
          // If image is an object with url property, extract the url
          if (typeof image === 'object' && image.url) {
            return image.url;
          }
          // If image is already a string, use it as-is
          return typeof image === 'string' ? image : '';
        }).filter(url => url); // Remove empty strings
      } else if (typeof images === 'string') {
        // Handle case where images might be a single string
        processedImages = [images];
      }
    }

    // Create new diamond
    const newDiamond = await Diamond.create({
      name,
      sku,
      size,
      stock,
      regularPrice,
      salePrice,
      images: processedImages,
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
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObj[el]);

    // Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

    let query = Diamond.find(JSON.parse(queryStr));

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
    const diamond = await Diamond.findById(req.params.id);

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
    const diamond = await Diamond.findByIdAndUpdate(
      req.params.id,
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
    const diamond = await Diamond.findByIdAndDelete(req.params.id);

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

