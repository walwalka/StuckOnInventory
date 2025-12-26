import { jest } from '@jest/globals';
import express from 'express';
import request from 'supertest';
import { requireAuth, requireVerifiedEmail, requireVerifiedAuth, requireAdmin, requireAdminAuth } from '../../middleware/auth.js';
import { cleanupTestDB, createTestUser, generateTestTokens } from '../utils/dbHelper.js';
import passport from 'passport';
import configurePassport from '../../config/passport.js';

// Initialize passport strategies
configurePassport(passport);

// Mock nodemailer to prevent actual emails during tests
jest.unstable_mockModule('nodemailer', () => ({
  default: {
    createTransport: jest.fn(() => ({
      sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' })
    }))
  }
}));

// Create test Express app
const createTestApp = (middleware) => {
  const app = express();
  app.use(express.json());
  app.use(passport.initialize());

  // Test endpoint that uses the middleware
  app.get('/test', middleware, (req, res) => {
    res.json({ success: true, user: req.user });
  });

  // Error handler
  app.use((err, req, res, next) => {
    console.error('Test app error:', err.message, err.stack);
    res.status(err.status || 500).json({
      error: err.message,
      stack: err.stack
    });
  });

  return app;
};

describe('Authentication Middleware', () => {
  beforeAll(async () => {
    await cleanupTestDB();
  });

  afterAll(async () => {
    await cleanupTestDB();
  });

  afterEach(async () => {
    await cleanupTestDB();
  });

  describe('requireAuth', () => {
    test('should allow access with valid JWT', async () => {
      // Arrange: Create user and generate valid token
      const testUser = await createTestUser({
        email: 'validauth@test.com',
        password: 'password123',
        emailVerified: true,
        role: 'user'
      });

      const { accessToken } = generateTestTokens(testUser.id, 'user');
      const app = createTestApp(requireAuth);

      // Act: Make request with valid token
      const response = await request(app)
        .get('/test')
        .set('Authorization', `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('should attach user to req.user', async () => {
      // Arrange
      const testUser = await createTestUser({
        email: 'requser@test.com',
        password: 'password123',
        emailVerified: true,
        role: 'user'
      });

      const { accessToken } = generateTestTokens(testUser.id, 'user');
      const app = createTestApp(requireAuth);

      // Act
      const response = await request(app)
        .get('/test')
        .set('Authorization', `Bearer ${accessToken}`);

      // Assert: User should be attached to response
      expect(response.body.user).toBeDefined();
      expect(response.body.user.id).toBe(testUser.id);
      expect(response.body.user.email).toBe('requser@test.com');
    });

    test('should return 401 without token', async () => {
      // Arrange
      const app = createTestApp(requireAuth);

      // Act: Make request without token
      const response = await request(app)
        .get('/test');

      // Assert
      expect(response.status).toBe(401);
      expect(response.body.message).toContain('Unauthorized');
    });

    test('should return 401 with invalid token', async () => {
      // Arrange
      const app = createTestApp(requireAuth);

      // Act: Make request with invalid token
      const response = await request(app)
        .get('/test')
        .set('Authorization', 'Bearer invalid-token-string');

      // Assert
      expect(response.status).toBe(401);
    });
  });

  describe('requireVerifiedEmail', () => {
    test('should allow access if email verified', async () => {
      // Arrange: Create verified user
      const testUser = await createTestUser({
        email: 'verified@test.com',
        password: 'password123',
        emailVerified: true,
        role: 'user'
      });

      const { accessToken } = generateTestTokens(testUser.id, 'user');
      const app = createTestApp([requireAuth, requireVerifiedEmail]);

      // Act
      const response = await request(app)
        .get('/test')
        .set('Authorization', `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('should return 403 if email not verified', async () => {
      // Arrange: Create unverified user
      const testUser = await createTestUser({
        email: 'unverified@test.com',
        password: 'password123',
        emailVerified: false,
        role: 'user'
      });

      const { accessToken } = generateTestTokens(testUser.id, 'user');
      const app = createTestApp([requireAuth, requireVerifiedEmail]);

      // Act
      const response = await request(app)
        .get('/test')
        .set('Authorization', `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toBe(403);
      expect(response.body.error).toContain('Please verify your email address');
    });
  });

  describe('requireVerifiedAuth', () => {
    test('should combine requireAuth and requireVerifiedEmail', async () => {
      // Arrange: Create verified user
      const testUser = await createTestUser({
        email: 'combined@test.com',
        password: 'password123',
        emailVerified: true,
        role: 'user'
      });

      const { accessToken } = generateTestTokens(testUser.id, 'user');
      const app = createTestApp(requireVerifiedAuth);

      // Act
      const response = await request(app)
        .get('/test')
        .set('Authorization', `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toBe(200);
    });

    test('should return 401 without token', async () => {
      // Arrange
      const app = createTestApp(requireVerifiedAuth);

      // Act
      const response = await request(app)
        .get('/test');

      // Assert
      expect(response.status).toBe(401);
    });

    test('should return 403 if email not verified', async () => {
      // Arrange: Create unverified user
      const testUser = await createTestUser({
        email: 'unverifiedcombined@test.com',
        password: 'password123',
        emailVerified: false,
        role: 'user'
      });

      const { accessToken } = generateTestTokens(testUser.id, 'user');
      const app = createTestApp(requireVerifiedAuth);

      // Act
      const response = await request(app)
        .get('/test')
        .set('Authorization', `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toBe(403);
    });
  });

  describe('requireAdmin', () => {
    test('should allow access if user is admin', async () => {
      // Arrange: Create admin user
      const testUser = await createTestUser({
        email: 'admin@test.com',
        password: 'password123',
        emailVerified: true,
        role: 'admin'
      });

      const { accessToken } = generateTestTokens(testUser.id, 'admin');
      const app = createTestApp([requireAuth, requireAdmin]);

      // Act
      const response = await request(app)
        .get('/test')
        .set('Authorization', `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('should return 403 if user is not admin', async () => {
      // Arrange: Create regular user
      const testUser = await createTestUser({
        email: 'regularuser@test.com',
        password: 'password123',
        emailVerified: true,
        role: 'user'
      });

      const { accessToken } = generateTestTokens(testUser.id, 'user');
      const app = createTestApp([requireAuth, requireAdmin]);

      // Act
      const response = await request(app)
        .get('/test')
        .set('Authorization', `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toBe(403);
      expect(response.body.error).toContain('Admin access required');
    });
  });

  describe('requireAdminAuth', () => {
    test('should combine auth, verification, and admin checks', async () => {
      // Arrange: Create verified admin
      const testUser = await createTestUser({
        email: 'verifiedadmin@test.com',
        password: 'password123',
        emailVerified: true,
        role: 'admin'
      });

      const { accessToken } = generateTestTokens(testUser.id, 'admin');
      const app = createTestApp(requireAdminAuth);

      // Act
      const response = await request(app)
        .get('/test')
        .set('Authorization', `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toBe(200);
    });

    test('should return 401 without token', async () => {
      // Arrange
      const app = createTestApp(requireAdminAuth);

      // Act
      const response = await request(app)
        .get('/test');

      // Assert
      expect(response.status).toBe(401);
    });

    test('should return 403 if email not verified', async () => {
      // Arrange: Unverified admin
      const testUser = await createTestUser({
        email: 'unverifiedadmin@test.com',
        password: 'password123',
        emailVerified: false,
        role: 'admin'
      });

      const { accessToken } = generateTestTokens(testUser.id, 'admin');
      const app = createTestApp(requireAdminAuth);

      // Act
      const response = await request(app)
        .get('/test')
        .set('Authorization', `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toBe(403);
      expect(response.body.error).toContain('Please verify your email address');
    });

    test('should return 403 if not admin', async () => {
      // Arrange: Verified regular user
      const testUser = await createTestUser({
        email: 'verifieduser@test.com',
        password: 'password123',
        emailVerified: true,
        role: 'user'
      });

      const { accessToken } = generateTestTokens(testUser.id, 'user');
      const app = createTestApp(requireAdminAuth);

      // Act
      const response = await request(app)
        .get('/test')
        .set('Authorization', `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toBe(403);
      expect(response.body.error).toContain('Admin access required');
    });
  });
});
