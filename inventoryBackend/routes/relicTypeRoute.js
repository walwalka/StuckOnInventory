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

// List all relic types
router.get('/', asyncHandler(async (_req, res) => {
  const { rows } = await pool.query('SELECT * FROM relictypes ORDER BY name ASC;');
  res.status(200).json({ data: rows });
}));

// Create a relic type
router.post('/', asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name) {
    throw new BadRequestError('Name is required');
  }

  const query = `
    INSERT INTO relictypes (name)
    VALUES ($1)
    RETURNING *;
  `;
  const { rows } = await pool.query(query, [name]);
  res.status(200).json(rows[0]);
}));

// Get a single relic type by id
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rows } = await pool.query('SELECT * FROM relictypes WHERE id = $1;', [id]);
  if (rows.length === 0) {
    throw new NotFoundError('Relic type not found');
  }
  res.status(200).json(rows[0]);
}));

// Update a relic type
router.put('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name) {
    throw new BadRequestError('Name is required');
  }

  const query = `
    UPDATE relictypes
    SET name = $1
    WHERE id = $2
    RETURNING *;
  `;

  const { rows } = await pool.query(query, [name, id]);

  if (rows.length === 0) {
    throw new NotFoundError('Relic type not found');
  }

  res.status(200).json(rows[0]);
}));

// Delete a relic type
router.delete('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rows } = await pool.query('DELETE FROM relictypes WHERE id = $1 RETURNING *;', [id]);

  if (rows.length === 0) {
    throw new NotFoundError('Relic type not found');
  }

  res.status(200).json(rows[0]);
}));

export default router;
