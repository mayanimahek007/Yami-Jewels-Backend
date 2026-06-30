const express = require('express');
const couponController = require('../controllers/couponController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/validate', couponController.validateCoupon);

router.use(authMiddleware.protect);
router.use(authMiddleware.restrictTo('admin'));

router.get('/admin', couponController.getAllCoupons);
router.post('/admin', couponController.createCoupon);
router.patch('/admin/:id', couponController.updateCoupon);
router.delete('/admin/:id', couponController.deleteCoupon);

module.exports = router;
