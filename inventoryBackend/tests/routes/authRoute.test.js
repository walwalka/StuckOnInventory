import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import { pool } from '../database/database.js';
import authRoute from '../../routes/authRoute.js';
import {
  cleanupTestDB,
  createTestUser,
  getUserById,
  getUserByEmail,
  generateTestTokens,
  storeRefreshToken
} from '../utils/dbHelper.js';

// Mock nodemailer to prevent actual emails during tests
jest.unstable_mockModule('nodemailer', () => ({
  default: {
    createTransport: jest.fn(() => ({
      sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' })
    }))
  }
}));

// Create a test Express app
const app = express();
app.use(express.json());
app.use('/api/auth', authRoute);

describe('POST /api/auth/login', () => {
  // Clean up test data before and after all tests
  beforeAll(async () => {
    await cleanupTestDB();
  });

  afterAll(async () => {
    await cleanupTestDB();
  });

  describe('Happy Path Tests', () => {
    test('should login successfully with valid credentials', async () => {
      // Arrange: Create a verified user
      const testUser = await createTestUser({
        email: 'valid@test.com',
        password: 'password123',
        emailVerified: true,
        role: 'user',
        isActive: true
      });

      // Act: Login with valid credentials
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'valid@test.com',
          password: 'password123'
        });

      // Assert: Check response
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toMatchObject({
        id: testUser.id,
        email: 'valid@test.com',
        emailVerified: true,
        role: 'user'
      });
    });

    test('should return accessToken and refreshToken', async () => {
      // Arrange
      await createTestUser({
        email: 'tokentest@test.com',
        password: 'password123',
        emailVerified: true
      });

      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'tokentest@test.com',
          password: 'password123'
        });

      // Assert: Tokens should be present and be strings
      expect(typeof response.body.accessToken).toBe('string');
      expect(typeof response.body.refreshToken).toBe('string');
      expect(response.body.accessToken.length).toBeGreaterThan(0);
      expect(response.body.refreshToken.length).toBeGreaterThan(0);
    });

    test('should update last_login timestamp', async () => {
      // Arrange
      const testUser = await createTestUser({
        email: 'lastlogin@test.com',
        password: 'password123',
        emailVerified: true
      });

      // Get initial last_login (should be null)
      const userBefore = await getUserById(testUser.id);
      expect(userBefore.last_login).toBeNull();

      // Act: Login
      await request(app)
        .post('/api/auth/login')
        .send({
          email: 'lastlogin@test.com',
          password: 'password123'
        });

      // Assert: last_login should be updated
      const userAfter = await getUserById(testUser.id);
      expect(userAfter.last_login).not.toBeNull();
      expect(new Date(userAfter.last_login)).toBeInstanceOf(Date);
    });

    test('should store refresh_token in database', async () => {
      // Arrange
      const testUser = await createTestUser({
        email: 'refreshdb@test.com',
        password: 'password123',
        emailVerified: true
      });

      // Act: Login
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'refreshdb@test.com',
          password: 'password123'
        });

      // Assert: Refresh token should be in database
      const userInDB = await getUserById(testUser.id);
      expect(userInDB.refresh_token).not.toBeNull();
      expect(userInDB.refresh_token).toBe(response.body.refreshToken);
    });

    test('should include role in response user object', async () => {
      // Arrange
      await createTestUser({
        email: 'roletest@test.com',
        password: 'password123',
        emailVerified: true,
        role: 'admin'
      });

      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'roletest@test.com',
          password: 'password123'
        });

      // Assert
      expect(response.body.user.role).toBe('admin');
    });
  });

  describe('Error Cases', () => {
    test('should return 400 if email is missing', async () => {
      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          password: 'password123'
        });

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    test('should return 400 if password is missing', async () => {
      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@test.com'
        });

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    test('should return 401 if user not found', async () => {
      // Act: Try to login with non-existent user
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'password123'
        });

      // Assert
      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid email or password');
    });

    test('should return 401 if password is incorrect', async () => {
      // Arrange: Create user
      await createTestUser({
        email: 'wrongpass@test.com',
        password: 'correctpassword',
        emailVerified: true
      });

      // Act: Try to login with wrong password
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'wrongpass@test.com',
          password: 'wrongpassword'
        });

      // Assert
      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid email or password');
      expect(response.body).not.toHaveProperty('accessToken');
      expect(response.body).not.toHaveProperty('refreshToken');
    });

    test('should return 403 if account is disabled (is_active=false)', async () => {
      // Arrange: Create disabled user
      await createTestUser({
        email: 'disabled@test.com',
        password: 'password123',
        emailVerified: true,
        isActive: false
      });

      // Act: Try to login
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'disabled@test.com',
          password: 'password123'
        });

      // Assert
      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Account disabled');
      expect(response.body.message).toContain('disabled');
    });

    test('should return 403 if email is not verified', async () => {
      // Arrange: Create unverified user
      await createTestUser({
        email: 'unverified@test.com',
        password: 'password123',
        emailVerified: false,
        isActive: true
      });

      // Act: Try to login
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'unverified@test.com',
          password: 'password123'
        });

      // Assert
      expect(response.status).toBe(403);
      expect(response.body.emailVerified).toBe(false);
      expect(response.body.message).toContain('verify');
    });
  });

  describe('Edge Cases', () => {
    test('should handle case-insensitive email lookup', async () => {
      // Arrange: Create user with lowercase email
      await createTestUser({
        email: 'casetest@test.com',
        password: 'password123',
        emailVerified: true
      });

      // Act: Login with uppercase email
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'CASETEST@TEST.COM',
          password: 'password123'
        });

      // Assert: Should succeed
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('accessToken');
    });
  });
});

describe('POST /api/auth/refresh', () => {
  beforeAll(async () => {
    await cleanupTestDB();
  });

  afterAll(async () => {
    await cleanupTestDB();
  });

  afterEach(async () => {
    await cleanupTestDB();
  });

  describe('Happy Path', () => {
    test('should refresh access token with valid refresh token', async () => {
      // Arrange: Create user and generate tokens
      const testUser = await createTestUser({
        email: 'refresh@test.com',
        password: 'password123',
        emailVerified: true
      });

      const { refreshToken } = generateTestTokens(testUser.id, 'user');
      await storeRefreshToken(testUser.id, refreshToken);

      // Act: Request token refresh
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('accessToken');
      expect(typeof response.body.accessToken).toBe('string');
      expect(response.body.accessToken.length).toBeGreaterThan(0);
    });

    test('should return new accessToken', async () => {
      // Arrange
      const testUser = await createTestUser({
        email: 'newtoken@test.com',
        password: 'password123',
        emailVerified: true
      });

      const { refreshToken } = generateTestTokens(testUser.id, 'user');
      await storeRefreshToken(testUser.id, refreshToken);

      // Act
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken });

      // Assert: Should have new access token
      expect(response.body.accessToken).toBeDefined();
      expect(response.body.accessToken).not.toBe(refreshToken);
    });

    test('should not change refreshToken', async () => {
      // Arrange
      const testUser = await createTestUser({
        email: 'keeprefresh@test.com',
        password: 'password123',
        emailVerified: true
      });

      const { refreshToken } = generateTestTokens(testUser.id, 'user');
      await storeRefreshToken(testUser.id, refreshToken);

      // Act
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken });

      // Assert: Response should not include new refresh token
      expect(response.body.refreshToken).toBeUndefined();
    });
  });

  describe('Error Cases', () => {
    test('should return 400 if refreshToken is missing', async () => {
      // Act
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({});

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    test('should return 401 if refreshToken is invalid', async () => {
      // Act: Send invalid token
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid-token-string' });

      // Assert
      expect(response.status).toBe(401);
    });

    test('should return 401 if refreshToken not in database', async () => {
      // Arrange: Create user but don't store refresh token
      const testUser = await createTestUser({
        email: 'norefresh@test.com',
        password: 'password123',
        emailVerified: true
      });

      // Generate valid token but don't store it in DB
      const { refreshToken } = generateTestTokens(testUser.id, 'user');

      // Act: Try to refresh
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken });

      // Assert
      expect(response.status).toBe(401);
    });
  });
});
