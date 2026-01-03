import { pool } from '../database/database.js';
import { BadRequestError } from '../middleware/errorHandler.js';

// Whitelist of allowed data types
const ALLOWED_DATA_TYPES = {
  text: 'TEXT',
  number: 'DECIMAL(10,2)',
  integer: 'INTEGER',
  select: 'TEXT',
  textarea: 'TEXT',
  date: 'DATE',
  'month-year': 'DATE',
  currency: 'DECIMAL(10,2)'
};

/**
 * Extract and sanitize username from email address
 * @param {string} email - Email address
 * @returns {string} - Sanitized username
 * @throws {BadRequestError} - If email is invalid
 */
export function extractUsername(email) {
  if (!email || typeof email !== 'string') {
    throw new BadRequestError('Email must be a non-empty string');
  }

  // Extract the part before @
  const parts = email.split('@');
  if (parts.length !== 2 || !parts[0]) {
    throw new BadRequestError('Invalid email format');
  }

  let username = parts[0].toLowerCase();

  // Replace any non-alphanumeric characters with underscores
  username = username.replace(/[^a-z0-9]/g, '_');

  // Ensure it starts with a letter (prepend 'u_' if it doesn't)
  if (!/^[a-z]/.test(username)) {
    username = 'u_' + username;
  }

  // Truncate to 20 chars to leave room for _data_tablename
  if (username.length > 20) {
    username = username.substring(0, 20);
  }

  return username;
}

/**
 * Sanitize identifier to prevent SQL injection
 * @param {string} name - The identifier to sanitize
 * @returns {string} - Sanitized identifier
 * @throws {BadRequestError} - If identifier is invalid
 */
export function sanitizeIdentifier(name) {
  if (!name || typeof name !== 'string') {
    throw new BadRequestError('Identifier must be a non-empty string');
  }

  // Check format: must start with lowercase letter, contain only lowercase letters, numbers, underscores
  if (!/^[a-z][a-z0-9_]*$/.test(name)) {
    throw new BadRequestError(
      `Invalid identifier: ${name}. Must start with a lowercase letter and contain only lowercase letters, numbers, and underscores.`
    );
  }

  // Check length (PostgreSQL limit is 63 characters)
  if (name.length > 63) {
    throw new BadRequestError(`Identifier too long (max 63 chars): ${name}`);
  }

  // Reserved keywords to avoid
  const reservedKeywords = [
    'select', 'insert', 'update', 'delete', 'drop', 'table', 'database',
    'user', 'password', 'admin', 'root', 'system', 'schema', 'index'
  ];

  if (reservedKeywords.includes(name.toLowerCase())) {
    throw new BadRequestError(`Identifier cannot be a reserved keyword: ${name}`);
  }

  return name;
}

/**
 * Create a new custom table
 * @param {Object} tableDef - Table definition
 * @param {string} tableDef.table_name - Table name (will be prefixed with username_data_)
 * @param {string} tableDef.display_name - Display name for UI
 * @param {string} tableDef.description - Table description
 * @param {string} tableDef.icon - Icon identifier
 * @param {boolean} tableDef.is_shared - Whether table is shared (default: false)
 * @param {Array} fields - Array of field definitions
 * @param {number} userId - ID of user creating the table
 * @param {string} userEmail - Email of user creating the table
 * @returns {Promise<{tableId: number, tableName: string}>}
 */
export async function createCustomTable(tableDef, fields, userId, userEmail) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Extract username from email and validate
    const username = extractUsername(userEmail);

    // Validate and sanitize table name
    const tableName = sanitizeIdentifier(tableDef.table_name);
    const physicalTableName = `${username}_data_${tableName}`;

    // Check if table already exists for this user
    const existingTable = await client.query(
      'SELECT id FROM custom_tables WHERE table_name = $1 AND created_by = $2',
      [tableName, userId]
    );

    if (existingTable.rows.length > 0) {
      throw new BadRequestError(`Table '${tableName}' already exists in your account`);
    }

    // Insert metadata into custom_tables
    const tableResult = await client.query(`
      INSERT INTO custom_tables (table_name, display_name, description, icon, created_by, is_shared)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `, [
      tableName,
      tableDef.display_name,
      tableDef.description || null,
      tableDef.icon || 'MdFolder',
      userId,
      tableDef.is_shared || false
    ]);

    const tableId = tableResult.rows[0].id;

    // Build CREATE TABLE statement
    const columnDefs = [
      'id SERIAL PRIMARY KEY',
      `created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE`,
      'quantity INTEGER DEFAULT 1 NOT NULL',
      'added_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP',
      'qr_code VARCHAR(500)',
      'image1 VARCHAR(500)',
      'image2 VARCHAR(500)',
      'image3 VARCHAR(500)'
    ];

    // Validate and add custom fields
    if (!fields || fields.length === 0) {
      throw new BadRequestError('At least one field is required');
    }

    for (let i = 0; i < fields.length; i++) {
      const field = fields[i];

      // Validate field structure
      if (!field.field_name || !field.field_label || !field.field_type) {
        throw new BadRequestError(`Field ${i + 1} missing required properties (field_name, field_label, field_type)`);
      }

      // Sanitize field name
      const fieldName = sanitizeIdentifier(field.field_name);

      // Check if field type is allowed
      const dataType = ALLOWED_DATA_TYPES[field.field_type];
      if (!dataType) {
        throw new BadRequestError(`Invalid field type: ${field.field_type}`);
      }

      // Build column definition
      const nullable = field.is_required ? 'NOT NULL' : '';
      columnDefs.push(`${fieldName} ${dataType} ${nullable}`.trim());

      // Resolve lookup_table_id if it's a string (table name)
      let lookupTableId = field.lookup_table_id || null;
      if (lookupTableId && typeof lookupTableId === 'string') {
        const lookupResult = await client.query(
          'SELECT id FROM custom_lookup_tables WHERE table_name = $1',
          [lookupTableId]
        );
        lookupTableId = lookupResult.rows.length > 0 ? lookupResult.rows[0].id : null;
      }

      // Insert field metadata
      await client.query(`
        INSERT INTO custom_fields (
          table_id, field_name, field_label, field_type, is_required,
          display_order, placeholder, options, show_in_table, show_in_mobile,
          is_bold, help_text, lookup_table_id
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      `, [
        tableId,
        fieldName,
        field.field_label,
        field.field_type,
        field.is_required || false,
        field.display_order !== undefined ? field.display_order : i,
        field.placeholder || null,
        field.options ? JSON.stringify(field.options) : null,
        field.show_in_table !== false,
        field.show_in_mobile !== false,
        field.is_bold || false,
        field.help_text || null,
        lookupTableId
      ]);
    }

    // Execute CREATE TABLE (we've heavily sanitized all inputs)
    const createTableSQL = `CREATE TABLE ${physicalTableName} (${columnDefs.join(', ')})`;
    await client.query(createTableSQL);

    // Create indexes for performance
    await client.query(`CREATE INDEX idx_${physicalTableName}_created_by ON ${physicalTableName}(created_by)`);

    await client.query('COMMIT');

    return { tableId, tableName: physicalTableName };

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Delete a custom table and all associated data
 * @param {string} tableName - Table name (without username_data_ prefix)
 * @param {number} userId - ID of user requesting deletion
 * @param {string} userEmail - Email of user requesting deletion
 * @returns {Promise<void>}
 */
export async function deleteCustomTable(tableName, userId, userEmail) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Extract username from email
    const username = extractUsername(userEmail);

    // Sanitize table name
    const sanitizedTableName = sanitizeIdentifier(tableName);
    const physicalTableName = `${username}_data_${sanitizedTableName}`;

    // Get table metadata and check ownership
    const tableResult = await client.query(
      'SELECT id, created_by, is_system FROM custom_tables WHERE table_name = $1 AND created_by = $2',
      [sanitizedTableName, userId]
    );

    if (tableResult.rows.length === 0) {
      throw new BadRequestError(`Table '${sanitizedTableName}' not found in your account`);
    }

    const table = tableResult.rows[0];

    // Prevent deletion of system tables
    if (table.is_system) {
      throw new BadRequestError('Cannot delete system tables');
    }

    // Check ownership (only creator can delete)
    if (table.created_by !== userId) {
      throw new BadRequestError('Only the table creator can delete this table');
    }

    // Drop the physical table
    await client.query(`DROP TABLE IF EXISTS ${physicalTableName}`);

    // Delete metadata (cascade will handle custom_fields and table_permissions)
    await client.query('DELETE FROM custom_tables WHERE id = $1', [table.id]);

    await client.query('COMMIT');

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Add a field to an existing custom table
 * @param {string} tableName - Table name (without username_data_ prefix)
 * @param {Object} field - Field definition
 * @param {number} userId - ID of user adding the field
 * @param {string} userEmail - Email of user adding the field
 * @returns {Promise<void>}
 */
export async function addFieldToTable(tableName, field, userId, userEmail) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Extract username from email
    const username = extractUsername(userEmail);

    // Sanitize table name and field name
    const sanitizedTableName = sanitizeIdentifier(tableName);
    const physicalTableName = `${username}_data_${sanitizedTableName}`;
    const fieldName = sanitizeIdentifier(field.field_name);

    // Get table metadata and check ownership
    const tableResult = await client.query(
      'SELECT id, created_by FROM custom_tables WHERE table_name = $1 AND created_by = $2',
      [sanitizedTableName, userId]
    );

    if (tableResult.rows.length === 0) {
      throw new BadRequestError(`Table '${sanitizedTableName}' not found in your account`);
    }

    const table = tableResult.rows[0];

    // Check ownership
    if (table.created_by !== userId) {
      throw new BadRequestError('Only the table creator can modify this table');
    }

    // Check if field type is allowed
    const dataType = ALLOWED_DATA_TYPES[field.field_type];
    if (!dataType) {
      throw new BadRequestError(`Invalid field type: ${field.field_type}`);
    }

    // Add column to physical table
    const nullable = field.is_required ? 'NOT NULL' : '';
    const defaultValue = field.default_value ? `DEFAULT ${field.default_value}` : '';
    await client.query(
      `ALTER TABLE ${physicalTableName} ADD COLUMN ${fieldName} ${dataType} ${nullable} ${defaultValue}`.trim()
    );

    // Insert field metadata
    const maxOrder = await client.query(
      'SELECT COALESCE(MAX(display_order), -1) + 1 as next_order FROM custom_fields WHERE table_id = $1',
      [table.id]
    );

    await client.query(`
      INSERT INTO custom_fields (
        table_id, field_name, field_label, field_type, is_required,
        display_order, placeholder, options, show_in_table, show_in_mobile
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `, [
      table.id,
      fieldName,
      field.field_label,
      field.field_type,
      field.is_required || false,
      maxOrder.rows[0].next_order,
      field.placeholder || null,
      field.options ? JSON.stringify(field.options) : null,
      field.show_in_table !== false,
      field.show_in_mobile !== false
    ]);

    await client.query('COMMIT');

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
