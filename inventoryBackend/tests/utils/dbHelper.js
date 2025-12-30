import bcrypt from 'bcrypt';
import { pool } from '../database/database.js';
import { generateAccessToken, generateRefreshToken } from '../../utils/jwt.js';

/**
 * Clean up all test data from the database
 */
export async function cleanupTestDB() {
  try {
    // Delete test users (emails ending with @test.com)
    await pool.query("DELETE FROM users WHERE email LIKE '%@test.com'");
  } catch (error) {
    console.error('Error cleaning up test database:', error);
    throw error;
  }
}

/**
 * Create a test user in the database
 * @param {Object} data - User data
 * @param {string} data.email - User email
 * @param {string} data.password - Plain text password (will be hashed)
 * @param {boolean} data.emailVerified - Email verification status (default: true)
 * @param {string} data.role - User role (default: 'user')
 * @param {boolean} data.isActive - Account active status (default: true)
 * @returns {Promise<Object>} Created user object
 */
export async function createTestUser(data = {}) {
  const {
    email = 'testuser@test.com',
    password = 'password123',
    emailVerified = true,
    role = 'user',
    isActive = true
  } = data;

  try {
    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert user into database
    const result = await pool.query(
      `INSERT INTO users
       (email, password_hash, email_verified, role, is_active, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING id, email, email_verified, role, is_active, created_at`,
      [email.toLowerCase(), passwordHash, emailVerified, role, isActive]
    );

    return result.rows[0];
  } catch (error) {
    console.error('Error creating test user:', error);
    throw error;
  }
}

/**
 * Create a test admin user
 * @param {Object} data - User data (optional)
 * @returns {Promise<Object>} Created admin user object
 */
export async function createAdminUser(data = {}) {
  return createTestUser({
    email: 'admin@test.com',
    password: 'admin123',
    role: 'admin',
    emailVerified: true,
    isActive: true,
    ...data
  });
}

/**
 * Generate test JWT tokens for a user
 * @param {number} userId - User ID
 * @param {string} role - User role (default: 'user')
 * @returns {Object} Object containing accessToken and refreshToken
 */
export function generateTestTokens(userId, role = 'user') {
  const accessToken = generateAccessToken(userId, role);
  const refreshToken = generateRefreshToken(userId);

  return {
    accessToken,
    refreshToken
  };
}

/**
 * Store refresh token in database for a user
 * @param {number} userId - User ID
 * @param {string} refreshToken - Refresh token to store
 */
export async function storeRefreshToken(userId, refreshToken) {
  try {
    await pool.query(
      'UPDATE users SET refresh_token = $1 WHERE id = $2',
      [refreshToken, userId]
    );
  } catch (error) {
    console.error('Error storing refresh token:', error);
    throw error;
  }
}

/**
 * Get user from database by ID
 * @param {number} userId - User ID
 * @returns {Promise<Object|null>} User object or null
 */
export async function getUserById(userId) {
  try {
    const result = await pool.query(
      'SELECT id, email, email_verified, role, is_active, refresh_token, last_login, created_at FROM users WHERE id = $1',
      [userId]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting user by ID:', error);
    throw error;
  }
}

/**
 * Get user from database by email
 * @param {string} email - User email
 * @returns {Promise<Object|null>} User object or null
 */
export async function getUserByEmail(email) {
  try {
    const result = await pool.query(
      'SELECT id, email, password_hash, email_verified, role, is_active, refresh_token, last_login, created_at FROM users WHERE email = $1',
      [email.toLowerCase()]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting user by email:', error);
    throw error;
  }
}
