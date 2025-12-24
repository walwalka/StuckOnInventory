import express from 'express';
import { pool } from '../database/database.js';
import bcrypt from 'bcrypt';
import {
  generateAccessToken,
  generateRefreshToken,
  generateVerificationToken,
  generatePasswordResetToken,
  verifyToken,
  calculateExpiry
} from '../utils/jwt.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/emailService.js';
import { authLimiter, passwordResetLimiter, emailVerificationLimiter } from '../middleware/rateLimiter.js';
import { requireAuth } from '../middleware/auth.js';
import { emailVerificationExpiry, passwordResetExpiry } from '../config.js';

const router = express.Router();
const SALT_ROUNDS = 10;

// ==================== REGISTER ====================
// POST /api/auth/register
// Create new user account and send verification email
router.post('/register', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Password length validation
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Generate verification token
    const verificationToken = generateVerificationToken();
    const verificationExpiry = calculateExpiry(emailVerificationExpiry);

    // Insert new user with verification token
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, verification_token, verification_token_expires)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, email_verified, created_at`,
      [email.toLowerCase(), passwordHash, verificationToken, verificationExpiry]
    );

    const user = result.rows[0];

    // Send verification email (async, don't wait)
    sendVerificationEmail(user.email, verificationToken).catch(err => {
      console.error('Failed to send verification email:', err);
    });

    // Generate JWT tokens
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Store refresh token in database
    await pool.query(
      'UPDATE users SET refresh_token = $1 WHERE id = $2',
      [refreshToken, user.id]
    );

    res.status(201).json({
      message: 'User registered successfully. Please check your email to verify your account.',
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        emailVerified: user.email_verified,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// ==================== LOGIN ====================
// POST /api/auth/login
// Authenticate user and return JWT tokens
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email
    const result = await pool.query(
      'SELECT id, email, password_hash, email_verified, created_at FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check if email is verified
    if (!user.email_verified) {
      return res.status(403).json({
        error: 'Email not verified',
        message: 'Please verify your email address before logging in. Check your inbox for the verification link.',
        emailVerified: false
      });
    }

    // Generate JWT tokens
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Store refresh token in database
    await pool.query(
      'UPDATE users SET refresh_token = $1 WHERE id = $2',
      [refreshToken, user.id]
    );

    res.json({
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        emailVerified: user.email_verified,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// ==================== REFRESH TOKEN ====================
// POST /api/auth/refresh
// Exchange refresh token for new access token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = verifyToken(refreshToken);
    } catch (error) {
      return res.status(401).json({ error: error.message });
    }

    // Check token type
    if (decoded.type !== 'refresh') {
      return res.status(401).json({ error: 'Invalid token type' });
    }

    // Verify refresh token exists in database
    const result = await pool.query(
      'SELECT id, email, email_verified, refresh_token FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    const user = result.rows[0];

    // Check if refresh token matches the one in database
    if (user.refresh_token !== refreshToken) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    // Generate new access token
    const accessToken = generateAccessToken(user.id);

    res.json({
      message: 'Token refreshed successfully',
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        emailVerified: user.email_verified
      }
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ error: 'Token refresh failed' });
  }
});

// ==================== LOGOUT ====================
// POST /api/auth/logout
// Invalidate refresh token
router.post('/logout', requireAuth, async (req, res) => {
  try {
    // Clear refresh token from database
    await pool.query(
      'UPDATE users SET refresh_token = NULL WHERE id = $1',
      [req.user.id]
    );

    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// ==================== VERIFY EMAIL ====================
// POST /api/auth/verify-email
// Verify user's email address using verification token
router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Verification token is required' });
    }

    // Find user with matching verification token
    const result = await pool.query(
      `SELECT id, email, verification_token_expires
       FROM users
       WHERE verification_token = $1 AND email_verified = false`,
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired verification token' });
    }

    const user = result.rows[0];

    // Check if token has expired
    if (new Date() > new Date(user.verification_token_expires)) {
      return res.status(400).json({ error: 'Verification token has expired. Please request a new one.' });
    }

    // Update user as verified
    await pool.query(
      `UPDATE users
       SET email_verified = true,
           verification_token = NULL,
           verification_token_expires = NULL
       WHERE id = $1`,
      [user.id]
    );

    res.json({
      message: 'Email verified successfully. You can now log in.',
      emailVerified: true
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ error: 'Email verification failed' });
  }
});

// ==================== RESEND VERIFICATION EMAIL ====================
// POST /api/auth/resend-verification
// Resend verification email to user
router.post('/resend-verification', emailVerificationLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Find user
    const result = await pool.query(
      'SELECT id, email, email_verified FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      // Don't reveal if email exists or not (security best practice)
      return res.json({
        message: 'If an account exists with this email, a verification email has been sent.'
      });
    }

    const user = result.rows[0];

    // Check if already verified
    if (user.email_verified) {
      return res.status(400).json({ error: 'Email is already verified' });
    }

    // Generate new verification token
    const verificationToken = generateVerificationToken();
    const verificationExpiry = calculateExpiry(emailVerificationExpiry);

    // Update verification token
    await pool.query(
      'UPDATE users SET verification_token = $1, verification_token_expires = $2 WHERE id = $3',
      [verificationToken, verificationExpiry, user.id]
    );

    // Send verification email
    await sendVerificationEmail(user.email, verificationToken);

    res.json({
      message: 'Verification email sent successfully. Please check your inbox.'
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ error: 'Failed to resend verification email' });
  }
});

// ==================== FORGOT PASSWORD ====================
// POST /api/auth/forgot-password
// Generate password reset token and send email
router.post('/forgot-password', passwordResetLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Find user
    const result = await pool.query(
      'SELECT id, email FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      // Don't reveal if email exists or not (security best practice)
      return res.json({
        message: 'If an account exists with this email, a password reset link has been sent.'
      });
    }

    const user = result.rows[0];

    // Generate password reset token
    const resetToken = generatePasswordResetToken();
    const resetExpiry = calculateExpiry(passwordResetExpiry);

    // Store reset token
    await pool.query(
      'UPDATE users SET password_reset_token = $1, password_reset_token_expires = $2 WHERE id = $3',
      [resetToken, resetExpiry, user.id]
    );

    // Send password reset email
    await sendPasswordResetEmail(user.email, resetToken);

    res.json({
      message: 'If an account exists with this email, a password reset link has been sent.'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to process password reset request' });
  }
});

// ==================== RESET PASSWORD ====================
// POST /api/auth/reset-password
// Reset password using reset token
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }

    // Password length validation
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Find user with matching reset token
    const result = await pool.query(
      `SELECT id, email, password_reset_token_expires
       FROM users
       WHERE password_reset_token = $1`,
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    const user = result.rows[0];

    // Check if token has expired
    if (new Date() > new Date(user.password_reset_token_expires)) {
      return res.status(400).json({ error: 'Reset token has expired. Please request a new one.' });
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    // Update password and clear reset token
    await pool.query(
      `UPDATE users
       SET password_hash = $1,
           password_reset_token = NULL,
           password_reset_token_expires = NULL,
           refresh_token = NULL
       WHERE id = $2`,
      [passwordHash, user.id]
    );

    res.json({
      message: 'Password reset successfully. You can now log in with your new password.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

export default router;
