import express from 'express';
import { pool } from '../database/database.js';
import bcrypt from 'bcrypt';
import { requireAdminAuth, requireAuth } from '../middleware/auth.js';
import { generatePasswordResetToken, calculateExpiry } from '../utils/jwt.js';
import { sendPasswordResetEmail } from '../services/emailService.js';
import { passwordResetExpiry } from '../config.js';
import {
  asyncHandler,
  BadRequestError,
  NotFoundError
} from '../middleware/errorHandler.js';

const router = express.Router();
const SALT_ROUNDS = 10;

// ==================== GET USER BY EMAIL ====================
// GET /api/users/by-email/:email
// Look up user ID by email (authenticated users only)
router.get('/by-email/:email', requireAuth, asyncHandler(async (req, res) => {
  const { email } = req.params;

  const result = await pool.query(
    'SELECT id, email FROM users WHERE LOWER(email) = LOWER($1) AND is_active = true',
    [email]
  );

  if (result.rows.length === 0) {
    throw new NotFoundError('User not found or inactive');
  }

  res.json(result.rows[0]);
}));

// ==================== GET ALL USERS ====================
// GET /api/users
// Get all users (admin only)
router.get('/', requireAdminAuth, asyncHandler(async (req, res) => {
  const result = await pool.query(`
    SELECT
      id,
      email,
      role,
      email_verified,
      is_active,
      created_at,
      last_login
    FROM users
    ORDER BY created_at DESC
  `);

  res.json({ users: result.rows });
}));

// ==================== UPDATE USER ROLE ====================
// PATCH /api/users/:id/role
// Update user's role (admin only)
router.patch('/:id/role', requireAdminAuth, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!role || !['admin', 'user'].includes(role)) {
    throw new BadRequestError('Invalid role. Must be "admin" or "user"');
  }

  // Prevent admin from demoting themselves
  if (parseInt(id) === req.user.id && role !== 'admin') {
    throw new BadRequestError('Cannot change your own role');
  }

  const result = await pool.query(
    'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, email, role',
    [role, id]
  );

  if (result.rows.length === 0) {
    throw new NotFoundError('User not found');
  }

  res.json({
    message: 'User role updated successfully',
    user: result.rows[0]
  });
}));

// ==================== TOGGLE USER ACTIVE STATUS ====================
// PATCH /api/users/:id/status
// Enable/disable user account (admin only)
router.patch('/:id/status', requireAdminAuth, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { is_active } = req.body;

  if (typeof is_active !== 'boolean') {
    throw new BadRequestError('is_active must be a boolean');
  }

  // Prevent admin from disabling themselves
  if (parseInt(id) === req.user.id && !is_active) {
    throw new BadRequestError('Cannot disable your own account');
  }

  const result = await pool.query(
    'UPDATE users SET is_active = $1 WHERE id = $2 RETURNING id, email, is_active',
    [is_active, id]
  );

  if (result.rows.length === 0) {
    throw new NotFoundError('User not found');
  }

  // Invalidate user's refresh token when disabled
  if (!is_active) {
    await pool.query(
      'UPDATE users SET refresh_token = NULL WHERE id = $1',
      [id]
    );
  }

  res.json({
    message: `User ${is_active ? 'enabled' : 'disabled'} successfully`,
    user: result.rows[0]
  });
}));

// ==================== DELETE USER ====================
// DELETE /api/users/:id
// Delete user account (admin only)
router.delete('/:id', requireAdminAuth, asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Prevent admin from deleting themselves
  if (parseInt(id) === req.user.id) {
    throw new BadRequestError('Cannot delete your own account');
  }

  const result = await pool.query(
    'DELETE FROM users WHERE id = $1 RETURNING id, email',
    [id]
  );

  if (result.rows.length === 0) {
    throw new NotFoundError('User not found');
  }

  res.json({
    message: 'User deleted successfully',
    user: result.rows[0]
  });
}));

// ==================== ADMIN RESET USER PASSWORD ====================
// POST /api/users/:id/reset-password
// Admin can reset any user's password (sends reset email)
router.post('/:id/reset-password', requireAdminAuth, asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await pool.query(
    'SELECT id, email FROM users WHERE id = $1',
    [id]
  );

  if (result.rows.length === 0) {
    throw new NotFoundError('User not found');
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
    message: 'Password reset email sent successfully',
    email: user.email
  });
}));

export default router;
