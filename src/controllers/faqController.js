const FAQ = require('../models/faqModel');
const { AppError } = require('../utils/errorHandler');

const normalizeFaqPayload = (body) => ({
  question: body.question,
  answer: body.answer,
  isActive: body.isActive,
  order: body.order,
  submittedByName: body.submittedByName,
  submittedByEmail: body.submittedByEmail,
  isUserSubmitted: body.isUserSubmitted
});

const getPublishableFAQError = (payload) => {
  if (payload.isActive && (!payload.answer || !payload.answer.trim())) {
    return new AppError('Answer is required before showing FAQ on website', 400);
  }

  return null;
};

exports.getPublicFAQs = async (req, res, next) => {
  try {
    const faqs = await FAQ.find({ isActive: true, answer: { $ne: '' } }).sort('order -createdAt');

    res.status(200).json({
      status: 'success',
      results: faqs.length,
      data: { faqs }
    });
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};

exports.submitQuestion = async (req, res, next) => {
  try {
    const { question, submittedByName, submittedByEmail } = req.body;

    if (!question || !question.trim()) {
      return next(new AppError('Please enter your question', 400));
    }

    const faq = await FAQ.create({
      question,
      answer: '',
      submittedByName,
      submittedByEmail,
      isUserSubmitted: true,
      isActive: false,
      order: 0
    });

    res.status(201).json({
      status: 'success',
      message: 'Your question has been submitted successfully.',
      data: { faq }
    });
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};

exports.getAllFAQs = async (req, res, next) => {
  try {
    const faqs = await FAQ.find().sort('order -createdAt');

    res.status(200).json({
      status: 'success',
      results: faqs.length,
      data: { faqs }
    });
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};

exports.getFAQ = async (req, res, next) => {
  try {
    const faq = await FAQ.findById(req.params.id);

    if (!faq) {
      return next(new AppError('No FAQ found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { faq }
    });
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};

exports.createFAQ = async (req, res, next) => {
  try {
    const payload = normalizeFaqPayload(req.body);
    const validationError = getPublishableFAQError(payload);
    if (validationError) return next(validationError);

    const faq = await FAQ.create(payload);

    res.status(201).json({
      status: 'success',
      data: { faq }
    });
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};

exports.updateFAQ = async (req, res, next) => {
  try {
    const payload = normalizeFaqPayload(req.body);
    const validationError = getPublishableFAQError(payload);
    if (validationError) return next(validationError);

    const faq = await FAQ.findByIdAndUpdate(
      req.params.id,
      payload,
      { new: true, runValidators: true }
    );

    if (!faq) {
      return next(new AppError('No FAQ found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { faq }
    });
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};

exports.answerFAQ = async (req, res, next) => {
  try {
    const { answer, question, order, isActive } = req.body;

    if (!answer || !answer.trim()) {
      return next(new AppError('Answer is required', 400));
    }

    const updateData = {
      answer,
      isActive: Boolean(isActive),
      updatedAt: Date.now()
    };

    if (question) {
      updateData.question = question;
    }

    if (order !== undefined) {
      updateData.order = Number(order) || 0;
    }

    const faq = await FAQ.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!faq) {
      return next(new AppError('No FAQ found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      message: faq.isActive ? 'FAQ answered and published successfully' : 'FAQ answer saved successfully',
      data: { faq }
    });
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};

exports.deleteFAQ = async (req, res, next) => {
  try {
    const faq = await FAQ.findByIdAndDelete(req.params.id);

    if (!faq) {
      return next(new AppError('No FAQ found with that ID', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};
