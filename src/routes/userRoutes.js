const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const validationMiddleware = require('../middlewares/validationMiddleware');

const router = express.Router();

// Public routes
router.post('/register', validationMiddleware.validateRegister, userController.register);
router.post('/login', validationMiddleware.validateLogin, userController.login);
router.post('/logout', userController.logout);
router.post('/forgotPassword', validationMiddleware.validateForgotPassword, userController.forgotPassword);
router.post('/verifyOTP', userController.verifyOTP);
router.post('/resetPassword', validationMiddleware.validatePasswordReset, userController.resetPassword);
router.post('/resendOTP', userController.resendOTP);

// Protected routes (require authentication)
router.use(authMiddleware.protect);
router.get('/profile', userController.getProfile);
router.patch('/updateProfile', validationMiddleware.validateProfileUpdate, userController.updateProfile);
router.patch('/updatePassword', validationMiddleware.validatePasswordUpdate, userController.updatePassword);

// Admin only routes
const adminRouter = express.Router();
router.use('/admin', adminRouter);
adminRouter.use(authMiddleware.restrictTo('admin'));
adminRouter.get('/users', userController.getAllUsers);
adminRouter.post('/register', validationMiddleware.validateAdminRegister, userController.registerAdmin);

module.exports = router;