import express from 'express';
import { pool } from '../database/database.js';

const router = express.Router();

// List all comic publishers
router.get('/', async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM comicpublishers ORDER BY name ASC;');
    res.status(200).json({ data: rows });
  } catch (error) {
    console.error(error);
    res.status(500).send('Unable to fetch comic publishers');
  }
});

// Create a comic publisher
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).send('Name is required');
    }

    const query = `
      INSERT INTO comicpublishers (name)
      VALUES ($1)
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [name]);
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send('Unable to create comic publisher');
  }
});

// Get a single comic publisher by id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query('SELECT * FROM comicpublishers WHERE id = $1;', [id]);
    if (rows.length === 0) {
      return res.status(404).send('Comic publisher not found');
    }
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send('Unable to fetch comic publisher');
  }
});

// Update a comic publisher
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).send('Name is required');
    }

    const query = `
      UPDATE comicpublishers
      SET name = $1
      WHERE id = $2
      RETURNING *;
    `;

    const { rows } = await pool.query(query, [name, id]);

    if (rows.length === 0) {
      return res.status(404).send('Comic publisher not found');
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send('Unable to update comic publisher');
  }
});

// Delete a comic publisher
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query('DELETE FROM comicpublishers WHERE id = $1 RETURNING *;', [id]);

    if (rows.length === 0) {
      return res.status(404).send('Comic publisher not found');
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send('Unable to delete comic publisher');
  }
});

export default router;
