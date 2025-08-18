const express = require('express');
const reviewController = require('../controllers/reviewController');
const authMiddleware = require('../middlewares/authMiddleware');
const reviewValidation = require('../middlewares/reviewValidationMiddleware');
const { handleReviewImages } = require('../middlewares/reviewImageUploadMiddleware');

const router = express.Router();

// Public routes
router.get('/', reviewController.getAllReviews); // ✅ all reviews across all products
router.get('/product/:productId', reviewValidation.validateProductId, reviewController.getProductReviews); // ✅ specific product
router.get('/:id', reviewValidation.validateReviewId, reviewController.getReview);

// Protected routes
router.use(authMiddleware.protect);

router.get('/me', reviewController.getMyReviews);

router.post(
  '/',
  handleReviewImages,
  reviewValidation.validateReviewCreate,
  reviewController.createReview
);

router.patch(
  '/:id',
  handleReviewImages,
  reviewValidation.validateReviewId,
  reviewValidation.validateReviewUpdate,
  reviewController.updateReview
);

router.delete(
  '/:id',
  reviewValidation.validateReviewId,
  reviewController.deleteReview
);

router.patch(
  '/:id/helpful',
  reviewValidation.validateReviewId,
  reviewController.markHelpful
);

module.exports = router;
