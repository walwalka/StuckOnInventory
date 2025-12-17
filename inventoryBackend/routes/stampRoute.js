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

router.post('/', async (request, response) => {
    const { country, denomination, issueyear, condition, description, image1, image2, image3 } = request.body;
    if (!country || !denomination || !issueyear || !condition) {
      return response.status(400).send('Required fields: country, denomination, issueyear, condition');
    }
    try {
      const query = `
        INSERT INTO stamps (country, denomination, issueyear, condition, description, image1, image2, image3)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id;
      `;
      const values = [country, denomination, issueyear, condition, description || '', image1 || null, image2 || null, image3 || null];
  
      const result = await pool.query(query, values);
      response.status(200).send({ message: 'New stamp record created', stampId: result.rows[0].id });
    } catch (error) {
      console.error(error);
      response.status(500).send('Error occurred');
    }
  });

router.get('/', async (request, response) => {
  try {
    const query = 'SELECT * FROM stamps ORDER BY id DESC;';
    const allStamps = await pool.query(query);
    return response.status(200).json({
      data: allStamps.rows
    });
    } catch (error) {
    console.error(error);
    response.status(500).send('Error occurred');
    }
});

router.get('/:id', async (request, response) => {
  try {
    const { id } = request.params;
    const query = 'SELECT * FROM stamps WHERE id = $1;';
    const { rows } = await pool.query(query, [id]);

    if (rows.length === 0) {
      return response.status(404).send('Stamp not found');
    }

    return response.status(200).json(rows[0]);
  } catch (error) {
    console.error(error);
    response.status(500).send('Error occurred');
  }
});

router.put('/:id', async (request, response) => {
  try {
    const { id } = request.params;
    const { country, denomination, issueyear, condition, description, image1, image2, image3 } = request.body;

    const query = `
      UPDATE stamps
      SET country = COALESCE($1, country),
          denomination = COALESCE($2, denomination),
          issueyear = COALESCE($3, issueyear),
          condition = COALESCE($4, condition),
          description = COALESCE($5, description),
          image1 = COALESCE($6, image1),
          image2 = COALESCE($7, image2),
          image3 = COALESCE($8, image3)
      WHERE id = $9
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [country, denomination, issueyear, condition, description, image1, image2, image3, id]);

    if (rows.length === 0) {
      return response.status(404).send('Stamp not found');
    }

    response.status(200).json(rows[0]);
  } catch (error) {
    console.error(error);
    response.status(500).send('Error occurred');
  }
});

router.delete('/:id', async (request, response) => {
  try {
    const { id } = request.params;
    const query = 'DELETE FROM stamps WHERE id = $1 RETURNING *;';
    const { rows } = await pool.query(query, [id]);

    if (rows.length === 0) {
      return response.status(404).send('Stamp not found');
    }

    response.status(200).json(rows[0]);
  } catch (error) {
    console.error(error);
    response.status(500).send('Error occurred');
  }
});

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
      UPDATE stamps
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *;
    `;

    const { rows } = await pool.query(query, values);

    if (rows.length === 0) {
      return response.status(404).send('Stamp not found');
    }

    response.status(200).json(rows[0]);
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: 'Error uploading images' });
  }
});

router.delete('/image/:id/:slot', async (request, response) => {
  try {
    const { id, slot } = request.params;
    const validSlots = ['image1', 'image2', 'image3'];
    if (!validSlots.includes(slot)) {
      return response.status(400).send('Invalid image slot');
    }

    const selectQuery = `SELECT ${slot} FROM stamps WHERE id = $1;`;
    const { rows } = await pool.query(selectQuery, [id]);
    if (rows.length === 0) {
      return response.status(404).send('Stamp not found');
    }
    const imagePath = rows[0][slot];

    const updateQuery = `UPDATE stamps SET ${slot} = NULL WHERE id = $1 RETURNING *;`;
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
