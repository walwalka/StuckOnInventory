-- Add is_active column to users table
-- This allows admins to enable/disable user accounts

ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true NOT NULL;

-- Add last_login column to track user activity
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;

-- Create index for faster queries on active users
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- Update existing users to be active
UPDATE users SET is_active = true WHERE is_active IS NULL;
