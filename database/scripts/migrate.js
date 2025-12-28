import "dotenv/config";
import fs from 'fs';
import path from 'path';
import { pool } from '../database.js';

/**
 * Ensures the schema_migrations table exists
 * This is the ONLY table we create with IF NOT EXISTS
 */
async function ensureMigrationsTable() {
  const sql = `
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      version VARCHAR(255) NOT NULL UNIQUE,
      name VARCHAR(255) NOT NULL,
      applied_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      execution_time_ms INTEGER
    );
  `;
  await pool.query(sql);
}

/**
 * Gets all migration files from the migrations directory
 * Returns them sorted by version number
 */
async function getMigrationFiles() {
  const migrationsDir = path.join(
    path.dirname(new URL(import.meta.url).pathname),
    '../migrations'
  );

  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort(); // Alphabetical = chronological with numbered prefixes

  return files.map(filename => {
    // Match pattern: 001_migration_name.sql
    const match = filename.match(/^(\d+)_(.+)\.sql$/);
    if (!match) {
      throw new Error(`Invalid migration filename: ${filename}`);
    }

    return {
      version: match[1],
      name: match[2].replace(/_/g, ' '),
      filename: filename,
      path: path.join(migrationsDir, filename)
    };
  });
}

/**
 * Checks if a migration has already been applied
 */
async function isMigrationApplied(version) {
  const result = await pool.query(
    'SELECT version FROM schema_migrations WHERE version = $1',
    [version]
  );
  return result.rows.length > 0;
}

/**
 * Runs a single migration within a transaction
 */
async function runMigration(version, name, sqlFilePath) {
  // Check if already applied
  if (await isMigrationApplied(version)) {
    console.log(`⏭️  Skipping ${version} - already applied`);
    return;
  }

  const client = await pool.connect();

  try {
    // Start transaction
    await client.query('BEGIN');

    // Read and execute the migration SQL
    const sql = fs.readFileSync(sqlFilePath, 'utf8');
    const startTime = Date.now();

    await client.query(sql);

    const executionTime = Date.now() - startTime;

    // Record that this migration was applied
    await client.query(
      `INSERT INTO schema_migrations (version, name, execution_time_ms)
       VALUES ($1, $2, $3)`,
      [version, name, executionTime]
    );

    // Commit transaction
    await client.query('COMMIT');

    console.log(`✅ Applied ${version}_${name.replace(/ /g, '_')} in ${executionTime}ms`);
  } catch (error) {
    // Rollback on any error
    await client.query('ROLLBACK');
    console.error(`❌ Failed to apply ${version}:`, error.message);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Main migration runner
 */
async function runMigrations() {
  console.log('🚀 Starting database migrations...\n');

  try {
    // Ensure migrations table exists
    await ensureMigrationsTable();

    // Get all migration files
    const migrations = await getMigrationFiles();
    console.log(`📁 Found ${migrations.length} migration file(s)\n`);

    // Run each migration
    let appliedCount = 0;
    for (const migration of migrations) {
      const wasApplied = await isMigrationApplied(migration.version);
      if (!wasApplied) {
        await runMigration(migration.version, migration.name, migration.path);
        appliedCount++;
      } else {
        console.log(`⏭️  Skipping ${migration.version} - already applied`);
      }
    }

    console.log(`\n✅ Migration complete! Applied ${appliedCount} migration(s)`);
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
