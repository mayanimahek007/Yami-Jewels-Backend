const Product = require('../models/productModel');
const Wishlist = require('../models/wishlistModel');
const { AppError } = require('../utils/errorHandler');

// Create a new product
exports.createProduct = async (req, res, next) => {
  try {
    const {
      name,
      sku,
      categoryName,
      size,
      stock,
      regularPrice,
      salePrice,
      metalVariations,
      images,
      videoUrl,
      description
    } = req.body;

    // Create new product
    const newProduct = await Product.create({
      name,
      sku,
      categoryName,
      size,
      stock,
      regularPrice,
      salePrice,
      metalVariations,
      images,
      videoUrl,
      description
    });

    res.status(201).json({
      status: 'success',
      data: {
        product: newProduct
      }
    });
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};

// Get all products
exports.getAllProducts = async (req, res, next) => {
  try {
    // Build query
    const queryObj = { ...req.query };
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
    const products = await query;

    // If user is logged in, check which products are in their wishlist
    if (req.user) {
      const userWishlist = await Wishlist.find({ user: req.user._id });
      const wishlistedProductIds = userWishlist.map(item => item.product.toString());

      // Add isWishlisted field to each product
      const productsWithWishlist = products.map(product => {
        const productObj = product.toObject();
        productObj.isWishlisted = wishlistedProductIds.includes(product._id.toString());
        return productObj;
      });

      return res.status(200).json({
        status: 'success',
        results: productsWithWishlist.length,
        data: {
          products: productsWithWishlist
        }
      });
    }

    res.status(200).json({
      status: 'success',
      results: products.length,
      data: {
        products
      }
    });
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};

// Get products by category
exports.getProductsByCategory = async (req, res, next) => {
  try {
    const { categoryName } = req.params;

    const products = await Product.find({ categoryName });

    // If user is logged in, check which products are in their wishlist
    if (req.user) {
      const userWishlist = await Wishlist.find({ user: req.user._id });
      const wishlistedProductIds = userWishlist.map(item => item.product.toString());

      // Add isWishlisted field to each product
      const productsWithWishlist = products.map(product => {
        const productObj = product.toObject();
        productObj.isWishlisted = wishlistedProductIds.includes(product._id.toString());
        return productObj;
      });

      return res.status(200).json({
        status: 'success',
        results: productsWithWishlist.length,
        data: {
          products: productsWithWishlist
        }
      });
    }

    res.status(200).json({
      status: 'success',
      results: products.length,
      data: {
        products
      }
    });
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};

// Get products on sale
exports.getOnSaleProducts = async (req, res, next) => {
  try {
    // Sort by highest discount first
    const products = await Product.find({ discount: { $gt: 0 } }).sort('-discount');

    // If user is logged in, check which products are in their wishlist
    if (req.user) {
      const userWishlist = await Wishlist.find({ user: req.user._id });
      const wishlistedProductIds = userWishlist.map(item => item.product.toString());

      // Add isWishlisted field to each product
      const productsWithWishlist = products.map(product => {
        const productObj = product.toObject();
        productObj.isWishlisted = wishlistedProductIds.includes(product._id.toString());
        return productObj;
      });

      return res.status(200).json({
        status: 'success',
        results: productsWithWishlist.length,
        data: {
          products: productsWithWishlist
        }
      });
    }

    res.status(200).json({
      status: 'success',
      results: products.length,
      data: {
        products
      }
    });
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};


// Get best seller products (products with bestSeller: true)
exports.getBestSellerProducts = async (req, res, next) => {
  try {
    // Only products with bestSeller: true
    const products = await Product.find({ bestSeller: true }).sort('-createdAt').limit(20);

    // If user is logged in, check which products are in their wishlist
    if (req.user) {
      const userWishlist = await Wishlist.find({ user: req.user._id });
      const wishlistedProductIds = userWishlist.map(item => item.product.toString());

      // Add isWishlisted field to each product
      const productsWithWishlist = products.map(product => {
        const productObj = product.toObject();
        productObj.isWishlisted = wishlistedProductIds.includes(product._id.toString());
        return productObj;
      });

      return res.status(200).json({
        status: 'success',
        results: productsWithWishlist.length,
        data: {
          products: productsWithWishlist
        }
      });
    }

    res.status(200).json({
      status: 'success',
      results: products.length,
      data: {
        products
      }
    });
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};

// Get top rated products (highest salePrice + regularPrice)
exports.getTopRatedProducts = async (req, res, next) => {
  try {
    // Products sorted by (salePrice + regularPrice) descending, top 20
    const products = await Product.aggregate([
      {
        $addFields: {
          totalPrice: { $add: [
            { $ifNull: ["$salePrice", 0] },
            { $ifNull: ["$regularPrice", 0] }
          ] }
        }
      },
      { $sort: { totalPrice: -1 } },
      { $limit: 20 }
    ]);
    // Add isWishlisted if user is logged in
    if (req.user) {
      const userWishlist = await Wishlist.find({ user: req.user._id });
      const wishlistedProductIds = userWishlist.map(item => item.product.toString());
      const productsWithWishlist = products.map(product => {
        product.isWishlisted = wishlistedProductIds.includes(product._id.toString());
        return product;
      });
      return res.status(200).json({
        status: 'success',
        results: productsWithWishlist.length,
        data: { products: productsWithWishlist }
      });
    }
    res.status(200).json({
      status: 'success',
      results: products.length,
      data: { products }
    });
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};

// Get a single product
exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return next(new AppError('No product found with that ID', 404));
    }

    // Get reviews for this product
    const reviews = await require('../models/reviewModel').find({ product: product._id })
      .populate('user', 'name')
      .sort('-createdAt')
      .limit(10);

    // If user is logged in, check if product is in their wishlist
    if (req.user) {
      const wishlistItem = await Wishlist.findOne({
        user: req.user._id,
        product: product._id
      });

      const productObj = product.toObject();
      productObj.isWishlisted = !!wishlistItem;
      productObj.reviews = reviews;

      return res.status(200).json({
        status: 'success',
        data: {
          product: productObj
        }
      });
    }

    const productObj = product.toObject();
    productObj.reviews = reviews;

    res.status(200).json({
      status: 'success',
      data: {
        product: productObj
      }
    });
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};

// Update a product
exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!product) {
      return next(new AppError('No product found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        product
      }
    });
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};

// Delete a product
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return next(new AppError('No product found with that ID', 404));
    }

    // Also delete any wishlist entries for this product
    await Wishlist.deleteMany({ product: req.params.id });

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};

// Add product to wishlist
exports.addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return next(new AppError('No product found with that ID', 404));
    }

    // Check if already in wishlist
    const existingWishlistItem = await Wishlist.findOne({
      user: req.user._id,
      product: productId
    });

    if (existingWishlistItem) {
      return next(new AppError('Product already in wishlist', 400));
    }

    // Add to wishlist
    const wishlistItem = await Wishlist.create({
      user: req.user._id,
      product: productId
    });

    res.status(201).json({
      status: 'success',
      data: {
        wishlistItem
      }
    });
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};

// Get user's wishlist
exports.getWishlist = async (req, res, next) => {
  try {
    const wishlist = await Wishlist.find({ user: req.user._id }).populate('product');

    res.status(200).json({
      status: 'success',
      results: wishlist.length,
      data: {
        wishlist
      }
    });
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};

// Remove from wishlist
exports.removeFromWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const wishlistItem = await Wishlist.findOneAndDelete({
      user: req.user._id,
      product: productId
    });

    if (!wishlistItem) {
      return next(new AppError('Product not found in wishlist', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};