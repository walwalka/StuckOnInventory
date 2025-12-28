import "dotenv/config";
import fs from 'fs';
import path from 'path';
import { pool } from '../database.js';

/**
 * Gets applied migrations in reverse chronological order
 */
async function getAppliedMigrations() {
  const result = await pool.query(
    'SELECT version, name, applied_at FROM schema_migrations ORDER BY version DESC'
  );
  return result.rows;
}

/**
 * Checks if a migration has a down/rollback file
 */
function hasRollbackFile(version) {
  const migrationsDir = path.join(
    path.dirname(new URL(import.meta.url).pathname),
    '../migrations'
  );

  // Check for directory-based migration (migrations/001_name/down.sql)
  const migrationDirPath = path.join(migrationsDir, `${version}_*`);
  const dirs = fs.readdirSync(migrationsDir).filter(f => f.startsWith(`${version}_`));

  if (dirs.length > 0) {
    const migrationDir = path.join(migrationsDir, dirs[0]);
    if (fs.existsSync(migrationDir) && fs.statSync(migrationDir).isDirectory()) {
      const downPath = path.join(migrationDir, 'down.sql');
      if (fs.existsSync(downPath)) {
        return { exists: true, path: downPath, type: 'directory' };
      }
    }
  }

  // Check for single file with .down.sql extension
  const downFilePath = path.join(migrationsDir, `${version}_*.down.sql`);
  const downFiles = fs.readdirSync(migrationsDir).filter(f =>
    f.startsWith(`${version}_`) && f.endsWith('.down.sql')
  );

  if (downFiles.length > 0) {
    return {
      exists: true,
      path: path.join(migrationsDir, downFiles[0]),
      type: 'single'
    };
  }

  return { exists: false, path: null, type: null };
}

/**
 * Rolls back a single migration
 */
async function rollbackMigration(version, name) {
  const rollbackInfo = hasRollbackFile(version);

  if (!rollbackInfo.exists) {
    console.error(`[ERROR] No rollback file found for migration ${version}`);
    console.error(`       Migration ${version} cannot be rolled back automatically`);
    console.error(`       You must manually reverse the changes or create a down migration`);
    throw new Error(`No rollback available for migration ${version}`);
  }

  const client = await pool.connect();

  try {
    console.log(`[ROLLBACK] Rolling back ${version}_${name.replace(/ /g, '_')}...`);

    // Start transaction
    await client.query('BEGIN');

    // Read and execute the rollback SQL
    const sql = fs.readFileSync(rollbackInfo.path, 'utf8');
    const startTime = Date.now();

    await client.query(sql);

    const executionTime = Date.now() - startTime;

    // Remove the migration record
    await client.query(
      'DELETE FROM schema_migrations WHERE version = $1',
      [version]
    );

    // Commit transaction
    await client.query('COMMIT');

    console.log(`[OK] Rolled back ${version} in ${executionTime}ms`);
  } catch (error) {
    // Rollback on any error
    await client.query('ROLLBACK');
    console.error(`[ERROR] Failed to rollback ${version}:`, error.message);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Main rollback runner
 */
async function runRollback(steps = 1) {
  console.log(`Rolling back last ${steps} migration(s)...\n`);

  try {
    // Get applied migrations
    const applied = await getAppliedMigrations();

    if (applied.length === 0) {
      console.log('[INFO] No migrations to rollback');
      process.exit(0);
    }

    // Limit steps to available migrations
    const migrationsToRollback = applied.slice(0, Math.min(steps, applied.length));

    console.log(`Found ${applied.length} applied migration(s)`);
    console.log(`Will rollback ${migrationsToRollback.length} migration(s):\n`);

    // Show what will be rolled back
    for (const migration of migrationsToRollback) {
      const rollbackInfo = hasRollbackFile(migration.version);
      const status = rollbackInfo.exists ? '[Available]' : '[NO ROLLBACK]';
      console.log(`  ${status} ${migration.version} - ${migration.name}`);
    }
    console.log();

    // Rollback each migration
    let rolledBackCount = 0;
    for (const migration of migrationsToRollback) {
      await rollbackMigration(migration.version, migration.name);
      rolledBackCount++;
    }

    console.log(`\n[SUCCESS] Rolled back ${rolledBackCount} migration(s)`);
    process.exit(0);
  } catch (error) {
    console.error('\n[ERROR] Rollback failed:', error.message);
    console.error('       Database has been rolled back to previous state');
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const steps = args.length > 0 ? parseInt(args[0]) : 1;

if (isNaN(steps) || steps < 1) {
  console.error('[ERROR] Invalid number of steps. Usage: npm run migrate:rollback [steps]');
  console.error('        Example: npm run migrate:rollback 1');
  process.exit(1);
}

runRollback(steps);
