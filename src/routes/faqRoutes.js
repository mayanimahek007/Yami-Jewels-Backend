const express = require('express');
const faqController = require('../controllers/faqController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', faqController.getPublicFAQs);
router.post('/ask', faqController.submitQuestion);

router.use(authMiddleware.protect);
router.use(authMiddleware.restrictTo('admin'));

router.get('/admin', faqController.getAllFAQs);
router.get('/admin/:id', faqController.getFAQ);
router.post('/admin', faqController.createFAQ);
router.patch('/admin/:id/answer', faqController.answerFAQ);
router.patch('/admin/:id', faqController.updateFAQ);
router.delete('/admin/:id', faqController.deleteFAQ);

module.exports = router;
