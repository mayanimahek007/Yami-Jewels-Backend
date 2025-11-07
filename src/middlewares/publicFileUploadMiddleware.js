const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
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

// Compress image using sharp
const compressImage = async (buffer, originalName) => {
  try {
    const ext = path.extname(originalName).toLowerCase();
    const isJpeg = /\.(jpg|jpeg)$/i.test(originalName);
    const isPng = /\.png$/i.test(originalName);
    const isWebp = /\.webp$/i.test(originalName);

    let sharpInstance = sharp(buffer);

    // Get image metadata
    const metadata = await sharpInstance.metadata();
    const width = metadata.width;
    const height = metadata.height;

    // Resize if image is too large (max 1920px on longest side, maintain aspect ratio)
    const maxDimension = 1920;
    if (width > maxDimension || height > maxDimension) {
      if (width > height) {
        sharpInstance = sharpInstance.resize(maxDimension, null, {
          withoutEnlargement: true,
          fit: 'inside'
        });
      } else {
        sharpInstance = sharpInstance.resize(null, maxDimension, {
          withoutEnlargement: true,
          fit: 'inside'
        });
      }
    }

    // Compress based on format
    if (isJpeg) {
      return await sharpInstance
        .jpeg({ quality: 85, progressive: true, mozjpeg: true })
        .toBuffer();
    } else if (isPng) {
      return await sharpInstance
        .png({ quality: 85, compressionLevel: 9, adaptiveFiltering: true })
        .toBuffer();
    } else if (isWebp) {
      return await sharpInstance
        .webp({ quality: 85, effort: 6 })
        .toBuffer();
    } else {
      // For other formats (gif), just resize if needed
      return await sharpInstance.toBuffer();
    }
  } catch (error) {
    console.error('Image compression error:', error);
    // Return original buffer if compression fails
    return buffer;
  }
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

    // Process files asynchronously with compression
    (async () => {
      try {
        if (req.files) {
          // Process images with compression
          if (req.files.images) {
            const images = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
            
            // Validate and compress images
            for (const file of images) {
              const allowedTypes = /jpeg|jpg|png|gif|webp/;
              const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
              const mimetype = allowedTypes.test(file.mimetype);

              if (!extname || !mimetype) {
                return next(new AppError(`File ${file.originalname} is not a valid image. Only jpeg, jpg, png, gif, and webp are allowed.`, 400));
              }

              // Compress image
              const originalSize = file.buffer.length;
              const compressedBuffer = await compressImage(file.buffer, file.originalname);
              const compressedSize = compressedBuffer.length;
              
              // Log compression stats
              const compressionRatio = ((1 - compressedSize / originalSize) * 100).toFixed(1);
              console.log(`Image ${file.originalname}: ${(originalSize / 1024).toFixed(2)}KB -> ${(compressedSize / 1024).toFixed(2)}KB (${compressionRatio}% reduction)`);

              // Save compressed file to disk
              const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
              // Convert to webp for better compression, or keep original format
              const outputExt = path.extname(file.originalname).toLowerCase();
              const filename = 'image-' + uniqueSuffix + outputExt;
              const filepath = path.join(imagesDir, filename);
              
              fs.writeFileSync(filepath, compressedBuffer);
              file.buffer = compressedBuffer; // Update buffer with compressed version
              file.filename = filename; // Store the filename for later use
              file.size = compressedSize; // Update file size
            }
          }

          // Process video (save as-is for now, video compression requires ffmpeg)
          if (req.files.videoUrl) {
            const file = req.files.videoUrl[0];
            const allowedTypes = /mp4|mov|avi|wmv|webm/;
            const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
            const mimetype = /video\/.*/i.test(file.mimetype);

            if (!extname || !mimetype) {
              return next(new AppError(`File ${file.originalname} is not a valid video. Only mp4, mov, avi, wmv, and webm are allowed.`, 400));
            }

            // Save video file to disk (video compression can be added later with ffmpeg)
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const filename = 'video-' + uniqueSuffix + path.extname(file.originalname);
            const filepath = path.join(videosDir, filename);
            
            fs.writeFileSync(filepath, file.buffer);
            file.filename = filename; // Store the filename for later use
          }
        }

        // Continue with processing the files for the database
        processProductFiles(req, res, next);
      } catch (error) {
        console.error('File processing error:', error);
        return next(new AppError(`Error processing files: ${error.message}`, 500));
      }
    })();
  });
};

module.exports = {
  uploadProductFiles
};
