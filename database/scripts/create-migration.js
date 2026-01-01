import fs from 'fs';
import path from 'path';

/**
 * Creates a new migration with up and down files
 */
function createMigration(name) {
  if (!name) {
    console.error('[ERROR] Migration name is required');
    console.error('        Usage: npm run migrate:create <migration_name>');
    console.error('        Example: npm run migrate:create add_wishlist_table');
    process.exit(1);
  }

  // Get next migration version
  const migrationsDir = path.join(
    path.dirname(new URL(import.meta.url).pathname),
    '../migrations'
  );

  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.match(/^\d+_/))
    .sort();

  let nextVersion = '001';
  if (files.length > 0) {
    const lastFile = files[files.length - 1];
    const lastVersion = parseInt(lastFile.match(/^(\d+)/)[1]);
    nextVersion = String(lastVersion + 1).padStart(3, '0');
  }

  const migrationName = name.toLowerCase().replace(/[^a-z0-9]+/g, '_');
  const migrationDir = path.join(migrationsDir, `${nextVersion}_${migrationName}`);

  // Create migration directory
  if (fs.existsSync(migrationDir)) {
    console.error(`[ERROR] Migration directory already exists: ${migrationDir}`);
    process.exit(1);
  }

  fs.mkdirSync(migrationDir);

  const timestamp = new Date().toISOString().split('T')[0];

  // Create up migration file
  const upTemplate = `-- Migration: ${name}
-- Description: [Add description here]
-- Created: ${timestamp}

-- Add your forward migration SQL here
-- Example:
-- CREATE TABLE example (
--   id SERIAL PRIMARY KEY,
--   name VARCHAR(255) NOT NULL
-- );
`;

  const upPath = path.join(migrationDir, 'up.sql');
  fs.writeFileSync(upPath, upTemplate);

  // Create down migration file
  const downTemplate = `-- Rollback: ${name}
-- Description: Rollback changes from ${nextVersion}_${migrationName}
-- Created: ${timestamp}

-- Add your rollback SQL here
-- This should reverse the changes made in up.sql
-- Example:
-- DROP TABLE IF EXISTS example;
`;

  const downPath = path.join(migrationDir, 'down.sql');
  fs.writeFileSync(downPath, downTemplate);

  console.log('\n[SUCCESS] Created new migration:');
  console.log(`           ${nextVersion}_${migrationName}/`);
  console.log(`           ├── up.sql   (forward migration)`);
  console.log(`           └── down.sql (rollback migration)`);
  console.log(`\nNext steps:`);
  console.log(`  1. Edit ${upPath}`);
  console.log(`  2. Edit ${downPath}`);
  console.log(`  3. Run: npm run migrate`);
  console.log(`  4. Test rollback: npm run migrate:rollback\n`);
}

// Get migration name from command line
const args = process.argv.slice(2);
const migrationName = args.join('_');

createMigration(migrationName);
