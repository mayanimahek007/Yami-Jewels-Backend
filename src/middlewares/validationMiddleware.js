const { AppError } = require('../utils/errorHandler');

// Validate registration data
exports.validateRegister = (req, res, next) => {

// Validate product creation
exports.validateProductCreate = (req, res, next) => {
  const { name, description, price, category, stock } = req.body;

  // Check if required fields are present
  if (!name || !description || !price || !category) {
    return next(new AppError('Please provide name, description, price and category', 400));
  }

  // Validate price
  if (isNaN(price) || price <= 0) {
    return next(new AppError('Price must be a positive number', 400));
  }

  // Validate stock if provided
  if (stock !== undefined && (isNaN(stock) || stock < 0)) {
    return next(new AppError('Stock must be a non-negative number', 400));
  }

  next();
};

// Validate product update
exports.validateProductUpdate = (req, res, next) => {
  const { price, stock } = req.body;

  // Validate price if provided
  if (price !== undefined && (isNaN(price) || price <= 0)) {
    return next(new AppError('Price must be a positive number', 400));
  }

  // Validate stock if provided
  if (stock !== undefined && (isNaN(stock) || stock < 0)) {
    return next(new AppError('Stock must be a non-negative number', 400));
  }

  next();
};
  const { name, email, password, role } = req.body;

  // Check if required fields are present
  if (!name || !email || !password) {
    return next(new AppError('Please provide name, email and password', 400));
  }

  // Validate email format
  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  if (!emailRegex.test(email)) {
    return next(new AppError('Please provide a valid email', 400));
  }

  // Validate password length
  if (password.length < 8) {
    return next(new AppError('Password must be at least 8 characters long', 400));
  }

  // Validate role if provided
  if (role && !['user', 'admin'].includes(role)) {
    return next(new AppError('Invalid role. Role must be either "user" or "admin"', 400));
  }

  next();
};

// Validate login data
exports.validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  // Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  next();
};

// Validate password update
exports.validatePasswordUpdate = (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  // Check if current and new password exist
  if (!currentPassword || !newPassword) {
    return next(new AppError('Please provide current password and new password', 400));
  }

  // Validate new password length
  if (newPassword.length < 8) {
    return next(new AppError('New password must be at least 8 characters long', 400));
  }

  next();
};

// Validate password reset
exports.validatePasswordReset = (req, res, next) => {
  const { password } = req.body;

  // Check if password exists
  if (!password) {
    return next(new AppError('Please provide a new password', 400));
  }

  // Validate password length
  if (password.length < 8) {
    return next(new AppError('Password must be at least 8 characters long', 400));
  }

  next();
};

// Validate forgot password
exports.validateForgotPassword = (req, res, next) => {
  const { email } = req.body;

  // Check if email exists
  if (!email) {
    return next(new AppError('Please provide your email', 400));
  }

  next();
};

// Validate admin registration
exports.validateAdminRegister = (req, res, next) => {
  const { name, email, password, passwordConfirm } = req.body;

  // Check if required fields are present
  if (!name || !email || !password || !passwordConfirm) {
    return next(new AppError('Please provide name, email, password and password confirmation', 400));
  }

  // Validate email format
  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  if (!emailRegex.test(email)) {
    return next(new AppError('Please provide a valid email', 400));
  }

  // Validate password length
  if (password.length < 8) {
    return next(new AppError('Password must be at least 8 characters long', 400));
  }

  // Check if passwords match
  if (password !== passwordConfirm) {
    return next(new AppError('Passwords do not match', 400));
  }

  next();
};

// Validate profile update
exports.validateProfileUpdate = (req, res, next) => {
  const { email } = req.body;

  // Validate email format if provided
  if (email) {
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return next(new AppError('Please provide a valid email', 400));
    }
  }

  next();
};