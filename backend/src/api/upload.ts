import { Router } from 'express';
import multer from 'multer';
import { mkdirSync, existsSync } from 'fs';
import { join, extname } from 'path';
import { config } from '../config.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();

// Ensure uploads directory exists
const uploadsDir = join(config.dataDir, 'uploads');
if (!existsSync(uploadsDir)) {
  mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = extname(file.originalname) || '.jpg';
    cb(null, `recipe-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
});

// POST /upload - Upload an image
router.post('/', upload.single('image'), (req, res) => {
  if (!req.file) {
    throw new AppError('NO_FILE', 'No image file provided', 400);
  }

  // Return the URL path to access the image
  const imageUrl = `/uploads/${req.file.filename}`;

  res.json({
    imageUrl,
    filename: req.file.filename,
    size: req.file.size,
  });
});

export default router;
