const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const { AppError } = require('../utils/errorHandler');

const heroDir = path.join(__dirname, '../../public/hero');

if (!fs.existsSync(heroDir)) {
  fs.mkdirSync(heroDir, { recursive: true });
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (!extname || !mimetype) {
      return cb(new AppError('Only jpeg, jpg, png, and webp images are allowed.', 400));
    }

    cb(null, true);
  }
});

const uploadHeroImage = (req, res, next) => {
  upload.single('image')(req, res, async (err) => {
    if (err) {
      return next(err instanceof multer.MulterError ? new AppError(err.message, 400) : err);
    }

    if (!req.file) return next();

    try {
      const filename = `hero-${Date.now()}-${Math.round(Math.random() * 1E9)}.webp`;
      const filepath = path.join(heroDir, filename);

      const buffer = await sharp(req.file.buffer)
        .resize(1800, 700, { fit: 'cover', withoutEnlargement: true })
        .webp({ quality: 82 })
        .toBuffer();

      fs.writeFileSync(filepath, buffer);
      req.body.image = `/public/hero/${filename}`;
      next();
    } catch (error) {
      next(new AppError(`Error processing hero image: ${error.message}`, 500));
    }
  });
};

module.exports = { uploadHeroImage };
