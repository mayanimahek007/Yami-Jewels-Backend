const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { AppError } = require('../utils/errorHandler');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Create separate directories for images and videos
const imagesDir = path.join(uploadsDir, 'images');
const videosDir = path.join(uploadsDir, 'videos');

if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

if (!fs.existsSync(videosDir)) {
  fs.mkdirSync(videosDir, { recursive: true });
}

// Configure storage for images
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, imagesDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'image-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Configure storage for videos
const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, videosDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'video-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter for images
const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new AppError('Only image files are allowed!', 400));
  }
};

// File filter for videos
const videoFilter = (req, file, cb) => {
  const allowedTypes = /mp4|mov|avi|wmv|webm/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = /video\/.*/i.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new AppError('Only video files are allowed!', 400));
  }
};

// Multer middleware for uploading images
const uploadImages = multer({
  storage: imageStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Multer middleware for uploading videos
const uploadVideo = multer({
  storage: videoStorage,
  fileFilter: videoFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// Process uploaded files and format them for the database
const processProductFiles = (req, res, next) => {
  // Process images
  if (req.files && req.files.images) {
    const images = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
    req.body.images = images.map((file, index) => {
      const alt = req.body[`images[${index}][alt]`] || `${req.body.name || 'Product'} Image ${index + 1}`;
      return {
        url: `/uploads/images/${file.filename}`,
        alt: alt
      };
    });
  }

  // Process video
  if (req.files && req.files.videoUrl) {
    req.body.videoUrl = `/uploads/videos/${req.files.videoUrl[0].filename}`;
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

// Middleware for handling product file uploads
const uploadProductFiles = (req, res, next) => {
  const upload = multer({
    storage: multer.memoryStorage(), // Use memory storage initially
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB total limit
  }).fields([
    { name: 'images', maxCount: 10 },
    { name: 'videoUrl', maxCount: 1 }
  ]);

  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
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

        // Save file to disk
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