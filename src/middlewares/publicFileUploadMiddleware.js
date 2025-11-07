const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { AppError } = require('../utils/errorHandler');

// Create public directory structure for images and videos
const publicDir = path.join(__dirname, '../../public');
const imagesDir = path.join(publicDir, 'images');
const videosDir = path.join(publicDir, 'videos');

// Create directories if they don't exist
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}
if (!fs.existsSync(videosDir)) {
  fs.mkdirSync(videosDir, { recursive: true });
}

// Process uploaded files and format them for the database
const processProductFiles = (req, res, next) => {
  // Process images
  if (req.files && req.files.images) {
    const images = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
    req.body.images = images.map((file, index) => {
      const alt = req.body[`images[${index}][alt]`] || `${req.body.name || 'Product'} Image ${index + 1}`;
      return {
        url: `/public/images/${file.filename}`,
        alt: alt
      };
    });
  }

  // Process video
  if (req.files && req.files.videoUrl) {
    req.body.videoUrl = `/public/videos/${req.files.videoUrl[0].filename}`;
  }

  // Process metal variations
  if (req.body['metalVariations[0][type]']) {
    const metalVariations = [];
    let index = 0;
    
    while (req.body[`metalVariations[${index}][type]`]) {
      const variation = {
        type: req.body[`metalVariations[${index}][type]`],
        color: req.body[`metalVariations[${index}][color]`],
        karat: req.body[`metalVariations[${index}][karat]`],
        additionalInfo: req.body[`metalVariations[${index}][additionalInfo]`]
      };
      
      metalVariations.push(variation);
      index++;
    }
    
    req.body.metalVariations = metalVariations;
  }

  next();
};

// Middleware for handling product file uploads with public folder
const uploadProductFiles = (req, res, next) => {
  const upload = multer({
    storage: multer.memoryStorage(), // Use memory storage initially
    limits: { 
      fileSize: 100 * 1024 * 1024, // 100MB per file limit (10 images × 100MB + 1 video × 100MB = max 1.1GB total)
      fieldSize: 10 * 1024 * 1024, // 10MB for non-file fields
      files: 11, // Maximum 10 images + 1 video
      fieldNameSize: 100, // Maximum field name size
      fields: 100 // Maximum number of non-file fields
    }
  }).fields([
    { name: 'images', maxCount: 10 },
    { name: 'videoUrl', maxCount: 1 }
  ]);

  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(new AppError(`File too large. Maximum file size is 100MB per file.`, 413));
      } else if (err.code === 'LIMIT_FILE_COUNT') {
        return next(new AppError(`Too many files. Maximum 10 images and 1 video allowed.`, 413));
      } else if (err.code === 'LIMIT_FIELD_KEY') {
        return next(new AppError(`Field name too long.`, 413));
      } else if (err.code === 'LIMIT_FIELD_VALUE') {
        return next(new AppError(`Field value too large.`, 413));
      } else if (err.code === 'LIMIT_FIELD_COUNT') {
        return next(new AppError(`Too many fields.`, 413));
      } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return next(new AppError(`Unexpected file field. Only 'images' and 'videoUrl' are allowed.`, 400));
      }
      return next(new AppError(`Upload error: ${err.message}`, 400));
    } else if (err) {
      return next(new AppError(`Error uploading files: ${err.message}`, 500));
    }

    // Now process each file based on its type
    if (req.files) {
      // Process images
      if (req.files.images) {
        const images = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
        
        // Validate image files
        for (const file of images) {
          const allowedTypes = /jpeg|jpg|png|gif|webp/;
          const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
          const mimetype = allowedTypes.test(file.mimetype);

          if (!extname || !mimetype) {
            return next(new AppError(`File ${file.originalname} is not a valid image. Only jpeg, jpg, png, gif, and webp are allowed.`, 400));
          }

          // Save file to disk in public/images
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
          const filename = 'image-' + uniqueSuffix + path.extname(file.originalname);
          const filepath = path.join(imagesDir, filename);
          
          fs.writeFileSync(filepath, file.buffer);
          file.filename = filename; // Store the filename for later use
        }
      }

      // Process video
      if (req.files.videoUrl) {
        const file = req.files.videoUrl[0];
        const allowedTypes = /mp4|mov|avi|wmv|webm/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = /video\/.*/i.test(file.mimetype);

        if (!extname || !mimetype) {
          return next(new AppError(`File ${file.originalname} is not a valid video. Only mp4, mov, avi, wmv, and webm are allowed.`, 400));
        }

        // Save file to disk in public/videos
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = 'video-' + uniqueSuffix + path.extname(file.originalname);
        const filepath = path.join(videosDir, filename);
        
        fs.writeFileSync(filepath, file.buffer);
        file.filename = filename; // Store the filename for later use
      }
    }

    // Continue with processing the files for the database
    processProductFiles(req, res, next);
  });
};

module.exports = {
  uploadProductFiles
};
