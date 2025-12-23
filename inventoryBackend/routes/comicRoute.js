import express from 'express';
import { pool } from '../database/database.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

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
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'comic-' + uniqueSuffix + path.extname(file.originalname));
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
        return res.status(400).json({ error: 'File too large. Max 10MB each.' });
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({ error: 'Too many files. Max 3 images.' });
      }
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(400).json({ error: err.message || 'Upload failed' });
    }
    next();
  });
};

// Create a comic
router.post('/', async (request, response) => {
    const { title, publisher, series, issuenumber, publicationyear, grade, condition, variant, description, image1, image2, image3 } = request.body;
    if (!title || !publisher || !series || !issuenumber || !publicationyear || !grade || !condition) {
      return response.status(400).send('Required fields: title, publisher, series, issuenumber, publicationyear, grade, condition');
    }
    try {
      const query = `
        INSERT INTO comics (title, publisher, series, issuenumber, publicationyear, grade, condition, variant, description, image1, image2, image3)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING id;
      `;
      const values = [title, publisher, series, issuenumber, publicationyear, grade, condition, variant || '', description || '', image1 || null, image2 || null, image3 || null];

      const result = await pool.query(query, values);
      response.status(200).send({ message: 'New comic record created', comicId: result.rows[0].id });
    } catch (error) {
      console.error(error);
      response.status(500).send('Error occurred');
    }
  });

// List all comics
router.get('/', async (request, response) => {
  try {
    const query = 'SELECT * FROM comics ORDER BY id DESC;';
    const allComics = await pool.query(query);
    return response.status(200).json({
      data: allComics.rows
    });
    } catch (error) {
    console.error(error);
    response.status(500).send('Error occurred');
    }
});

// Get a single comic by id
router.get('/:id', async (request, response) => {
  try {
    const { id } = request.params;
    const query = 'SELECT * FROM comics WHERE id = $1;';
    const { rows } = await pool.query(query, [id]);

    if (rows.length === 0) {
      return response.status(404).send('Comic not found');
    }

    return response.status(200).json(rows[0]);
  } catch (error) {
    console.error(error);
    response.status(500).send('Error occurred');
  }
});

// Update a comic by id
router.put('/:id', async (request, response) => {
  try {
    const { id } = request.params;
    const { title, publisher, series, issuenumber, publicationyear, grade, condition, variant, description, image1, image2, image3 } = request.body;

    const query = `
      UPDATE comics
      SET title = COALESCE($1, title),
          publisher = COALESCE($2, publisher),
          series = COALESCE($3, series),
          issuenumber = COALESCE($4, issuenumber),
          publicationyear = COALESCE($5, publicationyear),
          grade = COALESCE($6, grade),
          condition = COALESCE($7, condition),
          variant = COALESCE($8, variant),
          description = COALESCE($9, description),
          image1 = COALESCE($10, image1),
          image2 = COALESCE($11, image2),
          image3 = COALESCE($12, image3)
      WHERE id = $13
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [title, publisher, series, issuenumber, publicationyear, grade, condition, variant, description, image1, image2, image3, id]);

    if (rows.length === 0) {
      return response.status(404).send('Comic not found');
    }

    response.status(200).json(rows[0]);
  } catch (error) {
    console.error(error);
    response.status(500).send('Error occurred');
  }
});

// Delete a comic by id
router.delete('/:id', async (request, response) => {
  try {
    const { id } = request.params;
    const query = 'DELETE FROM comics WHERE id = $1 RETURNING *;';
    const { rows } = await pool.query(query, [id]);

    if (rows.length === 0) {
      return response.status(404).send('Comic not found');
    }

    response.status(200).json(rows[0]);
  } catch (error) {
    console.error(error);
    response.status(500).send('Error occurred');
  }
});

// Upload comic images
router.post('/upload/:id', uploadWithErrors, async (request, response) => {
  try {
    const { id } = request.params;

    if (!request.files || request.files.length === 0) {
      return response.status(400).send('No files uploaded');
    }

    const imagePaths = {};
    request.files.forEach((file, index) => {
      imagePaths[`image${index + 1}`] = `/uploads/${file.filename}`;
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
      UPDATE comics
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *;
    `;

    const { rows } = await pool.query(query, values);

    if (rows.length === 0) {
      return response.status(404).send('Comic not found');
    }

    response.status(200).json(rows[0]);
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: 'Error uploading images' });
  }
});

// Delete a specific image
router.delete('/image/:id/:slot', async (request, response) => {
  try {
    const { id, slot } = request.params;
    const validSlots = ['image1', 'image2', 'image3'];
    if (!validSlots.includes(slot)) {
      return response.status(400).send('Invalid image slot');
    }

    const selectQuery = `SELECT ${slot} FROM comics WHERE id = $1;`;
    const { rows } = await pool.query(selectQuery, [id]);
    if (rows.length === 0) {
      return response.status(404).send('Comic not found');
    }
    const imagePath = rows[0][slot];

    const updateQuery = `UPDATE comics SET ${slot} = NULL WHERE id = $1 RETURNING *;`;
    const updated = await pool.query(updateQuery, [id]);

    if (imagePath) {
      const filename = path.basename(imagePath);
      const fileOnDisk = path.join(UPLOAD_DIR, filename);
      fs.promises.unlink(fileOnDisk).catch(() => {});
    }

    response.status(200).json(updated.rows[0]);
  } catch (error) {
    console.error(error);
    response.status(500).send('Error deleting image');
  }
});

export default router;
