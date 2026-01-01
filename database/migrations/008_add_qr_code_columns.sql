-- Migration: Add QR code columns to inventory tables
-- Description: Adds qr_code column to coins, relics, stamps, bunnykins, and comics tables
-- Created: 2025-12-31

-- Add qr_code to coins table
ALTER TABLE coins
ADD COLUMN IF NOT EXISTS qr_code VARCHAR(500);

-- Add qr_code to relics table
ALTER TABLE relics
ADD COLUMN IF NOT EXISTS qr_code VARCHAR(500);

-- Add qr_code to stamps table
ALTER TABLE stamps
ADD COLUMN IF NOT EXISTS qr_code VARCHAR(500);

-- Add qr_code to bunnykins table
ALTER TABLE bunnykins
ADD COLUMN IF NOT EXISTS qr_code VARCHAR(500);

-- Add qr_code to comics table
ALTER TABLE comics
ADD COLUMN IF NOT EXISTS qr_code VARCHAR(500);
