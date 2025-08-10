const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/emailService');
const { AppError } = require('../utils/errorHandler');

// Helper function to create JWT token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// Helper function to send token response
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address
      }
    }
  });
};

// Register a new user
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone, address, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('Email already in use', 400));
    }

    // Create user object with default role as 'user'
    const userData = {
      name,
      email,
      password,
      phone,
      address,
      role: 'user' // Default role
    };

    // If role is provided and it's 'admin', set it (can be restricted further if needed)
    if (role === 'admin') {
      userData.role = 'admin';
    }

    // Create new user
    const newUser = await User.create(userData);

    createSendToken(newUser, 201, res);
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};

// Login user
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if email and password exist
    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
    }

    // Check if user exists && password is correct
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppError('Incorrect email or password', 401));
    }

    // If everything ok, send token to client
    createSendToken(user, 200, res);
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};

// Get current user profile
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};

// Update user profile
exports.updateProfile = async (req, res, next) => {
  try {
    // Check if user is trying to update password
    if (req.body.password) {
      return next(new AppError('This route is not for password updates. Please use /updatePassword.', 400));
    }

    // Filter out unwanted fields that are not allowed to be updated
    const filteredBody = {};
    const allowedFields = ['name', 'email', 'phone', 'address'];
    Object.keys(req.body).forEach(el => {
      if (allowedFields.includes(el)) filteredBody[el] = req.body[el];
    });

    // Update user document
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
      new: true,
      runValidators: true
    });

    if (!updatedUser) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser
      }
    });
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};

// Update password
exports.updatePassword = async (req, res, next) => {
  try {
    // Get user from collection
    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Check if current password is correct
    if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
      return next(new AppError('Your current password is incorrect', 401));
    }

    // Update password
    user.password = req.body.newPassword;
    await user.save();

    // Log user in, send JWT
    createSendToken(user, 200, res);
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};

// Forgot password
exports.forgotPassword = async (req, res, next) => {
  try {
    // Get user based on POSTed email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return next(new AppError('There is no user with that email address.', 404));
    }

    // Generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // Send it to user's email
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/users/resetPassword/${resetToken}`;

    const message = `Forgot your password? Submit a PATCH request with your new password to: ${resetURL}\nIf you didn't forget your password, please ignore this email!`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Your password reset token (valid for 10 min)',
        message,
        html: `<p>Forgot your password?</p><p>Click <a href="${resetURL}">here</a> to reset your password or submit a PATCH request with your new password to: ${resetURL}</p><p>If you didn't forget your password, please ignore this email!</p>`
      });

      res.status(200).json({
        status: 'success',
        message: 'Token sent to email!'
      });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return next(new AppError('There was an error sending the email. Try again later!', 500));
    }
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};

// Reset password
exports.resetPassword = async (req, res, next) => {
  try {
    // Get user based on the token
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    // If token has not expired, and there is user, set the new password
    if (!user) {
      return next(new AppError('Token is invalid or has expired', 400));
    }

    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // Log the user in, send JWT
    createSendToken(user, 200, res);
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};

// Logout user
exports.logout = (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Successfully logged out'
  });
};

// Get all users (admin only)
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find();

    res.status(200).json({
      status: 'success',
      results: users.length,
      data: {
        users
      }
    });
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};

// Register admin user (protected route)
exports.registerAdmin = async (req, res, next) => {
  try {
    const { name, email, password, passwordConfirm, phone, address } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('Email already in use', 400));
    }

    // Create admin user
    const newAdmin = await User.create({
      name,
      email,
      password,
      phone,
      address,
      role: 'admin'
    });

    createSendToken(newAdmin, 201, res);
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};