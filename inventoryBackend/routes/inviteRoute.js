import express from 'express';
import crypto from 'crypto';
import { pool } from '../database/database.js';
import { requireAdminAuth } from '../middleware/auth.js';
import { sendInviteEmail } from '../services/emailService.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import {
  asyncHandler,
  BadRequestError,
  NotFoundError,
  ConflictError
} from '../middleware/errorHandler.js';

const router = express.Router();

/**
 * POST /api/invites
 * Create a new invitation (admin only)
 */
router.post('/', requireAdminAuth, asyncHandler(async (req, res) => {
  const { email } = req.body;

  // Validate email
  if (!email || !email.includes('@')) {
    throw new BadRequestError('Valid email is required');
  }

  // Check if user already exists
  const existingUser = await pool.query(
    'SELECT id FROM users WHERE email = $1',
    [email.toLowerCase()]
  );

  if (existingUser.rows.length > 0) {
    throw new ConflictError('User with this email already exists');
  }

  // Check if there's already a pending invite for this email
  const existingInvite = await pool.query(
    'SELECT id FROM invites WHERE email = $1 AND used_at IS NULL AND expires_at > NOW()',
    [email.toLowerCase()]
  );

  if (existingInvite.rows.length > 0) {
    throw new ConflictError('An active invitation already exists for this email');
  }

  // Generate invite token
  const token = crypto.randomBytes(32).toString('hex');

  // Set expiration to 7 days from now
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  // Insert invite into database
  const result = await pool.query(
    `INSERT INTO invites (email, token, created_by, expires_at)
     VALUES ($1, $2, $3, $4)
     RETURNING id, email, token, created_at, expires_at`,
    [email.toLowerCase(), token, req.user.id, expiresAt]
  );

  const invite = result.rows[0];

  // Send invite email asynchronously
  sendInviteEmail(email, token, req.user.email).catch(err => {
    console.error('Failed to send invite email:', err);
  });

  res.status(201).json({
    message: 'Invitation created successfully',
    invite: {
      id: invite.id,
      email: invite.email,
      created_at: invite.created_at,
      expires_at: invite.expires_at
    }
  });
}));

/**
 * GET /api/invites
 * List all invitations (admin only)
 */
router.get('/', requireAdminAuth, asyncHandler(async (req, res) => {
  const result = await pool.query(
    `SELECT
      i.id,
      i.email,
      i.created_at,
      i.expires_at,
      i.used_at,
      creator.email as created_by_email,
      user_created.email as used_by_email
     FROM invites i
     LEFT JOIN users creator ON i.created_by = creator.id
     LEFT JOIN users user_created ON i.used_by = user_created.id
     ORDER BY i.created_at DESC`
  );

  const invites = result.rows.map(invite => ({
    id: invite.id,
    email: invite.email,
    created_at: invite.created_at,
    expires_at: invite.expires_at,
    used_at: invite.used_at,
    created_by: invite.created_by_email,
    used_by: invite.used_by_email,
    status: invite.used_at
      ? 'used'
      : new Date(invite.expires_at) < new Date()
        ? 'expired'
        : 'pending'
  }));

  res.json({ invites });
}));

/**
 * DELETE /api/invites/:id
 * Revoke an invitation (admin only)
 */
router.delete('/:id', requireAdminAuth, asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check if invite exists and is not used
  const invite = await pool.query(
    'SELECT id, used_at FROM invites WHERE id = $1',
    [id]
  );

  if (invite.rows.length === 0) {
    throw new NotFoundError('Invitation not found');
  }

  if (invite.rows[0].used_at) {
    throw new BadRequestError('Cannot revoke an invitation that has already been used');
  }

  // Delete the invitation
  await pool.query('DELETE FROM invites WHERE id = $1', [id]);

  res.json({ message: 'Invitation revoked successfully' });
}));

/**
 * GET /api/invites/verify/:token
 * Verify an invite token (public endpoint, used during registration)
 */
router.get('/verify/:token', authLimiter, asyncHandler(async (req, res) => {
  const { token } = req.params;

  const result = await pool.query(
    'SELECT email, expires_at, used_at FROM invites WHERE token = $1',
    [token]
  );

  if (result.rows.length === 0) {
    throw new NotFoundError('Invalid invitation token');
  }

  const invite = result.rows[0];

  if (invite.used_at) {
    throw new BadRequestError('This invitation has already been used');
  }

  if (new Date(invite.expires_at) < new Date()) {
    throw new BadRequestError('This invitation has expired');
  }

  res.json({
    valid: true,
    email: invite.email
  });
}));

export default router;
