import express, { json, response } from 'express';
import { pool } from '../database/database.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import heicConvert from 'heic-convert';
import { requireAuth } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Protect all routes in this router with authentication
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
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'coin-' + uniqueSuffix + path.extname(file.originalname));
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

// Lookup face value for a given coin type (case-insensitive)
async function fetchFaceValueForType(type) {
  if (!type) return null;
  try {
    const { rows } = await pool.query('SELECT face_value FROM cointypes WHERE LOWER(name) = LOWER($1) LIMIT 1;', [type]);
    return rows[0]?.face_value ?? null;
  } catch (err) {
    console.warn('face_value lookup failed', err?.message || err);
    return null;
  }
}

// Middleware to surface multer errors with friendly messages
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

// Create a coin
router.post('/', async (request, response) => {
    // Validate the incoming JSON data
    const { type, mintlocation, mintyear, circulation, grade, image1, image2, image3, face_value } = request.body;
    console.log(request.body);
    if (!type || !mintlocation || !mintyear || !circulation || !grade) {
      return response.status(400).send('One of the type, mintlocation, mintyear, circulation, grade data points is missing');
    }
    try {
      const parsedFace = face_value === undefined ? undefined : parseFloat(face_value);
      const resolvedFaceValue =
        parsedFace !== undefined && !Number.isNaN(parsedFace)
          ? parsedFace
          : await fetchFaceValueForType(type);

      // try to send data to the database
      const query = `
        INSERT INTO coins (type, mintlocation, mintyear, circulation, grade, image1, image2, image3, face_value)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id;
      `;
      const values = [type, mintlocation, mintyear, circulation, grade, image1 || null, image2 || null, image3 || null, resolvedFaceValue ?? null];
  
      const result = await pool.query(query, values);
      response.status(200).send({ message: 'New coin record created', coinId: result.rows[0].id });
    } catch (error) {
      console.error(error);
      response.status(500).send('some error has occured');
    }
  });

// List all coins
router.get('/', async (request, response) => {
  try {
    const query = 'SELECT * FROM coins;';
    const allCoins = await pool.query(query);
    return response.status(200).json({
      data: allCoins.rows
    });
    } catch (error) {
    console.error(error);
    response.status(500).send('some error has occured');
    }
});

// Get a single coin by id
router.get('/:id', async (request, response) => {
  try {
    const { id } = request.params;
    const query = 'SELECT * FROM coins WHERE id = $1;';
    const { rows } = await pool.query(query, [id]);

    if (rows.length === 0) {
      return response.status(404).send('this coin is not in the database');
    }

    return response.status(200).json(rows[0]);
  } catch (error) {
    console.error(error);
    response.status(500).send('some error has occured');
  }
});

// Update a coin by id
router.put('/:id', async (request, response) => {
  try {
    const { id } = request.params;
    const { type, mintlocation, mintyear, circulation, grade, image1, image2, image3, face_value } = request.body;

    if (!type && !mintlocation && !mintyear && !circulation && !grade && !image1 && !image2 && !image3 && face_value === undefined) {
      return response.status(400).send('provide a field (type, mintlocation, mintyear, circulation, grade, image1, image2, image3, face_value)');
    }

    let resolvedFaceValue;
    if (face_value !== undefined) {
      const parsed = parseFloat(face_value);
      resolvedFaceValue = Number.isNaN(parsed) ? null : parsed;
    } else if (type) {
      resolvedFaceValue = await fetchFaceValueForType(type);
    }

    const query = `
      UPDATE coins
      SET type = COALESCE($1, type),
          mintlocation = COALESCE($2, mintlocation),
          mintyear = COALESCE($3, mintyear),
          circulation = COALESCE($4, circulation),
          grade = COALESCE($5, grade),
          image1 = COALESCE($6, image1),
          image2 = COALESCE($7, image2),
          image3 = COALESCE($8, image3),
          face_value = COALESCE($9, face_value)
      WHERE id = $10
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [type, mintlocation, mintyear, circulation, grade, image1, image2, image3, resolvedFaceValue, id]);

    if (rows.length === 0) {
      return response.status(404).send('Cannot find anything');
    }

    response.status(200).json(rows[0]);
  } catch (error) {
    console.error(error);
    response.status(500).send('Some error has occured failed');
  }
});

// Delete a coin by id
router.delete('/:id', async (request, response) => {
  try {
    const { id } = request.params;
    const query = 'DELETE FROM coins WHERE id = $1 RETURNING *;';
    const { rows } = await pool.query(query, [id]);

    if (rows.length === 0) {
      return response.status(404).send('we have not found that coin');
    }

    response.status(200).json(rows[0]);
  } catch (error) {
    console.error(error);
    response.status(500).send('some error has occured');
  }
});

// Upload coin images
router.post('/upload/:id', uploadWithErrors, async (request, response) => {
  try {
    const { id } = request.params;
    
    if (!request.files || request.files.length === 0) {
      return response.status(400).send('No files uploaded');
    }

    // Build the image paths
    const imagePaths = {};
    request.files.forEach((file, index) => {
      imagePaths[`image${index + 1}`] = `/uploads/${file.filename}`;
    });

    // Update the database with image paths
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
      UPDATE coins
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *;
    `;

    const { rows } = await pool.query(query, values);

    if (rows.length === 0) {
      return response.status(404).send('Coin not found');
    }

    response.status(200).json(rows[0]);
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: 'Error uploading images' });
  }
});

// Delete a specific image (image1, image2, or image3)
router.delete('/image/:id/:slot', async (request, response) => {
  try {
    const { id, slot } = request.params;
    const validSlots = ['image1', 'image2', 'image3'];
    if (!validSlots.includes(slot)) {
      return response.status(400).send('Invalid image slot');
    }

    // Fetch current image path
    const selectQuery = `SELECT ${slot} FROM coins WHERE id = $1;`;
    const { rows } = await pool.query(selectQuery, [id]);
    if (rows.length === 0) {
      return response.status(404).send('Coin not found');
    }
    const imagePath = rows[0][slot];

    // Clear DB field
    const updateQuery = `UPDATE coins SET ${slot} = NULL WHERE id = $1 RETURNING *;`;
    const updated = await pool.query(updateQuery, [id]);

    // Remove file from disk if exists
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

// Get AI-powered value estimate for a coin
router.post('/estimate/:id', async (request, response) => {
  try {
    const { id } = request.params;
    const openaiApiKey = process.env.OPENAI_API_KEY;

    if (!openaiApiKey) {
      return response.status(500).json({ error: 'OpenAI API key not configured' });
    }

    // Fetch coin details from database
    const coinQuery = 'SELECT * FROM coins WHERE id = $1;';
    const { rows } = await pool.query(coinQuery, [id]);

    if (rows.length === 0) {
      return response.status(404).json({ error: 'Coin not found' });
    }

    const coin = rows[0];
    const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '../uploads');

    // Prepare image data for OpenAI Vision
    const imageContent = [];

    // Add text description first
    imageContent.push({
      type: 'text',
      text: `Please estimate the value of this coin based on the provided images and details:
      
Type: ${coin.type}
Mint Location: ${coin.mintlocation}
Mint Year: ${coin.mintyear}
Circulation: ${coin.circulation}
Grade: ${coin.grade}

Based on current numismatic market values, provide:
1. An estimated market value in USD
2. A brief explanation of the valuation

Respond in JSON format: { "estimated_value": number, "explanation": "string" }`
    });

    // Add images if they exist
    const imageSlots = ['image1', 'image2', 'image3'];
    for (const slot of imageSlots) {
      const imagePath = coin[slot];
      if (imagePath) {
        const fullPath = path.join(uploadDir, path.basename(imagePath));
        if (fs.existsSync(fullPath)) {
          const lower = imagePath.toLowerCase();
          const ext = path.extname(lower);
          const allowed = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
          try {
            let outBuf = null;
            let mimeType = 'image/jpeg';
            if (allowed.includes(ext)) {
              const imageData = fs.readFileSync(fullPath);
              outBuf = imageData;
              mimeType =
                ext === '.png' ? 'image/png' :
                ext === '.gif' ? 'image/gif' :
                ext === '.webp' ? 'image/webp' : 'image/jpeg';
            } else if (ext === '.heic' || ext === '.heif') {
              // Convert HEIC/HEIF to JPEG (server-side) for OpenAI
              const inputBuffer = fs.readFileSync(fullPath);
              outBuf = await heicConvert({ buffer: inputBuffer, format: 'JPEG', quality: 0.8 });
              mimeType = 'image/jpeg';
            }

            if (outBuf) {
              const base64Image = outBuf.toString('base64');
              imageContent.push({
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${base64Image}`
                }
              });
            }
          } catch (convErr) {
            // If conversion fails, skip this image and continue
            console.warn('Image prepare/convert failed:', convErr?.message || convErr);
          }
        }
      }
    }

    // Call OpenAI API (configurable model)
    const model = process.env.OPENAI_MODEL || 'gpt-5-nano';
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'user',
            content: imageContent
          }
        ],
        max_completion_tokens: 800
      })
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json();
      console.error('OpenAI API error:', errorData);
      return response.status(500).json({ error: 'Failed to get estimate from OpenAI', details: errorData });
    }

    const openaiData = await openaiResponse.json();
    const estimateText = openaiData.choices[0].message.content;

    // Parse the JSON response from OpenAI with robust fallbacks
    let estimateData;
    const jsonMatch = estimateText.match(/\{[\s\S]*\}/);

    // Primary: JSON block
    if (jsonMatch) {
      try {
        estimateData = JSON.parse(jsonMatch[0]);
      } catch (err) {
        console.warn('Failed to parse JSON block from estimate:', err?.message || err);
      }
    }

    // Secondary: grab the first currency-like number (handles $1,234.56, ~120, 120 USD, etc.)
    if (!estimateData) {
      const numberMatch = estimateText.match(/\$?\s*(~)?\s*(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\d+(?:\.\d+)?)(?=\s*(USD|usd|dollars|bucks|$|\b))/);
      if (numberMatch) {
        const rawNum = numberMatch[2].replace(/,/g, '');
        const parsed = parseFloat(rawNum);
        if (!Number.isNaN(parsed)) {
          estimateData = {
            estimated_value: parsed,
            explanation: estimateText
          };
        }
      }
    }

    // Tertiary: any bare number
    if (!estimateData) {
      const looseMatch = estimateText.match(/\d+(?:\.\d+)?/);
      if (looseMatch) {
        const parsed = parseFloat(looseMatch[0]);
        if (!Number.isNaN(parsed)) {
          estimateData = {
            estimated_value: parsed,
            explanation: estimateText
          };
        }
      }
    }

    // Final fallback
    if (!estimateData) {
      estimateData = {
        estimated_value: null,
        explanation: estimateText
      };
    }

    // If no estimate was produced, fallback to the known face value
    const faceValueNumber = coin.face_value != null ? Number(coin.face_value) : null;
    const finalEstimate = estimateData.estimated_value != null && !Number.isNaN(Number(estimateData.estimated_value))
      ? Number(estimateData.estimated_value)
      : faceValueNumber;

    if ((estimateData.estimated_value == null || Number.isNaN(Number(estimateData.estimated_value))) && faceValueNumber != null) {
      estimateData.explanation = estimateData.explanation || 'Using face value because AI estimate was unavailable.';
    }

    // Update coin record with estimated (or fallback) value
    const updateQuery = 'UPDATE coins SET estimated_value = $1 WHERE id = $2 RETURNING *;';
    const updateResult = await pool.query(updateQuery, [finalEstimate, id]);

    response.status(200).json({
      estimated_value: finalEstimate,
      explanation: estimateData.explanation,
      coin: updateResult.rows[0]
    });

  } catch (error) {
    console.error('Estimate error:', error);
    response.status(500).json({ error: 'Error getting estimate', details: error.message });
  }
});

export default router;