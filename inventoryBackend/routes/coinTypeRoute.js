import express from 'express';
import { pool } from '../database/database.js';
import { requireAuth } from '../middleware/auth.js';
import {
  asyncHandler,
  BadRequestError,
  NotFoundError
} from '../middleware/errorHandler.js';

const router = express.Router();

// Protect all routes in this router with authentication
router.use(requireAuth);

// List all coin types
router.get('/', asyncHandler(async (_req, res) => {
  const { rows } = await pool.query('SELECT * FROM cointypes ORDER BY name ASC;');
  res.status(200).json({ data: rows });
}));

// Lightweight names list (includes face_value for client defaults)
router.get('/names', asyncHandler(async (_req, res) => {
  const { rows } = await pool.query('SELECT name, face_value FROM cointypes ORDER BY name ASC;');
  res.status(200).json({ data: rows });
}));

// Create a coin type
router.post('/', asyncHandler(async (req, res) => {
  const { name, face_value } = req.body;
  const parsedFace = face_value === undefined ? NaN : parseFloat(face_value);

  if (!name || Number.isNaN(parsedFace)) {
    throw new BadRequestError('Name and valid face_value are required');
  }

  const query = `
    INSERT INTO cointypes (name, face_value)
    VALUES ($1, $2)
    RETURNING *;
  `;
  const { rows } = await pool.query(query, [name, parsedFace]);
  res.status(200).json(rows[0]);
}));

// Get a single coin type by id
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rows } = await pool.query('SELECT * FROM cointypes WHERE id = $1;', [id]);
  if (rows.length === 0) {
    throw new NotFoundError('Coin type not found');
  }
  res.status(200).json(rows[0]);
}));

// Update a coin type
router.put('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, face_value } = req.body;
  const parsedFace = face_value === undefined ? undefined : parseFloat(face_value);

  if (!name && parsedFace === undefined) {
    throw new BadRequestError('Provide a name or face_value to update');
  }

  if (parsedFace !== undefined && Number.isNaN(parsedFace)) {
    throw new BadRequestError('face_value must be numeric');
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
    throw new NotFoundError('Coin type not found');
  }

  res.status(200).json(rows[0]);
}));

// Delete a coin type
router.delete('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rows } = await pool.query('DELETE FROM cointypes WHERE id = $1 RETURNING *;', [id]);

  if (rows.length === 0) {
    throw new NotFoundError('Coin type not found');
  }

  res.status(200).json(rows[0]);
}));

export default router;
