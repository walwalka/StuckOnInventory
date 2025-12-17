import "dotenv/config";
import pg from 'pg'
import fs from 'fs';
import path from 'path';
import { sqlIp , sqlDb, sqlPass, sqlUser, sqlPort } from '../inventoryBackend/config.js';

const { Pool } = pg;

export const pool = new Pool({
    user: sqlUser,
    host: sqlIp,
    database: sqlDb,
    password: sqlPass,
    port: sqlPort,
  });

  async function createCoinTable() {
    try {
      const query = `
        CREATE TABLE IF NOT EXISTS coins (
          id SERIAL PRIMARY KEY,
          type VARCHAR(255) NOT NULL,
          mintlocation VARCHAR(255) NOT NULL,
          mintyear DATE NOT NULL,
          circulation VARCHAR(255) NOT NULL,
          grade VARCHAR(255) NOT NULL,
          image1 VARCHAR(500),
          image2 VARCHAR(500),
          image3 VARCHAR(500),
          face_value DECIMAL(10,2),
          added_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          estimated_value DECIMAL(10, 2)
        );
      `;
  
      await pool.query(query);
      console.log('Coin table created');
    } catch (error) {
      console.error(error);
      console.error('Coin table creation failed');
    }
  }

  async function ensureCoinImageColumns() {
    try {
      await pool.query('ALTER TABLE coins ADD COLUMN IF NOT EXISTS image1 VARCHAR(500);');
      await pool.query('ALTER TABLE coins ADD COLUMN IF NOT EXISTS image2 VARCHAR(500);');
      await pool.query('ALTER TABLE coins ADD COLUMN IF NOT EXISTS image3 VARCHAR(500);');
      await pool.query('ALTER TABLE coins ADD COLUMN IF NOT EXISTS face_value DECIMAL(10,2);');
      await pool.query('ALTER TABLE coins ADD COLUMN IF NOT EXISTS added_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;');
      await pool.query('ALTER TABLE coins ADD COLUMN IF NOT EXISTS estimated_value DECIMAL(10, 2);');
      console.log('Coin image columns ensured');
    } catch (error) {
      console.error(error);
      console.error('Failed to ensure coin image columns');
    }
  }
  
  // Initialize database schema and seed data in sequence

  async function createMintTable() {
    try {
      const query = `
        CREATE TABLE IF NOT EXISTS mintlocations (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          city VARCHAR(255) NOT NULL,
          state VARCHAR(255) NOT NULL
        );
      `;
  
      await pool.query(query);
      // Ensure a unique index exists on name for upserts
      await pool.query('CREATE UNIQUE INDEX IF NOT EXISTS uq_mint_name ON mintlocations (name);');
      console.log('Mint table created');
    } catch (error) {
      console.error(error);
      console.error('Mint table creation failed');
    }
  }

  async function createCoinTypesTable() {
    try {
      // Drop and recreate to ensure fresh schema with UNIQUE constraint
      await pool.query('DROP TABLE IF EXISTS cointypes CASCADE;');
      
      const query = `
        CREATE TABLE IF NOT EXISTS cointypes (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL UNIQUE,
          face_value DECIMAL(10,2) NOT NULL
        );
      `;

      await pool.query(query);
      console.log('Coin types table created');
    } catch (error) {
      console.error(error);
      console.error('Coin types table creation failed');
    }
  }
  
  // (creation happens within initDatabase)

  async function seedMintLocations() {
    try {
      // Load authoritative mint list from JSON file
      const mintsPath = path.resolve(path.dirname(new URL(import.meta.url).pathname), 'mints.json');
      const content = fs.readFileSync(mintsPath, 'utf-8');
      const desired = JSON.parse(content);

      // Begin transaction and reconcile DB to desired list
      await pool.query('BEGIN');

      // Upsert desired entries
      const upsertText = `
        INSERT INTO mintlocations (name, city, state)
        VALUES ($1, $2, $3)
        ON CONFLICT (name) DO UPDATE SET
          city = EXCLUDED.city,
          state = EXCLUDED.state;
      `;
      for (const m of desired) {
        await pool.query(upsertText, [m.name, m.city, m.state]);
      }

      // Delete any entries not in desired
      const namesList = desired.map(d => d.name);
      const placeholders = namesList.map((_, i) => `$${i + 1}`).join(', ');
      const deleteText = `DELETE FROM mintlocations WHERE name NOT IN (${placeholders})`;
      await pool.query(deleteText, namesList);

      await pool.query('COMMIT');
      console.log('Mint locations reconciled successfully');
    } catch (error) {
      console.error(error);
      try { await pool.query('ROLLBACK'); } catch {}
      console.error('Mint locations reconciliation failed');
    }
  }

  async function seedCoinTypes() {
    try {
      const typesPath = path.resolve(path.dirname(new URL(import.meta.url).pathname), 'cointypes.json');
      const content = fs.readFileSync(typesPath, 'utf-8');
      const desired = JSON.parse(content);

      const upsertText = `
        INSERT INTO cointypes (name, face_value)
        VALUES ($1, $2)
        ON CONFLICT (name) DO UPDATE SET
          face_value = EXCLUDED.face_value;
      `;

      for (const t of desired) {
        await pool.query(upsertText, [t.name, t.face_value]);
      }

      console.log('Coin types seeded/updated successfully');
    } catch (error) {
      console.error(error);
      console.error('Coin types seed failed');
    }
  }
  
  async function createRelicsTable() {
    try {
      const query = `
        CREATE TABLE IF NOT EXISTS relics (
          id SERIAL PRIMARY KEY,
          type VARCHAR(255) NOT NULL,
          origin VARCHAR(255) NOT NULL,
          era VARCHAR(255) NOT NULL,
          condition VARCHAR(255) NOT NULL,
          description TEXT,
          image1 VARCHAR(500),
          image2 VARCHAR(500),
          image3 VARCHAR(500)
        );
      `;
  
      await pool.query(query);
      console.log('Relics table created');
    } catch (error) {
      console.error(error);
      console.error('Relics table creation failed');
    }
  }

  async function createStampsTable() {
    try {
      const query = `
        CREATE TABLE IF NOT EXISTS stamps (
          id SERIAL PRIMARY KEY,
          country VARCHAR(255) NOT NULL,
          denomination VARCHAR(255) NOT NULL,
          issueyear VARCHAR(255) NOT NULL,
          condition VARCHAR(255) NOT NULL,
          description TEXT,
          image1 VARCHAR(500),
          image2 VARCHAR(500),
          image3 VARCHAR(500)
        );
      `;
  
      await pool.query(query);
      console.log('Stamps table created');
    } catch (error) {
      console.error(error);
      console.error('Stamps table creation failed');
    }
  }

  async function createBunnykinTable() {
    try {
      const query = `
        CREATE TABLE IF NOT EXISTS bunnykins (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          series VARCHAR(255) NOT NULL,
          productionyear VARCHAR(255) NOT NULL,
          condition VARCHAR(255) NOT NULL,
          description TEXT,
          image1 VARCHAR(500),
          image2 VARCHAR(500),
          image3 VARCHAR(500)
        );
      `;
  
      await pool.query(query);
      console.log('Bunnykins table created');
    } catch (error) {
      console.error(error);
      console.error('Bunnykins table creation failed');
    }
  }

  async function initDatabase() {
    try {
      await createCoinTable();
      await ensureCoinImageColumns();
      await createCoinTypesTable();
      await seedCoinTypes();
      await createMintTable();
      await seedMintLocations();
      await createRelicsTable();
      await createStampsTable();
      await createBunnykinTable();
    } catch (err) {
      console.error('Database init failed', err);
    }
  }

  initDatabase();
