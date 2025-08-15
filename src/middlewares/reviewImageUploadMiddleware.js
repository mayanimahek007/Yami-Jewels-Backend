const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure public/images directory exists
const publicImagesDir = path.join(__dirname, '../../public/images');
if (!fs.existsSync(publicImagesDir)) {
    fs.mkdirSync(publicImagesDir, { recursive: true });
}

// Configure storage for review images
const reviewImageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, publicImagesDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const filename = 'review-' + uniqueSuffix + ext;
        cb(null, filename);
    }
});

// Filter for images only
const imageFileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

// Create multer upload instance for review images
const uploadReviewImages = multer({
    storage: reviewImageStorage,
    fileFilter: imageFileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Middleware to handle multiple images
const handleReviewImages = uploadReviewImages.array('images', 5); // Max 5 images

module.exports = {
    uploadReviewImages,
    handleReviewImages
};
