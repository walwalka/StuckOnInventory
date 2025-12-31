import express from 'express';
import { pool } from '../database/database.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler, BadRequestError, NotFoundError } from '../middleware/errorHandler.js';
import { processImages } from '../middleware/imageProcessor.js';
import { generateQRCode, deleteQRCode, regenerateQRCode } from '../utils/qrCodeGenerator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Protect all routes in this router with authentication
router.use(requireAuth);

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '../uploads');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }
    cb(null, UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'stamp-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
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

const uploadWithErrors = (req, res, next) => {
  upload.array('images', 3)(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        throw new BadRequestError('File too large. Max 10MB each.');
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        throw new BadRequestError('Too many files. Max 3 images.');
      }
      throw new BadRequestError(err.message);
    } else if (err) {
      throw new BadRequestError(err.message || 'Upload failed');
    }
    next();
  });
};

router.post('/', asyncHandler(async (request, response) => {
    const { country, denomination, issueyear, condition, description, image1, image2, image3, quantity } = request.body;
    if (!country || !denomination || !issueyear || !condition) {
      throw new BadRequestError('Required fields: country, denomination, issueyear, condition');
    }

    const query = `
      INSERT INTO stamps (country, denomination, issueyear, condition, description, image1, image2, image3, quantity)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id;
    `;
    const values = [country, denomination, issueyear, condition, description || '', image1 || null, image2 || null, image3 || null, quantity || 1];

    const result = await pool.query(query, values);
    const stampId = result.rows[0].id;

    const qrCodePath = await generateQRCode('stamps', stampId);
    await pool.query('UPDATE stamps SET qr_code = $1 WHERE id = $2', [qrCodePath, stampId]);

    response.status(200).send({ message: 'New stamp record created', stampId });
  }));

router.get('/', asyncHandler(async (request, response) => {
    const query = 'SELECT * FROM stamps ORDER BY id DESC;';
    const allStamps = await pool.query(query);
    return response.status(200).json({
      data: allStamps.rows
    });
}));

router.get('/:id', asyncHandler(async (request, response) => {
    const { id } = request.params;
    const query = 'SELECT * FROM stamps WHERE id = $1;';
    const { rows } = await pool.query(query, [id]);

    if (rows.length === 0) {
      throw new NotFoundError('Stamp not found');
    }

    return response.status(200).json(rows[0]);
}));

router.put('/:id', asyncHandler(async (request, response) => {
    const { id } = request.params;
    const { country, denomination, issueyear, condition, description, image1, image2, image3, quantity } = request.body;

    const query = `
      UPDATE stamps
      SET country = COALESCE($1, country),
          denomination = COALESCE($2, denomination),
          issueyear = COALESCE($3, issueyear),
          condition = COALESCE($4, condition),
          description = COALESCE($5, description),
          image1 = COALESCE($6, image1),
          image2 = COALESCE($7, image2),
          image3 = COALESCE($8, image3),
          quantity = COALESCE($9, quantity)
      WHERE id = $10
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [country, denomination, issueyear, condition, description, image1, image2, image3, quantity, id]);

    if (rows.length === 0) {
      throw new NotFoundError('Stamp not found');
    }

    response.status(200).json(rows[0]);
}));

router.delete('/:id', asyncHandler(async (request, response) => {
    const { id } = request.params;
    const query = 'DELETE FROM stamps WHERE id = $1 RETURNING *;';
    const { rows } = await pool.query(query, [id]);

    if (rows.length === 0) {
      throw new NotFoundError('Stamp not found');
    }

    await deleteQRCode(rows[0].qr_code);

    response.status(200).json(rows[0]);
}));

router.post('/upload/:id', uploadWithErrors, processImages, asyncHandler(async (request, response) => {
    const { id } = request.params;

    if (!request.files || request.files.length === 0) {
      throw new BadRequestError('No files uploaded');
    }

    // Use processed file names from the middleware
    const imagePaths = {};
    const processedFiles = request.processedFiles || request.files;

    processedFiles.forEach((file, index) => {
      const filename = file.filename || file.name;
      imagePaths[`image${index + 1}`] = `/uploads/${filename}`;
    });

    const updateFields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(imagePaths).forEach(key => {
      updateFields.push(`${key} = $${paramCount}`);
      values.push(imagePaths[key]);
      paramCount++;
    });

    values.push(id);

    const query = `
      UPDATE stamps
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *;
    `;

    const { rows } = await pool.query(query, values);

    if (rows.length === 0) {
      throw new NotFoundError('Stamp not found');
    }

    response.status(200).json(rows[0]);
}));

router.delete('/image/:id/:slot', asyncHandler(async (request, response) => {
    const { id, slot } = request.params;
    const validSlots = ['image1', 'image2', 'image3'];
    if (!validSlots.includes(slot)) {
      throw new BadRequestError('Invalid image slot');
    }

    const selectQuery = `SELECT ${slot} FROM stamps WHERE id = $1;`;
    const { rows } = await pool.query(selectQuery, [id]);
    if (rows.length === 0) {
      throw new NotFoundError('Stamp not found');
    }
    const imagePath = rows[0][slot];

    const updateQuery = `UPDATE stamps SET ${slot} = NULL WHERE id = $1 RETURNING *;`;
    const updated = await pool.query(updateQuery, [id]);

    // Remove file from disk if exists (including processed versions)
    if (imagePath) {
      const filename = path.basename(imagePath);
      const baseName = path.basename(filename, path.extname(filename));
      const fileOnDisk = path.join(UPLOAD_DIR, filename);
      const thumbnailFile = path.join(UPLOAD_DIR, `${baseName}-thumb.jpg`);
      const webpFile = path.join(UPLOAD_DIR, `${baseName}.webp`);

      // Delete main file, thumbnail, and WebP version
      fs.promises.unlink(fileOnDisk).catch(() => {});
      fs.promises.unlink(thumbnailFile).catch(() => {});
      fs.promises.unlink(webpFile).catch(() => {});
    }

    response.status(200).json(updated.rows[0]);
}));

router.post('/qr/regenerate/:id', asyncHandler(async (request, response) => {
  const { id } = request.params;
  const { rows } = await pool.query('SELECT qr_code FROM stamps WHERE id = $1', [id]);
  if (rows.length === 0) {
    throw new NotFoundError('Stamp not found');
  }
  const newQrPath = await regenerateQRCode('stamps', id, rows[0].qr_code);
  const updated = await pool.query('UPDATE stamps SET qr_code = $1 WHERE id = $2 RETURNING *;', [newQrPath, id]);
  response.status(200).json({
    message: 'QR code regenerated',
    qr_code: newQrPath,
    stamp: updated.rows[0]
  });
}));

export default router;
