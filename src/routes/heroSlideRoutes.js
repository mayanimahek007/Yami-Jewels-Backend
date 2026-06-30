const express = require('express');
const heroSlideController = require('../controllers/heroSlideController');
const authMiddleware = require('../middlewares/authMiddleware');
const { uploadHeroImage } = require('../middlewares/heroUploadMiddleware');

const router = express.Router();

router.get('/', heroSlideController.getPublicSlides);

router.use(authMiddleware.protect);
router.use(authMiddleware.restrictTo('admin'));

router.get('/admin', heroSlideController.getAllSlides);
router.post('/admin', uploadHeroImage, heroSlideController.createSlide);
router.patch('/admin/:id', uploadHeroImage, heroSlideController.updateSlide);
router.delete('/admin/:id', heroSlideController.deleteSlide);

module.exports = router;
