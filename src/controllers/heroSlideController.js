const HeroSlide = require('../models/heroSlideModel');
const { AppError } = require('../utils/errorHandler');

const toBoolean = (value) => value === true || value === 'true' || value === 'on';

const normalizeHeroPayload = (body, currentSlide = null) => ({
  title: body.title || '',
  description: body.description || '',
  image: body.image || currentSlide?.image,
  buttonText: body.buttonText || '',
  buttonLink: body.buttonLink || '',
  order: Number(body.order) || 0,
  isActive: toBoolean(body.isActive)
});

exports.getPublicSlides = async (req, res, next) => {
  try {
    const slides = await HeroSlide.find({ isActive: true }).sort('order -createdAt');

    res.status(200).json({
      status: 'success',
      results: slides.length,
      data: { slides }
    });
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};

exports.getAllSlides = async (req, res, next) => {
  try {
    const slides = await HeroSlide.find().sort('order -createdAt');

    res.status(200).json({
      status: 'success',
      results: slides.length,
      data: { slides }
    });
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};

exports.createSlide = async (req, res, next) => {
  try {
    if (!req.body.image) {
      return next(new AppError('Hero image is required', 400));
    }

    const slide = await HeroSlide.create(normalizeHeroPayload(req.body));

    res.status(201).json({
      status: 'success',
      data: { slide }
    });
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};

exports.updateSlide = async (req, res, next) => {
  try {
    const currentSlide = await HeroSlide.findById(req.params.id);

    if (!currentSlide) {
      return next(new AppError('No hero slide found with that ID', 404));
    }

    const slide = await HeroSlide.findByIdAndUpdate(
      req.params.id,
      normalizeHeroPayload(req.body, currentSlide),
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: 'success',
      data: { slide }
    });
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};

exports.deleteSlide = async (req, res, next) => {
  try {
    const slide = await HeroSlide.findByIdAndDelete(req.params.id);

    if (!slide) {
      return next(new AppError('No hero slide found with that ID', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};
