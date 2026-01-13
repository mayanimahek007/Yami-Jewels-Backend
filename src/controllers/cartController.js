const Cart = require('../models/cartModel');
const Product = require('../models/productModel');
const { AppError } = require('../utils/errorHandler');

// Get user's cart
const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');

    if (!cart) {
      return res.status(200).json({
        status: 'success',
        data: {
          items: [],
          totalAmount: 0
        }
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        items: cart.items,
        totalAmount: cart.totalAmount
      }
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch cart'
    });
  }
};

// Add item to cart
const addToCart = async (req, res) => {
  try {
    const { productId, quantity, selectedMetalVariation, customizations } = req.body;

    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found'
      });
    }

    // Check stock availability
    if (product.stock < quantity) {
      return res.status(400).json({
        status: 'error',
        message: 'Insufficient stock'
      });
    }

    // Calculate price based on metal variation or default
    let itemPrice = product.salePrice || product.regularPrice;
    if (!itemPrice) {
      return res.status(400).json({
        status: 'error',
        message: 'Product must have either a regular price or sale price'
      });
    }
    if (selectedMetalVariation && product.metalVariations) {
      const variation = product.metalVariations.find(v =>
        v.type === selectedMetalVariation.type &&
        v.karat === selectedMetalVariation.karat
      );
      if (variation) {
        itemPrice = variation.salePrice || variation.regularPrice || product.salePrice || product.regularPrice;
      }
    }

    // Find or create cart
    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      cart = new Cart({
        user: req.user.id,
        items: []
      });
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(item =>
      item.product.toString() === productId &&
      JSON.stringify(item.selectedMetalVariation) === JSON.stringify(selectedMetalVariation)
    );

    if (existingItemIndex > -1) {
      // Update quantity
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      cart.items.push({
        product: productId,
        quantity,
        selectedMetalVariation,
        customizations,
        price: itemPrice
      });
    }

    await cart.save();
    await cart.populate('items.product');

    res.status(200).json({
      status: 'success',
      message: 'Item added to cart',
      data: {
        items: cart.items,
        totalAmount: cart.totalAmount
      }
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to add item to cart'
    });
  }
};

// Update cart item
const updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity, ringSize } = req.body;

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({
        status: 'error',
        message: 'Cart not found'
      });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({
        status: 'error',
        message: 'Item not found in cart'
      });
    }

    // If quantity is 0 or less, remove the item
    if (quantity <= 0) {
      cart.items.pull(itemId);
      await cart.save();
      await cart.populate('items.product');
      return res.status(200).json({
        status: 'success',
        message: 'Item removed from cart',
        data: {
          items: cart.items,
          totalAmount: cart.totalAmount
        }
      });
    }

    // Check stock availability
    const product = await Product.findById(item.product);
    if (product && product.stock < quantity) {
      return res.status(400).json({
        status: 'error',
        message: 'Insufficient stock'
      });
    }

    item.quantity = quantity;

    // Update ring size if provided
    if (ringSize !== undefined) {
      item.customizations = item.customizations || {};
      item.customizations.ringSize = ringSize;
    }

    await cart.save();
    await cart.populate('items.product');

    res.status(200).json({
      status: 'success',
      message: 'Cart item updated',
      data: {
        items: cart.items,
        totalAmount: cart.totalAmount
      }
    });
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update cart item'
    });
  }
};

// Remove item from cart
const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({
        status: 'error',
        message: 'Cart not found'
      });
    }

    cart.items.pull(itemId);
    await cart.save();
    await cart.populate('items.product');

    res.status(200).json({
      status: 'success',
      message: 'Item removed from cart',
      data: {
        items: cart.items,
        totalAmount: cart.totalAmount
      }
    });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to remove item from cart'
    });
  }
};

// Clear cart
const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({
        status: 'error',
        message: 'Cart not found'
      });
    }

    cart.items = [];
    await cart.save();

    res.status(200).json({
      status: 'success',
      message: 'Cart cleared',
      data: {
        items: [],
        totalAmount: 0
      }
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to clear cart'
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};
