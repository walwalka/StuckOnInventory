# Migration Guide

Complete guide for creating, applying, and rolling back database migrations.

## Quick Reference

```bash
# Create a new migration
npm run migrate:create add_wishlist_table

# Apply pending migrations
npm run migrate

# Check migration status
npm run migrate:status

# Rollback last migration
npm run migrate:rollback

# Rollback last 3 migrations
npm run migrate:rollback 3
```

## Migration Formats

This system supports two migration formats:

### Legacy Format (Single File)

Used by existing migrations (001-006). These are simple SQL files:

```
migrations/
  001_initial_tables.sql
  002_seed_reference_data.sql
```

**Limitations:** No automatic rollback support.

### New Format (Directory with Up/Down)

Recommended for all new migrations. Each migration is a directory with separate up and down files:

```
migrations/
  007_add_wishlist_table/
    up.sql    # Forward migration
    down.sql  # Rollback migration
```

**Benefits:**
- Full rollback support
- Clear separation of forward/backward logic
- Better organization

## Creating New Migrations

### Using the Migration Generator (Recommended)

```bash
cd inventoryBackend
npm run migrate:create add_wishlist_table
```

This creates:
```
database/migrations/007_add_wishlist_table/
  ├── up.sql
  └── down.sql
```

### Manual Creation

1. Find the next version number (check existing migrations)
2. Create a directory: `database/migrations/007_feature_name/`
3. Create `up.sql` with forward migration
4. Create `down.sql` with rollback migration

## Writing Migration SQL

### Up Migration (up.sql)

This should contain SQL to apply the change:

```sql
-- Migration: Add wishlist table
-- Description: Allows users to save items to their wishlist
-- Created: 2024-12-28

CREATE TABLE wishlists (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_type VARCHAR(50) NOT NULL,
  item_id INTEGER NOT NULL,
  added_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  notes TEXT
);

CREATE INDEX idx_wishlists_user_id ON wishlists(user_id);
CREATE INDEX idx_wishlists_item ON wishlists(item_type, item_id);
CREATE UNIQUE INDEX idx_wishlists_unique ON wishlists(user_id, item_type, item_id);
```

### Down Migration (down.sql)

This should **reverse** everything in up.sql:

```sql
-- Rollback: Add wishlist table
-- Description: Removes wishlist table and related objects
-- Created: 2024-12-28

DROP INDEX IF EXISTS idx_wishlists_unique;
DROP INDEX IF EXISTS idx_wishlists_item;
DROP INDEX IF EXISTS idx_wishlists_user_id;
DROP TABLE IF EXISTS wishlists;
```

**Important:** Down migrations should be written in **reverse order** of the up migration.

## Migration Workflow

### 1. Create Migration

```bash
npm run migrate:create add_new_feature
```

### 2. Edit SQL Files

Edit the generated `up.sql` and `down.sql` files.

### 3. Test Locally

```bash
# Apply the migration
npm run migrate

# Verify it worked
npm run migrate:status

# Test the rollback
npm run migrate:rollback

# Verify rollback worked
npm run migrate:status

# Re-apply for development
npm run migrate
```

### 4. Commit and Deploy

```bash
git add database/migrations/007_add_new_feature/
git commit -m "Add new feature migration"
git push
```

## Rollback System

### Rolling Back Migrations

Rollback the last migration:
```bash
npm run migrate:rollback
```

Rollback multiple migrations:
```bash
npm run migrate:rollback 3  # Rollback last 3
```

### How Rollback Works

1. Queries `schema_migrations` for applied migrations (newest first)
2. Checks if rollback file (`down.sql`) exists
3. Runs the down SQL in a transaction
4. Removes the migration record from `schema_migrations`
5. Commits or rolls back on error

### Rollback Safety

- **Transactions**: Each rollback runs in a transaction
- **Atomicity**: Either fully succeeds or fully rolls back
- **Validation**: Checks for down.sql before attempting rollback
- **Legacy Support**: Warns if migration has no rollback

## Best Practices

### Writing Migrations

**DO:**
- Keep migrations small and focused
- Write idempotent SQL when possible (`IF NOT EXISTS`)
- Include descriptive comments
- Test both up and down migrations
- Consider data migration separately from schema changes

**DON'T:**
- Mix multiple features in one migration
- Delete data without backups
- Use `DROP TABLE` without `IF EXISTS`
- Forget to write the down migration
- Modify applied migrations

### Writing Rollbacks

**DO:**
- Reverse every change in up.sql
- Use `IF EXISTS` for DROP statements
- Drop objects in reverse order (indexes before tables)
- Test rollback on a copy of production data
- Document any data loss in comments

**DON'T:**
- Assume rollback will never be needed
- Leave down.sql empty
- Delete data without warning users
- Create partial rollbacks

### Migration Naming

**Good names:**
- `add_wishlist_table`
- `add_user_preferences_column`
- `create_search_indexes`
- `seed_initial_categories`

**Bad names:**
- `migration_1`
- `update`
- `fix_stuff`
- `temp`

## Complex Migration Scenarios

### Adding a Column with Default Value

**up.sql:**
```sql
ALTER TABLE users
  ADD COLUMN last_login TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;

-- Backfill existing records
UPDATE users SET last_login = created_at WHERE last_login IS NULL;
```

**down.sql:**
```sql
ALTER TABLE users DROP COLUMN IF EXISTS last_login;
```

### Renaming a Column

**up.sql:**
```sql
-- Rename preserves data
ALTER TABLE products RENAME COLUMN price TO unit_price;
```

**down.sql:**
```sql
ALTER TABLE products RENAME COLUMN unit_price TO price;
```

### Data Migration

**up.sql:**
```sql
-- Add new normalized table
CREATE TABLE product_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE
);

-- Migrate existing data
INSERT INTO product_categories (name)
SELECT DISTINCT category FROM products
WHERE category IS NOT NULL;

-- Add foreign key
ALTER TABLE products ADD COLUMN category_id INTEGER REFERENCES product_categories(id);

-- Populate foreign key
UPDATE products p
SET category_id = pc.id
FROM product_categories pc
WHERE p.category = pc.name;
```

**down.sql:**
```sql
-- Remove foreign key
ALTER TABLE products DROP COLUMN IF EXISTS category_id;

-- Drop new table
DROP TABLE IF EXISTS product_categories;
```

### Adding an Index

**up.sql:**
```sql
-- Use CONCURRENTLY to avoid locking (Postgres)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_user_created
ON orders(user_id, created_at DESC);
```

**down.sql:**
```sql
DROP INDEX CONCURRENTLY IF EXISTS idx_orders_user_created;
```

## Troubleshooting

### Migration Failed

```bash
# Check the error
npm run migrate

# Fix the SQL in up.sql
vim database/migrations/007_feature/up.sql

# Remove failed migration record (if it was partially applied)
psql -d $SQL_DB -c "DELETE FROM schema_migrations WHERE version = '007';"

# Try again
npm run migrate
```

### Rollback Failed

```bash
# Check the error
npm run migrate:rollback

# Fix the SQL in down.sql
vim database/migrations/007_feature/down.sql

# Manually fix database if needed
psql -d $SQL_DB

# Try rollback again
npm run migrate:rollback
```

### Migration Conflict (Multiple Developers)

```bash
# Developer A created: 007_add_feature_a.sql
# Developer B created: 007_add_feature_b.sql (conflict!)

# Solution: Renumber one of them
mv database/migrations/007_add_feature_b database/migrations/008_add_feature_b

# Update version in migration file if needed
# Commit with new number
```

### Can't Rollback Legacy Migration

Legacy migrations (001-006) don't have rollback files. To rollback:

1. Create a new forward migration that reverses the change
2. Or manually create a down.sql file for the legacy migration

## Production Considerations

### Before Rolling Out Migrations

- [ ] Test on a copy of production data
- [ ] Test the rollback
- [ ] Ensure migrations are backwards compatible with running code
- [ ] Consider impact on running transactions
- [ ] Check for long-running operations (adding indexes, etc.)
- [ ] Plan a rollback window

### Zero-Downtime Migrations

For large tables, consider a multi-step approach:

**Step 1: Add column (nullable)**
```sql
ALTER TABLE large_table ADD COLUMN new_column VARCHAR(255);
```

**Step 2: Backfill in batches (separate script)**
```sql
UPDATE large_table SET new_column = old_column WHERE id BETWEEN 1 AND 10000;
-- Repeat in batches
```

**Step 3: Make NOT NULL (after backfill)**
```sql
ALTER TABLE large_table ALTER COLUMN new_column SET NOT NULL;
```

### Rollback in Production

**When to rollback:**
- Migration caused immediate errors
- Data corruption detected quickly
- Application code is incompatible

**When NOT to rollback:**
- Migration succeeded but app has bugs (fix app instead)
- Data has been modified since migration
- Rollback would lose data

## Migration Checklist

Before committing a migration:

- [ ] Up migration tested locally
- [ ] Down migration tested locally
- [ ] Migration is idempotent where possible
- [ ] Both files have descriptive comments
- [ ] Migration naming follows convention
- [ ] Foreign keys and indexes included
- [ ] No hardcoded values (use data migrations)
- [ ] Code is compatible with both old and new schema
- [ ] Reviewed for security issues
- [ ] Considered performance impact

## Examples

See `database/migrations/` for examples of both legacy and new format migrations.
