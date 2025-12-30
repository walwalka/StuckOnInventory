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

// List all comic publishers
router.get('/', asyncHandler(async (_req, res) => {
  const { rows } = await pool.query('SELECT * FROM comicpublishers ORDER BY name ASC;');
  res.status(200).json({ data: rows });
}));

// Create a comic publisher
router.post('/', asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name) {
    throw new BadRequestError('Name is required');
  }

  const query = `
    INSERT INTO comicpublishers (name)
    VALUES ($1)
    RETURNING *;
  `;
  const { rows } = await pool.query(query, [name]);
  res.status(200).json(rows[0]);
}));

// Get a single comic publisher by id
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rows } = await pool.query('SELECT * FROM comicpublishers WHERE id = $1;', [id]);
  if (rows.length === 0) {
    throw new NotFoundError('Comic publisher not found');
  }
  res.status(200).json(rows[0]);
}));

// Update a comic publisher
router.put('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name) {
    throw new BadRequestError('Name is required');
  }

  const query = `
    UPDATE comicpublishers
    SET name = $1
    WHERE id = $2
    RETURNING *;
  `;

  const { rows } = await pool.query(query, [name, id]);

  if (rows.length === 0) {
    throw new NotFoundError('Comic publisher not found');
  }

  res.status(200).json(rows[0]);
}));

// Delete a comic publisher
router.delete('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rows } = await pool.query('DELETE FROM comicpublishers WHERE id = $1 RETURNING *;', [id]);

  if (rows.length === 0) {
    throw new NotFoundError('Comic publisher not found');
  }

  res.status(200).json(rows[0]);
}));

export default router;
