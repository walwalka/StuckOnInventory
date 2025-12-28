import "dotenv/config";
import fs from 'fs';
import path from 'path';
import { pool } from '../database.js';

/**
 * Ensures the schema_migrations table exists
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
 */
async function getMigrationFiles() {
  const migrationsDir = path.join(
    path.dirname(new URL(import.meta.url).pathname),
    '../migrations'
  );

  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  return files.map(filename => {
    const match = filename.match(/^(\d+)_(.+)\.sql$/);
    if (!match) {
      throw new Error(`Invalid migration filename: ${filename}`);
    }

    return {
      version: match[1],
      name: match[2].replace(/_/g, ' '),
      filename: filename
    };
  });
}

/**
 * Shows the current migration status
 */
async function showMigrationStatus() {
  try {
    await ensureMigrationsTable();

    const applied = await pool.query(
      'SELECT version, name, applied_at, execution_time_ms FROM schema_migrations ORDER BY version'
    );

    const files = await getMigrationFiles();

    console.log('\n📊 Migration Status:\n');
    console.log('Version | Status     | Name                               | Applied At       | Time (ms)');
    console.log('--------|------------|------------------------------------|-----------------|-----------');

    for (const migration of files) {
      const record = applied.rows.find(r => r.version === migration.version);
      const status = record ? '✅ Applied' : '⏳ Pending';
      const appliedAt = record
        ? record.applied_at.toISOString().split('T')[0]
        : '-';
      const execTime = record && record.execution_time_ms
        ? record.execution_time_ms.toString()
        : '-';

      console.log(
        `${migration.version.padEnd(7)} | ${status.padEnd(10)} | ` +
        `${migration.name.padEnd(34)} | ${appliedAt.padEnd(15)} | ${execTime.padEnd(9)}`
      );
    }

    const pendingCount = files.length - applied.rows.length;
    console.log(`\n📈 Summary: ${applied.rows.length} applied, ${pendingCount} pending\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error showing migration status:', error);
    process.exit(1);
  }
}

showMigrationStatus();
