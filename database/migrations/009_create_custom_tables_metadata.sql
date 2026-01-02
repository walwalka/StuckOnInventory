-- Migration: Create Custom Tables Metadata System
-- Description: Creates metadata tables to support user-defined custom inventory tables
-- Created: 2025-01-01

-- Table: custom_tables
-- Stores definitions for all custom collectible types (including migrated existing ones)
CREATE TABLE custom_tables (
  id SERIAL PRIMARY KEY,
  table_name VARCHAR(63) NOT NULL UNIQUE,
  display_name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  is_system BOOLEAN DEFAULT FALSE,
  created_by INTEGER REFERENCES users(id) ON DELETE CASCADE,
  is_shared BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT table_name_format CHECK (table_name ~ '^[a-z][a-z0-9_]*$')
);

CREATE INDEX idx_custom_tables_created_by ON custom_tables(created_by);
CREATE INDEX idx_custom_tables_shared ON custom_tables(is_shared);
CREATE INDEX idx_custom_tables_system ON custom_tables(is_system);

-- Table: custom_lookup_tables
-- User-defined reference/lookup tables (created before custom_fields due to FK)
CREATE TABLE custom_lookup_tables (
  id SERIAL PRIMARY KEY,
  table_name VARCHAR(63) NOT NULL UNIQUE,
  display_name VARCHAR(255) NOT NULL,
  created_by INTEGER REFERENCES users(id) ON DELETE CASCADE,
  is_shared BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT lookup_table_name_format CHECK (table_name ~ '^lookup_[a-z][a-z0-9_]*$')
);

CREATE INDEX idx_custom_lookup_tables_created_by ON custom_lookup_tables(created_by);

-- Table: custom_fields
-- Defines the schema for each custom table
CREATE TABLE custom_fields (
  id SERIAL PRIMARY KEY,
  table_id INTEGER NOT NULL REFERENCES custom_tables(id) ON DELETE CASCADE,
  field_name VARCHAR(63) NOT NULL,
  field_label VARCHAR(255) NOT NULL,
  field_type VARCHAR(50) NOT NULL,
  is_required BOOLEAN DEFAULT FALSE,
  display_order INTEGER NOT NULL DEFAULT 0,
  placeholder VARCHAR(255),
  validation_rules JSONB,
  options JSONB,
  lookup_table_id INTEGER REFERENCES custom_lookup_tables(id) ON DELETE SET NULL,
  show_in_table BOOLEAN DEFAULT TRUE,
  show_in_mobile BOOLEAN DEFAULT TRUE,
  is_bold BOOLEAN DEFAULT FALSE,
  help_text TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_field_per_table UNIQUE(table_id, field_name),
  CONSTRAINT field_name_format CHECK (field_name ~ '^[a-z][a-z0-9_]*$')
);

CREATE INDEX idx_custom_fields_table_id ON custom_fields(table_id);
CREATE INDEX idx_custom_fields_lookup_table ON custom_fields(lookup_table_id);

-- Table: custom_lookup_values
-- Values for custom lookup tables (dynamic structure)
CREATE TABLE custom_lookup_values (
  id SERIAL PRIMARY KEY,
  lookup_table_id INTEGER NOT NULL REFERENCES custom_lookup_tables(id) ON DELETE CASCADE,
  value_data JSONB NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_custom_lookup_values_table_id ON custom_lookup_values(lookup_table_id);

-- Table: table_permissions
-- Fine-grained access control for tables
CREATE TABLE table_permissions (
  id SERIAL PRIMARY KEY,
  table_id INTEGER NOT NULL REFERENCES custom_tables(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  permission_level VARCHAR(20) NOT NULL,
  granted_by INTEGER REFERENCES users(id),
  granted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_user_table_permission UNIQUE(table_id, user_id),
  CONSTRAINT valid_permission_level CHECK (permission_level IN ('view', 'edit', 'admin'))
);

CREATE INDEX idx_table_permissions_table_user ON table_permissions(table_id, user_id);
