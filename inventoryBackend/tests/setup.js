// Test setup file - runs before all tests
import { pool } from '../database/database.js';

// Set NODE_ENV to test
process.env.NODE_ENV = 'test';

// Set test JWT secret
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only-not-production';
process.env.JWT_ACCESS_EXPIRY = '15m';
process.env.JWT_REFRESH_EXPIRY = '7d';

// Global teardown - close database pool after all tests
afterAll(async () => {
  await pool.end();
});
