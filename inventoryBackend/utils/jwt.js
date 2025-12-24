import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { jwtSecret, jwtAccessExpiry, jwtRefreshExpiry } from '../config.js';

/**
 * Generate a JWT access token (short-lived, 15 minutes)
 * @param {number} userId - The user ID to encode in the token
 * @returns {string} - Signed JWT access token
 */
export function generateAccessToken(userId) {
  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not configured in environment variables');
  }

  return jwt.sign(
    { userId, type: 'access' },
    jwtSecret,
    { expiresIn: jwtAccessExpiry }
  );
}

/**
 * Generate a JWT refresh token (long-lived, 7 days)
 * @param {number} userId - The user ID to encode in the token
 * @returns {string} - Signed JWT refresh token
 */
export function generateRefreshToken(userId) {
  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not configured in environment variables');
  }

  return jwt.sign(
    { userId, type: 'refresh' },
    jwtSecret,
    { expiresIn: jwtRefreshExpiry }
  );
}

/**
 * Verify and decode a JWT token
 * @param {string} token - The JWT token to verify
 * @returns {Object} - Decoded token payload
 * @throws {Error} - If token is invalid or expired
 */
export function verifyToken(token) {
  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not configured in environment variables');
  }

  try {
    return jwt.verify(token, jwtSecret);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    }
    throw error;
  }
}

/**
 * Generate a random token for email verification
 * @returns {string} - Random hex string (32 bytes)
 */
export function generateVerificationToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Generate a random token for password reset
 * @returns {string} - Random hex string (32 bytes)
 */
export function generatePasswordResetToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Calculate expiry time from a duration string (e.g., '24h', '15m')
 * @param {string} duration - Duration string (e.g., '24h', '15m', '7d')
 * @returns {Date} - Expiry date
 */
export function calculateExpiry(duration) {
  const units = {
    's': 1000,                    // seconds
    'm': 1000 * 60,               // minutes
    'h': 1000 * 60 * 60,          // hours
    'd': 1000 * 60 * 60 * 24      // days
  };

  const match = duration.match(/^(\d+)([smhd])$/);
  if (!match) {
    throw new Error(`Invalid duration format: ${duration}`);
  }

  const [, value, unit] = match;
  const milliseconds = parseInt(value) * units[unit];

  return new Date(Date.now() + milliseconds);
}
