const Diamond = require('../models/diamondModel');
const Wishlist = require('../models/wishlistModel');
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

// Get distinct diamond attributes: shape, color, clarity, cut, price range
exports.getDiamondAttributes = async (req, res, next) => {
  try {
    const shapes = await Diamond.distinct('Shape');
    const colors = await Diamond.distinct('Color');
    const clarities = await Diamond.distinct('Clarity');
    const cuts = await Diamond.distinct('Cut');

    // For price range, get min and max of regularPrice and salePrice
    const priceAggregation = await Diamond.aggregate([
      {
        $group: {
          _id: null,
          minRegularPrice: { $min: '$regularPrice' },
          maxRegularPrice: { $max: '$regularPrice' },
          minSalePrice: { $min: '$salePrice' },
          maxSalePrice: { $max: '$salePrice' }
        }
      }
    ]);

    const priceRange = priceAggregation[0] || {
      minRegularPrice: 0,
      maxRegularPrice: 0,
      minSalePrice: 0,
      maxSalePrice: 0
    };

    res.status(200).json({
      status: 'success',
      data: {
        shapes,
        colors,
        clarities,
        cuts,
        priceRange
      }
    });
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};

// Search diamonds with advanced filtering
exports.searchDiamonds = async (req, res, next) => {
  try {
    const {
      shape,
      color,
      clarity,
      cut,
      minPrice,
      maxPrice,
      minWeight,
      maxWeight,
      bestSeller,
      searchTerm
    } = req.query;

    // Build query object
    let query = {};

    // Filter by shape
    if (shape && shape !== 'all') {
      query.Shape = { $in: shape.split(',') };
    }

    // Filter by color
    if (color && color !== 'all') {
      query.Color = { $in: color.split(',') };
    }

    // Filter by clarity
    if (clarity && clarity !== 'all') {
      query.Clarity = { $in: clarity.split(',') };
    }

    // Filter by cut
    if (cut && cut !== 'all') {
      query.Cut = { $in: cut.split(',') };
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      query.salePrice = {};
      if (minPrice) query.salePrice.$gte = parseFloat(minPrice);
      if (maxPrice) query.salePrice.$lte = parseFloat(maxPrice);
    }

    // Filter by weight range
    if (minWeight || maxWeight) {
      query.Weight = {};
      if (minWeight) query.Weight.$gte = parseFloat(minWeight);
      if (maxWeight) query.Weight.$lte = parseFloat(maxWeight);
    }

    // Filter by best seller
    if (bestSeller === 'true') {
      query.bestSeller = true;
    }

    // Search by name or description
    if (searchTerm) {
      query.$or = [
        { name: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } }
      ];
    }

    // Build aggregation pipeline for more complex queries
    const aggregationPipeline = [
      { $match: query },
      {
        $addFields: {
          numericWeight: {
            $convert: {
              input: "$Weight",
              to: "decimal",
              onError: 0
            }
          }
        }
      }
    ];

    // Execute aggregation
    let diamonds = await Diamond.aggregate(aggregationPipeline);

    // Apply sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      diamonds = diamonds.sort((a, b) => {
        if (sortBy.includes('price')) {
          return sortBy.includes('-') ?
            b.salePrice - a.salePrice :
            a.salePrice - b.salePrice;
        }
        if (sortBy.includes('weight')) {
          return sortBy.includes('-') ?
            b.numericWeight - a.numericWeight :
            a.numericWeight - b.numericWeight;
        }
        return 0;
      });
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const skip = (page - 1) * limit;

    const paginatedDiamonds = diamonds.slice(skip, skip + limit);
    const total = diamonds.length;
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      status: 'success',
      data: {
        diamonds: paginatedDiamonds,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit
        }
      }
    });
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};

// Get diamonds by name (exact or partial match)
exports.getDiamondsByName = async (req, res, next) => {
  try {
    const { Shape } = req.query;

    if (!Shape) {
      return next(new AppError('Please provide a diamond name to search', 400));
    }

    // Create case-insensitive search query
    const query = {
      Shape: { $regex: Shape, $options: 'i' }
    };

    const diamonds = await Diamond.find(query)
      .select('-__v')
      .sort({ Shape: 1 });

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


exports.addDiamondToWishlist = async (req, res, next) => {
  try {
    const { diamondId } = req.body;

    const diamond = await Diamond.findById(diamondId);
    if (!diamond) return next(new AppError('No diamond found with that ID', 404));

    const existing = await Wishlist.findOne({
      user: req.user._id,
      $or: [
        { diamond: diamondId },
        { product: diamondId } // Also check if it exists as product
      ]
    });
    if (existing) return next(new AppError('Diamond already in wishlist', 400));

    const wishlistItem = await Wishlist.create({
      user: req.user._id,
      diamond: diamondId,
      product: null // Explicitly set to null
    });

    res.status(201).json({ status: 'success', data: { wishlistItem } });
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};

exports.getDiamondWishlist = async (req, res, next) => {
  try {
    const wishlist = await Wishlist.find({
      user: req.user._id,
      diamond: { $exists: true }
    }).populate('diamond');

    res.status(200).json({
      status: 'success',
      results: wishlist.length,
      data: { wishlist }
    });
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};

// Remove diamond from wishlist
exports.removeDiamondFromWishlist = async (req, res, next) => {
  try {
    const { diamondId } = req.params;

    const wishlistItem = await Wishlist.findOneAndDelete({
      user: req.user._id,
      diamond: diamondId
    });

    if (!wishlistItem) return next(new AppError('Diamond not found in wishlist', 404));

    res.status(204).json({ status: 'success', data: null });
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};
