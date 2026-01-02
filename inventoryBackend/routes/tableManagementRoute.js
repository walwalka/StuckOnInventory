import express from 'express';
import { pool } from '../database/database.js';
import { requireAuth } from '../middleware/auth.js';
import {
  asyncHandler,
  BadRequestError,
  NotFoundError,
  ForbiddenError
} from '../middleware/errorHandler.js';
import { createCustomTable, deleteCustomTable, addFieldToTable, sanitizeIdentifier } from '../utils/ddlManager.js';

const router = express.Router();

// Protect all routes with authentication
router.use(requireAuth);

/**
 * List all tables accessible to the current user
 */
router.get('/', asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const { rows } = await pool.query(`
    SELECT
      ct.*,
      u.email as creator_email,
      COALESCE(item_counts.item_count, 0) as item_count,
      CASE
        WHEN ct.created_by = $1 THEN 'owner'
        WHEN ct.is_shared THEN 'view'
        WHEN tp.permission_level IS NOT NULL THEN tp.permission_level
        ELSE NULL
      END as user_permission
    FROM custom_tables ct
    INNER JOIN users u ON ct.created_by = u.id
    LEFT JOIN table_permissions tp ON ct.id = tp.table_id AND tp.user_id = $1
    LEFT JOIN LATERAL (
      SELECT COUNT(*) as item_count
      FROM information_schema.tables ist
      WHERE ist.table_name = LOWER(REGEXP_REPLACE(SPLIT_PART(u.email, '@', 1), '[^a-z0-9]', '_', 'g')) || '_data_' || ct.table_name
    ) item_counts ON true
    WHERE ct.created_by = $1 OR tp.user_id = $1
    ORDER BY ct.created_at DESC
  `, [userId]);

  res.json({ tables: rows });
}));

/**
 * Get table definition (metadata + fields)
 */
router.get('/:tableName/definition', asyncHandler(async (req, res) => {
  const { tableName } = req.params;
  const userId = req.user.id;

  const sanitizedTableName = sanitizeIdentifier(tableName);

  // Get table metadata with permission check
  const { rows: tableRows } = await pool.query(`
    SELECT ct.*,
           CASE
             WHEN ct.created_by = $2 THEN 'owner'
             WHEN ct.is_shared THEN 'view'
             WHEN tp.permission_level IS NOT NULL THEN tp.permission_level
             ELSE NULL
           END as user_permission
    FROM custom_tables ct
    LEFT JOIN table_permissions tp ON ct.id = tp.table_id AND tp.user_id = $2
    WHERE ct.table_name = $1
  `, [sanitizedTableName, userId]);

  if (tableRows.length === 0) {
    throw new NotFoundError('Table not found');
  }

  const table = tableRows[0];

  // Check if user has access
  if (!table.user_permission) {
    throw new ForbiddenError('Access denied to this table');
  }

  // Get fields
  const { rows: fields } = await pool.query(`
    SELECT cf.*, clt.table_name as lookup_table_name
    FROM custom_fields cf
    LEFT JOIN custom_lookup_tables clt ON cf.lookup_table_id = clt.id
    WHERE cf.table_id = $1
    ORDER BY cf.display_order
  `, [table.id]);

  res.json({ table, fields });
}));

/**
 * Create a new custom table
 */
router.post('/', asyncHandler(async (req, res) => {
  const { table, fields } = req.body;
  const userId = req.user.id;
  const userEmail = req.user.email;

  if (!table || !fields) {
    throw new BadRequestError('Missing required fields: table and fields');
  }

  if (!table.table_name || !table.display_name) {
    throw new BadRequestError('Table must have table_name and display_name');
  }

  const result = await createCustomTable(table, fields, userId, userEmail);

  res.status(201).json({
    message: 'Table created successfully',
    tableId: result.tableId,
    tableName: result.tableName
  });
}));

/**
 * Update table settings (name, description, icon, sharing)
 */
router.put('/:tableName', asyncHandler(async (req, res) => {
  const { tableName } = req.params;
  const userId = req.user.id;
  const { display_name, description, icon, is_shared } = req.body;

  const sanitizedTableName = sanitizeIdentifier(tableName);

  // Get table and check ownership
  const { rows } = await pool.query(
    'SELECT id, created_by, is_system FROM custom_tables WHERE table_name = $1',
    [sanitizedTableName]
  );

  if (rows.length === 0) {
    throw new NotFoundError('Table not found');
  }

  const table = rows[0];

  // Only owner can update table settings
  if (table.created_by !== userId) {
    throw new ForbiddenError('Only the table creator can update settings');
  }

  // Prevent modification of system tables
  if (table.is_system) {
    throw new BadRequestError('Cannot modify system tables');
  }

  // Build update query
  const updates = [];
  const values = [];
  let paramCount = 1;

  if (display_name !== undefined) {
    updates.push(`display_name = $${paramCount}`);
    values.push(display_name);
    paramCount++;
  }

  if (description !== undefined) {
    updates.push(`description = $${paramCount}`);
    values.push(description);
    paramCount++;
  }

  if (icon !== undefined) {
    updates.push(`icon = $${paramCount}`);
    values.push(icon);
    paramCount++;
  }

  if (is_shared !== undefined) {
    updates.push(`is_shared = $${paramCount}`);
    values.push(is_shared);
    paramCount++;
  }

  if (updates.length === 0) {
    throw new BadRequestError('No fields to update');
  }

  updates.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(table.id);

  const query = `
    UPDATE custom_tables
    SET ${updates.join(', ')}
    WHERE id = $${paramCount}
    RETURNING *
  `;

  const result = await pool.query(query, values);

  res.json({ table: result.rows[0] });
}));

/**
 * Delete a custom table
 */
router.delete('/:tableName', asyncHandler(async (req, res) => {
  const { tableName } = req.params;
  const userId = req.user.id;
  const userEmail = req.user.email;

  const sanitizedTableName = sanitizeIdentifier(tableName);

  await deleteCustomTable(sanitizedTableName, userId, userEmail);

  res.json({ message: 'Table deleted successfully' });
}));

/**
 * List permissions for a table
 */
router.get('/:tableName/permissions', asyncHandler(async (req, res) => {
  const { tableName } = req.params;
  const userId = req.user.id;

  const sanitizedTableName = sanitizeIdentifier(tableName);

  // Get table and check ownership
  const { rows: tableRows } = await pool.query(
    'SELECT id, created_by FROM custom_tables WHERE table_name = $1',
    [sanitizedTableName]
  );

  if (tableRows.length === 0) {
    throw new NotFoundError('Table not found');
  }

  const table = tableRows[0];

  // Only owner can view permissions
  if (table.created_by !== userId) {
    throw new ForbiddenError('Only the table creator can view permissions');
  }

  // Get permissions with user email
  const { rows: permissions } = await pool.query(`
    SELECT tp.*, u.email
    FROM table_permissions tp
    JOIN users u ON tp.user_id = u.id
    WHERE tp.table_id = $1
    ORDER BY tp.granted_at DESC
  `, [table.id]);

  res.json({ permissions });
}));

/**
 * Grant or update user permissions for a table
 */
router.post('/:tableName/permissions', asyncHandler(async (req, res) => {
  const { tableName } = req.params;
  const { user_id, permission_level } = req.body;
  const userId = req.user.id;

  if (!user_id || !permission_level) {
    throw new BadRequestError('Missing required fields: user_id and permission_level');
  }

  const validPermissions = ['view', 'edit', 'admin'];
  if (!validPermissions.includes(permission_level)) {
    throw new BadRequestError(`Invalid permission level. Must be one of: ${validPermissions.join(', ')}`);
  }

  const sanitizedTableName = sanitizeIdentifier(tableName);

  // Get table and check ownership
  const { rows } = await pool.query(
    'SELECT id, created_by FROM custom_tables WHERE table_name = $1',
    [sanitizedTableName]
  );

  if (rows.length === 0) {
    throw new NotFoundError('Table not found');
  }

  const table = rows[0];

  // Only owner can grant permissions
  if (table.created_by !== userId) {
    throw new ForbiddenError('Only the table creator can grant permissions');
  }

  // Insert or update permission
  await pool.query(`
    INSERT INTO table_permissions (table_id, user_id, permission_level, granted_by)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (table_id, user_id)
    DO UPDATE SET permission_level = $3, granted_by = $4, granted_at = CURRENT_TIMESTAMP
  `, [table.id, user_id, permission_level, userId]);

  res.json({ message: 'Permission granted successfully' });
}));

/**
 * Revoke user permissions for a table
 */
router.delete('/:tableName/permissions/:userId', asyncHandler(async (req, res) => {
  const { tableName, userId: targetUserId } = req.params;
  const userId = req.user.id;

  const sanitizedTableName = sanitizeIdentifier(tableName);

  // Get table and check ownership
  const { rows } = await pool.query(
    'SELECT id, created_by FROM custom_tables WHERE table_name = $1',
    [sanitizedTableName]
  );

  if (rows.length === 0) {
    throw new NotFoundError('Table not found');
  }

  const table = rows[0];

  // Only owner can revoke permissions
  if (table.created_by !== userId) {
    throw new ForbiddenError('Only the table creator can revoke permissions');
  }

  // Delete permission
  await pool.query(
    'DELETE FROM table_permissions WHERE table_id = $1 AND user_id = $2',
    [table.id, targetUserId]
  );

  res.json({ message: 'Permission revoked successfully' });
}));

/**
 * Add a field to an existing table
 */
router.post('/:tableName/fields', asyncHandler(async (req, res) => {
  const { tableName } = req.params;
  const field = req.body;
  const userId = req.user.id;
  const userEmail = req.user.email;

  if (!field || !field.field_name || !field.field_label || !field.field_type) {
    throw new BadRequestError('Missing required field properties');
  }

  const sanitizedTableName = sanitizeIdentifier(tableName);

  await addFieldToTable(sanitizedTableName, field, userId, userEmail);

  res.json({ message: 'Field added successfully' });
}));

/**
 * Get lookup table values
 */
router.get('/lookups/:lookupTableName', asyncHandler(async (req, res) => {
  const { lookupTableName } = req.params;

  const sanitizedName = sanitizeIdentifier(lookupTableName);

  // Get lookup table
  const { rows: lookupRows } = await pool.query(
    'SELECT id FROM custom_lookup_tables WHERE table_name = $1',
    [sanitizedName]
  );

  if (lookupRows.length === 0) {
    throw new NotFoundError('Lookup table not found');
  }

  // Get values
  const { rows: values } = await pool.query(
    'SELECT * FROM custom_lookup_values WHERE lookup_table_id = $1 ORDER BY display_order',
    [lookupRows[0].id]
  );

  res.json({ values });
}));

export default router;
