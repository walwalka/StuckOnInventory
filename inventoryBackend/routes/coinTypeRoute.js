import express from 'express';
import { pool } from '../database/database.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Protect all routes in this router with authentication
router.use(requireAuth);

// List all coin types
router.get('/', async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM cointypes ORDER BY name ASC;');
    res.status(200).json({ data: rows });
  } catch (error) {
    console.error(error);
    res.status(500).send('Unable to fetch coin types');
  }
});

// Lightweight names list (includes face_value for client defaults)
router.get('/names', async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT name, face_value FROM cointypes ORDER BY name ASC;');
    res.status(200).json({ data: rows });
  } catch (error) {
    console.error(error);
    res.status(500).send('Unable to fetch coin type names');
  }
});

// Create a coin type
router.post('/', async (req, res) => {
  try {
    const { name, face_value } = req.body;
    const parsedFace = face_value === undefined ? NaN : parseFloat(face_value);

    if (!name || Number.isNaN(parsedFace)) {
      return res.status(400).send('Name and valid face_value are required');
    }

    const query = `
      INSERT INTO cointypes (name, face_value)
      VALUES ($1, $2)
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [name, parsedFace]);
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send('Unable to create coin type');
  }
});

// Get a single coin type by id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query('SELECT * FROM cointypes WHERE id = $1;', [id]);
    if (rows.length === 0) {
      return res.status(404).send('Coin type not found');
    }
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send('Unable to fetch coin type');
  }
});

// Update a coin type
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, face_value } = req.body;
    const parsedFace = face_value === undefined ? undefined : parseFloat(face_value);

    if (!name && parsedFace === undefined) {
      return res.status(400).send('Provide a name or face_value to update');
    }

    if (parsedFace !== undefined && Number.isNaN(parsedFace)) {
      return res.status(400).send('face_value must be numeric');
    }

    const query = `
      UPDATE cointypes
      SET name = COALESCE($1, name),
          face_value = COALESCE($2, face_value)
      WHERE id = $3
      RETURNING *;
    `;

    const { rows } = await pool.query(query, [name || null, parsedFace ?? null, id]);

    if (rows.length === 0) {
      return res.status(404).send('Coin type not found');
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send('Unable to update coin type');
  }
});

// Delete a coin type
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query('DELETE FROM cointypes WHERE id = $1 RETURNING *;', [id]);

    if (rows.length === 0) {
      return res.status(404).send('Coin type not found');
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send('Unable to delete coin type');
  }
});

export default router;
