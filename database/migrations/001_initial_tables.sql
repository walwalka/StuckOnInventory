-- Migration: Create initial database tables
-- Description: Creates all core tables for inventory management system
-- Created: 2024-12-28

-- Create schema_migrations table for tracking
CREATE TABLE IF NOT EXISTS schema_migrations (
  id SERIAL PRIMARY KEY,
  version VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  applied_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  execution_time_ms INTEGER
);

-- Coins table
CREATE TABLE coins (
  id SERIAL PRIMARY KEY,
  type VARCHAR(255) NOT NULL,
  mintlocation VARCHAR(255) NOT NULL,
  mintyear DATE NOT NULL,
  circulation VARCHAR(255) NOT NULL,
  grade VARCHAR(255) NOT NULL,
  image1 VARCHAR(500),
  image2 VARCHAR(500),
  image3 VARCHAR(500),
  face_value DECIMAL(10,2),
  added_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  estimated_value DECIMAL(10, 2)
);

-- Coin types lookup table
CREATE TABLE cointypes (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  face_value DECIMAL(10,2) NOT NULL
);

-- Mint locations lookup table
CREATE TABLE mintlocations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  city VARCHAR(255) NOT NULL,
  state VARCHAR(255) NOT NULL
);

CREATE UNIQUE INDEX uq_mint_name ON mintlocations (name);

-- Relics table
CREATE TABLE relics (
  id SERIAL PRIMARY KEY,
  type VARCHAR(255) NOT NULL,
  origin VARCHAR(255) NOT NULL,
  era VARCHAR(255) NOT NULL,
  condition VARCHAR(255) NOT NULL,
  description TEXT,
  image1 VARCHAR(500),
  image2 VARCHAR(500),
  image3 VARCHAR(500)
);

-- Relic types lookup table
CREATE TABLE relictypes (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE
);

-- Stamps table
CREATE TABLE stamps (
  id SERIAL PRIMARY KEY,
  country VARCHAR(255) NOT NULL,
  denomination VARCHAR(255) NOT NULL,
  issueyear VARCHAR(255) NOT NULL,
  condition VARCHAR(255) NOT NULL,
  description TEXT,
  image1 VARCHAR(500),
  image2 VARCHAR(500),
  image3 VARCHAR(500)
);

-- Bunnykins table
CREATE TABLE bunnykins (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  series VARCHAR(255) NOT NULL,
  productionyear VARCHAR(255) NOT NULL,
  condition VARCHAR(255) NOT NULL,
  description TEXT,
  image1 VARCHAR(500),
  image2 VARCHAR(500),
  image3 VARCHAR(500)
);

-- Comics table
CREATE TABLE comics (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  publisher VARCHAR(255) NOT NULL,
  series VARCHAR(255) NOT NULL,
  issuenumber VARCHAR(100) NOT NULL,
  publicationyear VARCHAR(100) NOT NULL,
  grade VARCHAR(100) NOT NULL,
  condition VARCHAR(255) NOT NULL,
  variant VARCHAR(255),
  description TEXT,
  image1 VARCHAR(500),
  image2 VARCHAR(500),
  image3 VARCHAR(500),
  added_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Comic publishers lookup table
CREATE TABLE comicpublishers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE
);

-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
