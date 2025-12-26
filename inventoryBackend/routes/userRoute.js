import express from 'express';
import { pool } from '../database/database.js';
import bcrypt from 'bcrypt';
import { requireAdminAuth } from '../middleware/auth.js';
import { generatePasswordResetToken, calculateExpiry } from '../utils/jwt.js';
import { sendPasswordResetEmail } from '../services/emailService.js';
import { passwordResetExpiry } from '../config.js';

const router = express.Router();
const SALT_ROUNDS = 10;

// ==================== GET ALL USERS ====================
// GET /api/users
// Get all users (admin only)
router.get('/', requireAdminAuth, async (req, res) => {
  try {
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
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// ==================== UPDATE USER ROLE ====================
// PATCH /api/users/:id/role
// Update user's role (admin only)
router.patch('/:id/role', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !['admin', 'user'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be "admin" or "user"' });
    }

    // Prevent admin from demoting themselves
    if (parseInt(id) === req.user.id && role !== 'admin') {
      return res.status(400).json({ error: 'Cannot change your own role' });
    }

    const result = await pool.query(
      'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, email, role',
      [role, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'User role updated successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

// ==================== TOGGLE USER ACTIVE STATUS ====================
// PATCH /api/users/:id/status
// Enable/disable user account (admin only)
router.patch('/:id/status', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    if (typeof is_active !== 'boolean') {
      return res.status(400).json({ error: 'is_active must be a boolean' });
    }

    // Prevent admin from disabling themselves
    if (parseInt(id) === req.user.id && !is_active) {
      return res.status(400).json({ error: 'Cannot disable your own account' });
    }

    const result = await pool.query(
      'UPDATE users SET is_active = $1 WHERE id = $2 RETURNING id, email, is_active',
      [is_active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
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
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
});

// ==================== DELETE USER ====================
// DELETE /api/users/:id
// Delete user account (admin only)
router.delete('/:id', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING id, email',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'User deleted successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// ==================== ADMIN RESET USER PASSWORD ====================
// POST /api/users/:id/reset-password
// Admin can reset any user's password (sends reset email)
router.post('/:id/reset-password', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT id, email FROM users WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
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
  } catch (error) {
    console.error('Error sending password reset:', error);
    res.status(500).json({ error: 'Failed to send password reset email' });
  }
});

export default router;
