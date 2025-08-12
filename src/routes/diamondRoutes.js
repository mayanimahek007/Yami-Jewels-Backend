const express = require('express');
const diamondController = require('../controllers/diamondController');
const authMiddleware = require('../middlewares/authMiddleware');
const fileUploadMiddleware = require('../middlewares/publicFileUploadMiddleware');

const router = express.Router();

// Public routes
router.get('/', diamondController.getAllDiamonds);
router.get('/:id', diamondController.getDiamondById);

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

module.exports = router;
