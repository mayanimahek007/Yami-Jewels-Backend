const express = require('express');
const diamondController = require('../controllers/diamondController');
const authMiddleware = require('../middlewares/authMiddleware');
const fileUploadMiddleware = require('../middlewares/publicFileUploadMiddleware');


const router = express.Router();

// Public routes
router.get('/', diamondController.getAllDiamonds);
router.get('/attributes', diamondController.getDiamondAttributes);
router.get('/search', diamondController.searchDiamonds);
router.get('/by-name', diamondController.getDiamondsByName);

// Protected routes (require authentication)
router.post(
  '/',
  authMiddleware.protect,
  fileUploadMiddleware.uploadProductFiles,
  diamondController.createDiamond
);

router.patch(
  '/:id',
  authMiddleware.protect,
  fileUploadMiddleware.uploadProductFiles,
  diamondController.updateDiamond
);

router.delete(
  '/:id',
  authMiddleware.protect,
  diamondController.deleteDiamond
);

// Wishlist routes
router.post('/wishlist/add', authMiddleware.protect, diamondController.addDiamondToWishlist);
router.get('/wishlist', authMiddleware.protect, diamondController.getDiamondWishlist);
router.delete('/wishlist/remove/:diamondId', authMiddleware.protect, diamondController.removeDiamondFromWishlist);

router.get('/:id', diamondController.getDiamondById);
module.exports = router;
