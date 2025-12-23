import express from 'express';
import { pool } from '../database/database.js';

const router = express.Router();

// List all relic types
router.get('/', async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM relictypes ORDER BY name ASC;');
    res.status(200).json({ data: rows });
  } catch (error) {
    console.error(error);
    res.status(500).send('Unable to fetch relic types');
  }
});

// Create a relic type
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).send('Name is required');
    }

    const query = `
      INSERT INTO relictypes (name)
      VALUES ($1)
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [name]);
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send('Unable to create relic type');
  }
});

// Get a single relic type by id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query('SELECT * FROM relictypes WHERE id = $1;', [id]);
    if (rows.length === 0) {
      return res.status(404).send('Relic type not found');
    }
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send('Unable to fetch relic type');
  }
});

// Update a relic type
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).send('Name is required');
    }

    const query = `
      UPDATE relictypes
      SET name = $1
      WHERE id = $2
      RETURNING *;
    `;

    const { rows } = await pool.query(query, [name, id]);

    if (rows.length === 0) {
      return res.status(404).send('Relic type not found');
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send('Unable to update relic type');
  }
});

// Delete a relic type
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query('DELETE FROM relictypes WHERE id = $1 RETURNING *;', [id]);

    if (rows.length === 0) {
      return res.status(404).send('Relic type not found');
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send('Unable to delete relic type');
  }
});

export default router;
