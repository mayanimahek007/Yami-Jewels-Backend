const express = require('express');
const {
  getUserOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  getAllOrders
} = require('../controllers/orderController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

const router = express.Router();

// All order routes require authentication
router.use(protect);

// Get user's orders
router.get('/', getUserOrders);

// Get all orders (Admin only)
router.get('/admin/all', restrictTo('admin'), getAllOrders);

// Get specific order by ID
router.get('/:id', getOrderById);

// Create new order from cart
router.post('/', createOrder);

// Update order status (Admin only)
router.patch('/:id/status', restrictTo('admin'), updateOrderStatus);

module.exports = router;
