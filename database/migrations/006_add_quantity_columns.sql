-- Add quantity column to all inventory tables
-- This allows tracking multiple instances of the same item

-- Add quantity to coins table
ALTER TABLE coins ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1 NOT NULL;

-- Add quantity to relics table
ALTER TABLE relics ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1 NOT NULL;

-- Add quantity to stamps table
ALTER TABLE stamps ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1 NOT NULL;

-- Add quantity to bunnykins table
ALTER TABLE bunnykins ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1 NOT NULL;

-- Add quantity to comics table
ALTER TABLE comics ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1 NOT NULL;

-- Update existing records to have quantity 1
UPDATE coins SET quantity = 1 WHERE quantity IS NULL;
UPDATE relics SET quantity = 1 WHERE quantity IS NULL;
UPDATE stamps SET quantity = 1 WHERE quantity IS NULL;
UPDATE bunnykins SET quantity = 1 WHERE quantity IS NULL;
UPDATE comics SET quantity = 1 WHERE quantity IS NULL;
