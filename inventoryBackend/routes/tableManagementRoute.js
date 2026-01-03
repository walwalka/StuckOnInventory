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
    WHERE ct.created_by = $1 OR ct.is_shared = TRUE OR tp.user_id = $1
    ORDER BY ct.created_at DESC
  `, [userId]);

  res.json({ tables: rows });
}));

/**
 * List ALL tables (admin only)
 */
router.get('/admin/all', asyncHandler(async (req, res) => {
  const isAdmin = req.user.role === 'admin';

  if (!isAdmin) {
    throw new ForbiddenError('Admin access required');
  }

  const { rows } = await pool.query(`
    SELECT
      ct.*,
      u.email as creator_email,
      (SELECT COUNT(*) FROM custom_fields WHERE table_id = ct.id) as field_count,
      (SELECT COUNT(*) FROM table_permissions WHERE table_id = ct.id) as permission_count
    FROM custom_tables ct
    INNER JOIN users u ON ct.created_by = u.id
    ORDER BY ct.created_at DESC
  `);

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
 * List all lookup tables accessible to user
 * Admin sees all, users see only shared or owned
 */
router.get('/lookups', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const isAdmin = req.user.role === 'admin';

  let query, params;

  if (isAdmin) {
    query = `
      SELECT clt.*,
             u.email as creator_email,
             COUNT(clv.id) as value_count
      FROM custom_lookup_tables clt
      INNER JOIN users u ON clt.created_by = u.id
      LEFT JOIN custom_lookup_values clv ON clt.id = clv.lookup_table_id
      GROUP BY clt.id, u.email
      ORDER BY clt.display_name
    `;
    params = [];
  } else {
    query = `
      SELECT clt.*,
             u.email as creator_email,
             COUNT(clv.id) as value_count
      FROM custom_lookup_tables clt
      INNER JOIN users u ON clt.created_by = u.id
      LEFT JOIN custom_lookup_values clv ON clt.id = clv.lookup_table_id
      WHERE clt.is_shared = TRUE OR clt.created_by = $1
      GROUP BY clt.id, u.email
      ORDER BY clt.display_name
    `;
    params = [userId];
  }

  const { rows } = await pool.query(query, params);
  res.json({ lookups: rows });
}));

/**
 * Get a specific lookup table with all its values
 * Handles both numeric IDs and table names
 */
router.get('/lookups/:lookupIdentifier', asyncHandler(async (req, res) => {
  const { lookupIdentifier } = req.params;
  const userId = req.user.id;

  let lookupRows;

  // Check if identifier is numeric (ID) or string (table name)
  if (/^\d+$/.test(lookupIdentifier)) {
    // Numeric ID
    const result = await pool.query(`
      SELECT clt.*, u.email as creator_email
      FROM custom_lookup_tables clt
      INNER JOIN users u ON clt.created_by = u.id
      WHERE clt.id = $1
    `, [parseInt(lookupIdentifier)]);
    lookupRows = result.rows;
  } else {
    // Table name
    const sanitizedName = sanitizeIdentifier(lookupIdentifier);
    const result = await pool.query(`
      SELECT clt.*, u.email as creator_email
      FROM custom_lookup_tables clt
      INNER JOIN users u ON clt.created_by = u.id
      WHERE clt.table_name = $1
    `, [sanitizedName]);
    lookupRows = result.rows;
  }

  if (lookupRows.length === 0) {
    throw new NotFoundError('Lookup table not found');
  }

  const lookup = lookupRows[0];

  // Check access (shared or owned)
  if (!lookup.is_shared && lookup.created_by !== userId && req.user.role !== 'admin') {
    throw new ForbiddenError('Access denied to this lookup table');
  }

  // Get values
  const { rows: values } = await pool.query(
    'SELECT * FROM custom_lookup_values WHERE lookup_table_id = $1 ORDER BY display_order',
    [lookup.id]
  );

  res.json({ ...lookup, values });
}));

/**
 * Create a new lookup table
 * Admin only
 */
router.post('/lookups', asyncHandler(async (req, res) => {
  const { table_name, display_name, is_shared } = req.body;
  const userId = req.user.id;
  const isAdmin = req.user.role === 'admin';

  if (!isAdmin) {
    throw new ForbiddenError('Only admins can create lookup tables');
  }

  if (!table_name || !display_name) {
    throw new BadRequestError('table_name and display_name are required');
  }

  // Enforce lookup_ prefix
  const lookupTableName = table_name.startsWith('lookup_')
    ? sanitizeIdentifier(table_name)
    : sanitizeIdentifier(`lookup_${table_name}`);

  const { rows } = await pool.query(`
    INSERT INTO custom_lookup_tables (table_name, display_name, created_by, is_shared)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `, [lookupTableName, display_name, userId, is_shared || false]);

  res.status(201).json({ lookup: rows[0] });
}));

/**
 * Update lookup table metadata
 * Admin or owner only
 */
router.put('/lookups/:lookupId', asyncHandler(async (req, res) => {
  const { lookupId } = req.params;
  const { display_name, is_shared } = req.body;
  const userId = req.user.id;
  const isAdmin = req.user.role === 'admin';

  // Check ownership
  const { rows: lookupRows } = await pool.query(
    'SELECT created_by FROM custom_lookup_tables WHERE id = $1',
    [lookupId]
  );

  if (lookupRows.length === 0) {
    throw new NotFoundError('Lookup table not found');
  }

  if (!isAdmin && lookupRows[0].created_by !== userId) {
    throw new ForbiddenError('Only admins or table owner can update lookup tables');
  }

  const updates = [];
  const values = [];
  let paramCount = 1;

  if (display_name !== undefined) {
    updates.push(`display_name = $${paramCount}`);
    values.push(display_name);
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

  values.push(lookupId);

  const { rows } = await pool.query(`
    UPDATE custom_lookup_tables
    SET ${updates.join(', ')}
    WHERE id = $${paramCount}
    RETURNING *
  `, values);

  res.json({ lookup: rows[0] });
}));

/**
 * Delete a lookup table
 * Admin or owner only
 */
router.delete('/lookups/:lookupId', asyncHandler(async (req, res) => {
  const { lookupId } = req.params;
  const userId = req.user.id;
  const isAdmin = req.user.role === 'admin';

  // Check ownership
  const { rows: lookupRows } = await pool.query(
    'SELECT created_by, table_name FROM custom_lookup_tables WHERE id = $1',
    [lookupId]
  );

  if (lookupRows.length === 0) {
    throw new NotFoundError('Lookup table not found');
  }

  if (!isAdmin && lookupRows[0].created_by !== userId) {
    throw new ForbiddenError('Only admins or table owner can delete lookup tables');
  }

  // Check if lookup table is referenced by any fields
  const { rows: fieldRefs } = await pool.query(
    'SELECT COUNT(*) as count FROM custom_fields WHERE lookup_table_id = $1',
    [lookupId]
  );

  if (parseInt(fieldRefs[0].count) > 0) {
    throw new BadRequestError('Cannot delete lookup table that is referenced by table fields');
  }

  await pool.query('DELETE FROM custom_lookup_tables WHERE id = $1', [lookupId]);

  res.json({ message: 'Lookup table deleted successfully' });
}));

/**
 * Add a value to a lookup table
 * Admin or owner only
 */
router.post('/lookups/:lookupId/values', asyncHandler(async (req, res) => {
  const { lookupId } = req.params;
  const { value_data, display_order } = req.body;
  const userId = req.user.id;
  const isAdmin = req.user.role === 'admin';

  if (!value_data) {
    throw new BadRequestError('value_data is required');
  }

  // Check ownership
  const { rows: lookupRows } = await pool.query(
    'SELECT created_by FROM custom_lookup_tables WHERE id = $1',
    [lookupId]
  );

  if (lookupRows.length === 0) {
    throw new NotFoundError('Lookup table not found');
  }

  if (!isAdmin && lookupRows[0].created_by !== userId) {
    throw new ForbiddenError('Only admins or table owner can add values');
  }

  // Get max display_order if not provided
  let order = display_order;
  if (order === undefined) {
    const { rows: maxRows } = await pool.query(
      'SELECT COALESCE(MAX(display_order), 0) + 1 as next_order FROM custom_lookup_values WHERE lookup_table_id = $1',
      [lookupId]
    );
    order = maxRows[0].next_order;
  }

  const { rows } = await pool.query(`
    INSERT INTO custom_lookup_values (lookup_table_id, value_data, display_order)
    VALUES ($1, $2, $3)
    RETURNING *
  `, [lookupId, JSON.stringify(value_data), order]);

  res.status(201).json({ value: rows[0] });
}));

/**
 * Update a lookup value
 * Admin or owner only
 */
router.put('/lookups/:lookupId/values/:valueId', asyncHandler(async (req, res) => {
  const { lookupId, valueId } = req.params;
  const { value_data, display_order } = req.body;
  const userId = req.user.id;
  const isAdmin = req.user.role === 'admin';

  // Check ownership
  const { rows: lookupRows } = await pool.query(
    'SELECT created_by FROM custom_lookup_tables WHERE id = $1',
    [lookupId]
  );

  if (lookupRows.length === 0) {
    throw new NotFoundError('Lookup table not found');
  }

  if (!isAdmin && lookupRows[0].created_by !== userId) {
    throw new ForbiddenError('Only admins or table owner can update values');
  }

  const updates = [];
  const values = [];
  let paramCount = 1;

  if (value_data !== undefined) {
    updates.push(`value_data = $${paramCount}`);
    values.push(JSON.stringify(value_data));
    paramCount++;
  }

  if (display_order !== undefined) {
    updates.push(`display_order = $${paramCount}`);
    values.push(display_order);
    paramCount++;
  }

  if (updates.length === 0) {
    throw new BadRequestError('No fields to update');
  }

  values.push(valueId);
  values.push(lookupId);

  const { rows } = await pool.query(`
    UPDATE custom_lookup_values
    SET ${updates.join(', ')}
    WHERE id = $${paramCount} AND lookup_table_id = $${paramCount + 1}
    RETURNING *
  `, values);

  if (rows.length === 0) {
    throw new NotFoundError('Lookup value not found');
  }

  res.json({ value: rows[0] });
}));

/**
 * Delete a lookup value
 * Admin or owner only
 */
router.delete('/lookups/:lookupId/values/:valueId', asyncHandler(async (req, res) => {
  const { lookupId, valueId } = req.params;
  const userId = req.user.id;
  const isAdmin = req.user.role === 'admin';

  // Check ownership
  const { rows: lookupRows } = await pool.query(
    'SELECT created_by FROM custom_lookup_tables WHERE id = $1',
    [lookupId]
  );

  if (lookupRows.length === 0) {
    throw new NotFoundError('Lookup table not found');
  }

  if (!isAdmin && lookupRows[0].created_by !== userId) {
    throw new ForbiddenError('Only admins or table owner can delete values');
  }

  await pool.query(
    'DELETE FROM custom_lookup_values WHERE id = $1 AND lookup_table_id = $2',
    [valueId, lookupId]
  );

  res.json({ message: 'Lookup value deleted successfully' });
}));

/**
 * Import lookup values from CSV
 * Admin or owner only
 */
router.post('/lookups/:lookupId/import', asyncHandler(async (req, res) => {
  const { lookupId } = req.params;
  const { csv_data } = req.body; // Array of objects
  const userId = req.user.id;
  const isAdmin = req.user.role === 'admin';

  if (!csv_data || !Array.isArray(csv_data)) {
    throw new BadRequestError('csv_data must be an array of objects');
  }

  // Check ownership
  const { rows: lookupRows } = await pool.query(
    'SELECT created_by FROM custom_lookup_tables WHERE id = $1',
    [lookupId]
  );

  if (lookupRows.length === 0) {
    throw new NotFoundError('Lookup table not found');
  }

  if (!isAdmin && lookupRows[0].created_by !== userId) {
    throw new ForbiddenError('Only admins or table owner can import values');
  }

  // Insert all values in a transaction
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Get starting display order
    const { rows: maxRows } = await client.query(
      'SELECT COALESCE(MAX(display_order), 0) as max_order FROM custom_lookup_values WHERE lookup_table_id = $1',
      [lookupId]
    );
    let displayOrder = maxRows[0].max_order + 1;

    for (const row of csv_data) {
      await client.query(
        'INSERT INTO custom_lookup_values (lookup_table_id, value_data, display_order) VALUES ($1, $2, $3)',
        [lookupId, JSON.stringify(row), displayOrder++]
      );
    }

    await client.query('COMMIT');
    res.json({ message: `Imported ${csv_data.length} values successfully` });

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}));

/**
 * Export lookup values to CSV
 */
router.get('/lookups/:lookupId/export', asyncHandler(async (req, res) => {
  const { lookupId } = req.params;
  const userId = req.user.id;

  // Check access
  const { rows: lookupRows } = await pool.query(
    'SELECT is_shared, created_by FROM custom_lookup_tables WHERE id = $1',
    [lookupId]
  );

  if (lookupRows.length === 0) {
    throw new NotFoundError('Lookup table not found');
  }

  const lookup = lookupRows[0];
  if (!lookup.is_shared && lookup.created_by !== userId && req.user.role !== 'admin') {
    throw new ForbiddenError('Access denied to this lookup table');
  }

  const { rows } = await pool.query(
    'SELECT value_data FROM custom_lookup_values WHERE lookup_table_id = $1 ORDER BY display_order',
    [lookupId]
  );

  const csvData = rows.map(row => row.value_data);

  res.json({ data: csvData });
}));

export default router;
