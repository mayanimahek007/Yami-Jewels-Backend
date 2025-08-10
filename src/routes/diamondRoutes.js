const express = require('express');
const diamondController = require('../controllers/diamondController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Public routes
router.get('/', diamondController.getAllDiamonds);
router.get('/price-range', diamondController.getDiamondsByPriceRange);
router.get('/best-sellers', diamondController.getBestSellerDiamonds);
router.get('/on-sale', diamondController.getOnSaleDiamonds);
router.get('/:id', diamondController.getDiamondById);

// Protected routes (require authentication)
router.post(
  '/',
  authMiddleware.protect,
  diamondController.createDiamond
);

router.patch(
  '/:id',
  authMiddleware.protect,
  diamondController.updateDiamond
);

router.delete(
  '/:id',
  authMiddleware.protect,
  diamondController.deleteDiamond
);

module.exports = router;
