-- Migration: Add added_date column to collectibles
-- Description: Adds added_date timestamp column to relics, stamps, and bunnykins tables for consistency with coins and comics
-- Created: 2025-12-30

-- Add added_date to relics table
ALTER TABLE relics
ADD COLUMN added_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;

-- Add added_date to stamps table
ALTER TABLE stamps
ADD COLUMN added_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;

-- Add added_date to bunnykins table
ALTER TABLE bunnykins
ADD COLUMN added_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;

-- Update existing records to set added_date to current timestamp
-- (For existing records without a date, we'll use the current timestamp as a baseline)
UPDATE relics SET added_date = CURRENT_TIMESTAMP WHERE added_date IS NULL;
UPDATE stamps SET added_date = CURRENT_TIMESTAMP WHERE added_date IS NULL;
UPDATE bunnykins SET added_date = CURRENT_TIMESTAMP WHERE added_date IS NULL;
