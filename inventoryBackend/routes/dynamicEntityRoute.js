import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { requireAuth } from '../middleware/auth.js';
import { BadRequestError } from '../middleware/errorHandler.js';
import { processImages } from '../middleware/imageProcessor.js';
import * as controller from '../controllers/dynamicEntityController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Protect all routes with authentication
router.use(requireAuth);

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '../uploads');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }
    cb(null, UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    const { tableName } = req.params;
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${tableName}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: function (req, file, cb) {
    const allowedExt = /jpeg|jpg|png|gif|heic|heif/;
    const allowedMime = /(image\/jpeg|image\/png|image\/gif|image\/heic|image\/heif)/;
    const mimetype = allowedMime.test(file.mimetype);
    const extname = allowedExt.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Invalid format. Allowed: JPEG, PNG, GIF, HEIC.'));
  }
});

// Middleware to surface multer errors with friendly messages
const uploadWithErrors = (req, res, next) => {
  upload.array('images', 3)(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(new BadRequestError('File too large. Max 10MB each.'));
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return next(new BadRequestError('Too many files. Max 3 images.'));
      }
      return next(new BadRequestError(err.message));
    } else if (err) {
      return next(new BadRequestError(err.message || 'Upload failed'));
    }
    next();
  });
};

// Generic routes for any custom table
router.get('/:tableName', controller.listItems);
router.get('/:tableName/:id', controller.getItem);
router.post('/:tableName', controller.createItem);
router.put('/:tableName/:id', controller.updateItem);
router.delete('/:tableName/:id', controller.deleteItem);
router.post('/:tableName/upload/:id', uploadWithErrors, processImages, controller.uploadImages);
router.delete('/:tableName/image/:id/:slot', controller.deleteImage);
router.post('/:tableName/qr/regenerate/:id', controller.regenerateQR);

export default router;
