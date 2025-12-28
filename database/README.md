# Database Migration System

This project uses a custom migration system to manage database schema changes in a controlled, version-tracked manner.

## Overview

**Migration tracking** ensures that:
- Database schema changes are applied exactly once
- Changes are applied in the correct order
- Multiple environments (dev, staging, prod) stay in sync
- You can see which migrations have been applied
- Schema changes are version controlled and auditable

## Directory Structure

```
database/
├── migrations/               # All migration SQL files
│   ├── 001_initial_tables.sql
│   ├── 002_seed_reference_data.sql
│   ├── 003_add_auth_columns.sql
│   ├── 004_add_invite_system.sql
│   ├── 005_add_user_active_status.sql
│   └── 006_add_quantity_columns.sql
├── scripts/                  # Migration runner scripts
│   ├── migrate.js           # Runs pending migrations
│   └── migration-status.js  # Shows migration status
├── config-db.js             # Database configuration
├── database.js              # Database connection pool (no auto-init)
├── mints.json               # Reference data for mint locations
├── cointypes.json           # Reference data for coin types
└── README.md                # This file
```

## How It Works

### Migration Tracking Table

All applied migrations are recorded in the `schema_migrations` table:

```sql
CREATE TABLE schema_migrations (
  id SERIAL PRIMARY KEY,
  version VARCHAR(255) NOT NULL UNIQUE,     -- e.g., "001", "002"
  name VARCHAR(255) NOT NULL,               -- e.g., "initial tables"
  applied_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  execution_time_ms INTEGER                 -- How long it took
);
```

### Migration Workflow

1. **Check if migration applied** - Query `schema_migrations` for version
2. **Skip if already applied** - Don't run it again
3. **Run if pending** - Execute SQL within a transaction
4. **Record success** - Insert record into `schema_migrations`
5. **Rollback on error** - Transaction ensures all-or-nothing

## Usage

### Running Migrations

From the `inventoryBackend` directory:

```bash
# Run all pending migrations
npm run migrate

# Check migration status
npm run migrate:status
```

**Example output:**

```
🚀 Starting database migrations...

📁 Found 6 migration file(s)

✅ Applied 001_initial_tables in 234ms
✅ Applied 002_seed_reference_data in 89ms
⏭️  Skipping 003 - already applied
⏭️  Skipping 004 - already applied
⏭️  Skipping 005 - already applied
⏭️  Skipping 006 - already applied

✅ Migration complete! Applied 2 migration(s)
```

### Checking Migration Status

```bash
npm run migrate:status
```

**Example output:**

```
📊 Migration Status:

Version | Status     | Name                               | Applied At       | Time (ms)
--------|------------|------------------------------------|-----------------|-----------
001     | ✅ Applied | initial tables                     | 2024-12-28      | 234
002     | ✅ Applied | seed reference data                | 2024-12-28      | 89
003     | ✅ Applied | add auth columns                   | 2024-12-28      | 45
004     | ⏳ Pending | add invite system                  | -               | -
005     | ⏳ Pending | add user active status             | -               | -
006     | ⏳ Pending | add quantity columns               | -               | -

📈 Summary: 3 applied, 3 pending
```

## Docker Integration

The Docker setup automatically runs migrations before starting the backend:

```yaml
services:
  db:
    # PostgreSQL database

  db-migrate:
    # Runs migrations once
    depends_on:
      db:
        condition: service_healthy
    command: npm run migrate
    restart: "no"  # Only runs once

  backend:
    # Backend waits for migrations to complete
    depends_on:
      db-migrate:
        condition: service_completed_successfully
```

### Docker Commands

```bash
# Start everything (includes migrations)
docker compose up

# Rebuild and start
docker compose up --build

# Run migrations manually
docker compose run --rm db-migrate

# View migration logs
docker compose logs db-migrate

# Destroy database and start fresh
docker compose down -v
docker compose up
```

## Creating New Migrations

### Step 1: Create Migration File

Create a new numbered SQL file in `database/migrations/`:

```bash
# Next available number is 007
touch database/migrations/007_add_wishlist_feature.sql
```

### Step 2: Write Migration SQL

```sql
-- Migration: Add wishlist feature
-- Description: Creates wishlist table for users to save items
-- Created: 2024-12-28

CREATE TABLE wishlists (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_type VARCHAR(50) NOT NULL,  -- 'coin', 'stamp', 'comic', etc.
  item_id INTEGER NOT NULL,
  added_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_wishlists_user_id ON wishlists(user_id);
CREATE INDEX idx_wishlists_item ON wishlists(item_type, item_id);
```

### Step 3: Test Locally

```bash
cd inventoryBackend
npm run migrate:status  # Check current state
npm run migrate         # Apply new migration
npm run migrate:status  # Verify it was applied
```

### Step 4: Commit and Deploy

```bash
git add database/migrations/007_add_wishlist_feature.sql
git commit -m "Add wishlist feature migration"
git push
```

## Migration Best Practices

### ✅ DO

- **Use transactions** - The migration runner handles this automatically
- **Make migrations idempotent when possible** - Use `IF NOT EXISTS` for checks
- **Test on a copy of production data** - Before running in production
- **Keep migrations small and focused** - One feature per migration
- **Include comments** - Explain what and why
- **Use descriptive names** - `007_add_wishlist_feature.sql` not `007_update.sql`
- **Never modify applied migrations** - Create a new migration to fix issues

### ❌ DON'T

- **Don't modify applied migrations** - Create a new migration instead
- **Don't include environment-specific settings** - Keep migrations portable
- **Don't mix DDL and large data changes** - Separate schema from data
- **Don't use `DROP TABLE`** - Unless you're absolutely sure
- **Don't skip error handling** - Migrations fail fast and rollback

## Common Scenarios

### Fresh Database Setup

```bash
# 1. Start database
docker compose up db

# 2. Run migrations
cd inventoryBackend
npm run migrate

# 3. Verify
npm run migrate:status

# Output: All 6 migrations applied
```

### Adding a New Feature

```bash
# 1. Create migration file
echo "-- Add new feature" > database/migrations/007_new_feature.sql

# 2. Write SQL
vim database/migrations/007_new_feature.sql

# 3. Test
npm run migrate

# 4. Verify
npm run migrate:status
```

### Production Deployment

```bash
# Migrations run automatically via docker-compose
docker compose pull
docker compose up -d

# Or run migrations manually first
docker compose run --rm db-migrate
docker compose up -d backend
```

### Troubleshooting Failed Migration

```bash
# Check what went wrong
docker compose logs db-migrate

# Fix the migration file
vim database/migrations/007_problematic.sql

# Remove the failed migration record (if it was partially applied)
psql -U $SQL_USER -d $SQL_DB
DELETE FROM schema_migrations WHERE version = '007';

# Try again
docker compose run --rm db-migrate
```

### Rolling Back (Manual Process)

Since we don't have automated rollbacks, you need to manually create a "down" migration:

```sql
-- database/migrations/008_rollback_wishlist.sql
DROP TABLE IF EXISTS wishlists;
```

## Environment Variables

Required environment variables (in `.env`):

```bash
SQL_SERVER_IP=localhost    # or 'db' in Docker
SQL_SERVER_PORT=5432
SQL_USER=your_user
SQL_DB=your_database
SQL_PASS=your_password
```

## Migration File Naming Convention

**Format:** `NNN_descriptive_name.sql`

- `NNN` - Three-digit sequential number (001, 002, 003...)
- `descriptive_name` - Lowercase with underscores
- `.sql` - SQL file extension

**Examples:**
- ✅ `001_initial_tables.sql`
- ✅ `007_add_user_preferences.sql`
- ✅ `042_optimize_search_indexes.sql`
- ❌ `7_update.sql` (not zero-padded, not descriptive)
- ❌ `add-feature.sql` (no number)

## Current Schema

After running all migrations (001-006), you'll have:

### Tables
- `schema_migrations` - Migration tracking
- `users` - User accounts with auth and roles
- `invites` - User invitation system
- `coins` - Coin inventory
- `cointypes` - Coin type reference data
- `mintlocations` - Mint location reference data
- `relics` - Relic inventory
- `relictypes` - Relic type reference data
- `stamps` - Stamp inventory
- `bunnykins` - Bunnykin inventory
- `comics` - Comic inventory
- `comicpublishers` - Comic publisher reference data

### Key Features
- User authentication (email verification, password reset, refresh tokens)
- Role-based access control (admin/user)
- User invitation system
- Quantity tracking for all inventory items
- Active/inactive user status

## Additional Resources

- PostgreSQL Documentation: https://www.postgresql.org/docs/
- Migration best practices: https://www.brunton.io/blog/database-migrations-best-practices/
- Docker Compose docs: https://docs.docker.com/compose/
