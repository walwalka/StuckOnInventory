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
import {
  asyncHandler,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  ValidationError
} from '../middleware/errorHandler.js';

const router = express.Router();
const SALT_ROUNDS = 10;

// ==================== REGISTER ====================
// POST /api/auth/register
// Create new user account using invite token
router.post('/register', authLimiter, asyncHandler(async (req, res) => {
  const { email, password, inviteToken } = req.body;

  // Collect validation errors
  const validationErrors = [];

  if (!email) validationErrors.push('Email is required');
  if (!password) validationErrors.push('Password is required');
  if (!inviteToken) validationErrors.push('Invite token is required');

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email && !emailRegex.test(email)) {
    validationErrors.push('Invalid email format');
  }

  // Password length validation
  if (password && password.length < 6) {
    validationErrors.push('Password must be at least 6 characters');
  }

  if (validationErrors.length > 0) {
    throw new ValidationError('Validation failed', validationErrors);
  }

  // Verify invite token
  const inviteResult = await pool.query(
    'SELECT id, email, expires_at, used_at FROM invites WHERE token = $1',
    [inviteToken]
  );

  if (inviteResult.rows.length === 0) {
    throw new BadRequestError('Invalid invitation token');
  }

  const invite = inviteResult.rows[0];

  // Check if invite has been used
  if (invite.used_at) {
    throw new BadRequestError('This invitation has already been used');
  }

  // Check if invite has expired
  if (new Date(invite.expires_at) < new Date()) {
    throw new BadRequestError('This invitation has expired');
  }

  // Verify email matches invite
  if (invite.email.toLowerCase() !== email.toLowerCase()) {
    throw new BadRequestError('Email does not match invitation');
  }

  // Check if user already exists
  const existingUser = await pool.query(
    'SELECT id FROM users WHERE email = $1',
    [email.toLowerCase()]
  );

  if (existingUser.rows.length > 0) {
    throw new ConflictError('Email already registered');
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  // Insert new user (email is automatically verified since they used an invite)
  const result = await pool.query(
    `INSERT INTO users (email, password_hash, email_verified, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, email, email_verified, role, created_at`,
    [email.toLowerCase(), passwordHash, true, 'user']
  );

  const user = result.rows[0];

  // Mark invite as used
  await pool.query(
    'UPDATE invites SET used_at = NOW(), used_by = $1 WHERE id = $2',
    [user.id, invite.id]
  );

  // Generate JWT tokens
  const accessToken = generateAccessToken(user.id, user.role);
  const refreshToken = generateRefreshToken(user.id);

  // Store refresh token in database
  await pool.query(
    'UPDATE users SET refresh_token = $1 WHERE id = $2',
    [refreshToken, user.id]
  );

  res.status(201).json({
    message: 'User registered successfully',
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      emailVerified: user.email_verified,
      role: user.role,
      createdAt: user.created_at
    }
  });
}));

// ==================== LOGIN ====================
// POST /api/auth/login
// Authenticate user and return JWT tokens
router.post('/login', authLimiter, asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    throw new BadRequestError('Email and password are required');
  }

  // Find user by email
  const result = await pool.query(
    'SELECT id, email, password_hash, email_verified, role, is_active, created_at FROM users WHERE email = $1',
    [email.toLowerCase()]
  );

  if (result.rows.length === 0) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const user = result.rows[0];

  // Check if account is active
  if (user.is_active === false) {
    throw new ForbiddenError('Your account has been disabled. Please contact an administrator.');
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(password, user.password_hash);

  if (!isValidPassword) {
    throw new UnauthorizedError('Invalid email or password');
  }

  // Check if email is verified
  if (!user.email_verified) {
    const error = new ForbiddenError('Please verify your email address before logging in. Check your inbox for the verification link.');
    error.emailVerified = false;
    throw error;
  }

  // Generate JWT tokens
  const accessToken = generateAccessToken(user.id, user.role);
  const refreshToken = generateRefreshToken(user.id);

  // Store refresh token and update last login in database
  await pool.query(
    'UPDATE users SET refresh_token = $1, last_login = NOW() WHERE id = $2',
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
      role: user.role,
      createdAt: user.created_at
    }
  });
}));

// ==================== REFRESH TOKEN ====================
// POST /api/auth/refresh
// Exchange refresh token for new access token
router.post('/refresh', asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new BadRequestError('Refresh token is required');
  }

  // Verify refresh token
  let decoded;
  try {
    decoded = verifyToken(refreshToken);
  } catch (error) {
    throw new UnauthorizedError(error.message);
  }

  // Check token type
  if (decoded.type !== 'refresh') {
    throw new UnauthorizedError('Invalid token type');
  }

  // Verify refresh token exists in database
  const result = await pool.query(
    'SELECT id, email, email_verified, role, refresh_token FROM users WHERE id = $1',
    [decoded.userId]
  );

  if (result.rows.length === 0) {
    throw new UnauthorizedError('User not found');
  }

  const user = result.rows[0];

  // Check if refresh token matches the one in database
  if (user.refresh_token !== refreshToken) {
    throw new UnauthorizedError('Invalid refresh token');
  }

  // Generate new access token
  const accessToken = generateAccessToken(user.id, user.role);

  res.json({
    message: 'Token refreshed successfully',
    accessToken,
    user: {
      id: user.id,
      email: user.email,
      emailVerified: user.email_verified,
      role: user.role
    }
  });
}));

// ==================== LOGOUT ====================
// POST /api/auth/logout
// Invalidate refresh token
router.post('/logout', requireAuth, asyncHandler(async (req, res) => {
  // Clear refresh token from database
  await pool.query(
    'UPDATE users SET refresh_token = NULL WHERE id = $1',
    [req.user.id]
  );

  res.json({ message: 'Logout successful' });
}));

// ==================== VERIFY EMAIL ====================
// POST /api/auth/verify-email
// Verify user's email address using verification token
router.post('/verify-email', asyncHandler(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    throw new BadRequestError('Verification token is required');
  }

  // Find user with matching verification token
  const result = await pool.query(
    `SELECT id, email, verification_token_expires
     FROM users
     WHERE verification_token = $1 AND email_verified = false`,
    [token]
  );

  if (result.rows.length === 0) {
    throw new BadRequestError('Invalid or expired verification token');
  }

  const user = result.rows[0];

  // Check if token has expired
  if (new Date() > new Date(user.verification_token_expires)) {
    throw new BadRequestError('Verification token has expired. Please request a new one.');
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
}));

// ==================== RESEND VERIFICATION EMAIL ====================
// POST /api/auth/resend-verification
// Resend verification email to user
router.post('/resend-verification', emailVerificationLimiter, asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new BadRequestError('Email is required');
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
    throw new BadRequestError('Email is already verified');
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
}));

// ==================== FORGOT PASSWORD ====================
// POST /api/auth/forgot-password
// Generate password reset token and send email
router.post('/forgot-password', passwordResetLimiter, asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new BadRequestError('Email is required');
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
}));

// ==================== RESET PASSWORD ====================
// POST /api/auth/reset-password
// Reset password using reset token
router.post('/reset-password', asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  // Validation
  const validationErrors = [];

  if (!token) validationErrors.push('Token is required');
  if (!newPassword) validationErrors.push('New password is required');
  if (newPassword && newPassword.length < 6) {
    validationErrors.push('Password must be at least 6 characters');
  }

  if (validationErrors.length > 0) {
    throw new ValidationError('Validation failed', validationErrors);
  }

  // Find user with matching reset token
  const result = await pool.query(
    `SELECT id, email, password_reset_token_expires
     FROM users
     WHERE password_reset_token = $1`,
    [token]
  );

  if (result.rows.length === 0) {
    throw new BadRequestError('Invalid or expired reset token');
  }

  const user = result.rows[0];

  // Check if token has expired
  if (new Date() > new Date(user.password_reset_token_expires)) {
    throw new BadRequestError('Reset token has expired. Please request a new one.');
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
}));

export default router;
