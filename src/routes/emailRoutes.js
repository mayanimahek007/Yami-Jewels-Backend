const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { sendCustomJewelryEmail } = require('../controllers/emailController');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads/email-attachments');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage for email attachments
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'attachment-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter for attachments (allow common file types)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|pdf|doc|docx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype) || file.mimetype === 'application/pdf' || file.mimetype.includes('document');

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('File type not allowed. Only images, PDF, and document files are permitted.'));
  }
};

// Multer middleware for uploading multiple files
const uploadMultiple = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit per file
}).array('files', 10); // Allow up to 10 files

const router = express.Router();

// Route for sending custom jewelry email
router.post('/custom-jewelry', (req, res, next) => {
  uploadMultiple(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        status: 'error',
        message: err.message
      });
    }
    next();
  });
}, sendCustomJewelryEmail);

module.exports = router;
