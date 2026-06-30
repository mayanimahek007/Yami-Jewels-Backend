const Coupon = require('../models/couponModel');
const { AppError } = require('../utils/errorHandler');

const normalizeCouponPayload = (body) => ({
  code: body.code,
  description: body.description,
  discountType: body.discountType || 'percentage',
  discountValue: Number(body.discountValue),
  minOrderAmount: Number(body.minOrderAmount) || 0,
  maxDiscountAmount: Number(body.maxDiscountAmount) || 0,
  usageLimit: Number(body.usageLimit) || 0,
  expiresAt: body.expiresAt || undefined,
  isActive: body.isActive === true || body.isActive === 'true' || body.isActive === 'on'
});

exports.getAllCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort('-createdAt');

    res.status(200).json({
      status: 'success',
      results: coupons.length,
      data: { coupons }
    });
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};

exports.createCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.create(normalizeCouponPayload(req.body));

    res.status(201).json({
      status: 'success',
      data: { coupon }
    });
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};

exports.updateCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      normalizeCouponPayload(req.body),
      { new: true, runValidators: true }
    );

    if (!coupon) {
      return next(new AppError('No coupon found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { coupon }
    });
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};

exports.deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);

    if (!coupon) {
      return next(new AppError('No coupon found with that ID', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};

exports.validateCoupon = async (req, res, next) => {
  try {
    const { code, orderAmount = 0 } = req.body;
    const coupon = await Coupon.findOne({ code: String(code || '').toUpperCase(), isActive: true });

    if (!coupon) {
      return next(new AppError('Invalid coupon code', 404));
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return next(new AppError('Coupon has expired', 400));
    }

    if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
      return next(new AppError('Coupon usage limit reached', 400));
    }

    if (Number(orderAmount) < coupon.minOrderAmount) {
      return next(new AppError(`Minimum order amount is ${coupon.minOrderAmount}`, 400));
    }

    let discountAmount = coupon.discountType === 'percentage'
      ? (Number(orderAmount) * coupon.discountValue) / 100
      : coupon.discountValue;

    if (coupon.maxDiscountAmount > 0) {
      discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
    }

    res.status(200).json({
      status: 'success',
      data: {
        coupon,
        discountAmount,
        finalAmount: Math.max(Number(orderAmount) - discountAmount, 0)
      }
    });
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};
