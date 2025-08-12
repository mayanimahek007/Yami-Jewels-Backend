const express = require('express');
const productController = require('../controllers/productController');
const authMiddleware = require('../middlewares/authMiddleware');
const productValidation = require('../middlewares/productValidationMiddleware');
const fileUploadMiddleware = require('../middlewares/publicFileUploadMiddleware');

const router = express.Router();

// Public routes
router.get('/', productController.getAllProducts);
router.get('/category/:categoryName', productController.getProductsByCategory);
router.get('/on-sale', productController.getOnSaleProducts);
router.get('/best-seller', productController.getBestSellerProducts);
router.get('/top-rated', productController.getTopRatedProducts);
router.get('/:id', productController.getProduct);

// Protected routes (require authentication)
router.use(authMiddleware.protect);

// Wishlist routes
router.post('/wishlist', productValidation.validateWishlistOperation, productController.addToWishlist);
router.get('/wishlist/me', productController.getWishlist);
router.delete('/wishlist/:productId', productController.removeFromWishlist);

// Admin only routes
const adminRouter = express.Router();
router.use('/admin', adminRouter);
adminRouter.use(authMiddleware.restrictTo('admin'));

adminRouter.post('/', fileUploadMiddleware.uploadProductFiles, productValidation.validateProductCreate, productController.createProduct);
adminRouter.patch('/:id', fileUploadMiddleware.uploadProductFiles, productValidation.validateProductUpdate, productController.updateProduct);
adminRouter.delete('/:id', productController.deleteProduct);

module.exports = router;