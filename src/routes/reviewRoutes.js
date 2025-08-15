const express = require('express');
const reviewController = require('../controllers/reviewController');
const authMiddleware = require('../middlewares/authMiddleware');
const reviewValidation = require('../middlewares/reviewValidationMiddleware');

const router = express.Router();

// Public routes - Get reviews
router.get('/product/:productId', reviewValidation.validateProductId, reviewController.getAllReviews);
router.get('/:id', reviewValidation.validateReviewId, reviewController.getReview);

// Protected routes - Require authentication
router.use(authMiddleware.protect);

// User's own reviews
router.get('/me', reviewController.getMyReviews);

// Create, update, and delete reviews
router.post('/', reviewValidation.validateReviewCreate, reviewController.createReview);
router.patch('/:id', reviewValidation.validateReviewId, reviewValidation.validateReviewUpdate, reviewController.updateReview);
router.delete('/:id', reviewValidation.validateReviewId, reviewController.deleteReview);

// Mark review as helpful
router.patch('/:id/helpful', reviewValidation.validateReviewId, reviewController.markHelpful);

module.exports = router;
