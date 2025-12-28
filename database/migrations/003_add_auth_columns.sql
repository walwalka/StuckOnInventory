-- Migration: Add authentication columns to users table
-- Description: Adds columns for email verification, password reset, and refresh tokens
-- Created: 2025-12-24

-- Add email verification columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token_expires TIMESTAMPTZ;

-- Add password reset columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_token VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_token_expires TIMESTAMPTZ;

-- Add refresh token column
ALTER TABLE users ADD COLUMN IF NOT EXISTS refresh_token TEXT;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_verification_token ON users(verification_token);
CREATE INDEX IF NOT EXISTS idx_users_password_reset_token ON users(password_reset_token);
CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users(email_verified);

-- For existing users, you may want to set email_verified to true
-- Uncomment the following line if you want to auto-verify existing users:
-- UPDATE users SET email_verified = true WHERE email_verified = false;
