import nodemailer from 'nodemailer';
import { smtpHost, smtpPort, smtpSecure, smtpUser, smtpPass, smtpFrom, frontendUrl } from '../config.js';

// Create reusable transporter
let transporter = null;

/**
 * Initialize the email transporter
 * @returns {Object} - Nodemailer transporter
 */
function getTransporter() {
  if (transporter) {
    return transporter;
  }

  if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) {
    console.warn('SMTP configuration not complete. Email functionality will be disabled.');
    return null;
  }

  transporter = nodemailer.createTransport({
    host: smtpHost,
    port: parseInt(smtpPort),
    secure: smtpSecure, // true for 465, false for other ports
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  return transporter;
}

/**
 * Send verification email with token
 * @param {string} email - Recipient email address
 * @param {string} token - Verification token
 * @returns {Promise} - Resolves when email is sent
 */
export async function sendVerificationEmail(email, token) {
  const transport = getTransporter();

  if (!transport) {
    console.error('Email service not configured. Skipping verification email.');
    // In development, log the verification link instead
    console.log(`\n=== EMAIL VERIFICATION LINK ===`);
    console.log(`${frontendUrl}/verify-email?token=${token}`);
    console.log(`================================\n`);
    return;
  }

  const verificationUrl = `${frontendUrl}/verify-email?token=${token}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
        .content { background-color: #f9f9f9; padding: 30px; border-radius: 5px; }
        .button { display: inline-block; padding: 12px 30px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Verify Your Email</h1>
        </div>
        <div class="content">
          <h2>Welcome to StuckOnInventory!</h2>
          <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
          <p style="text-align: center;">
            <a href="${verificationUrl}" class="button">Verify Email Address</a>
          </p>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
          <p><strong>This link will expire in 24 hours.</strong></p>
          <p>If you didn't create an account, you can safely ignore this email.</p>
        </div>
        <div class="footer">
          <p>&copy; 2025 StuckOnInventory. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
    Welcome to StuckOnInventory!

    Thank you for registering. Please verify your email address by clicking the link below:

    ${verificationUrl}

    This link will expire in 24 hours.

    If you didn't create an account, you can safely ignore this email.
  `;

  try {
    await transport.sendMail({
      from: smtpFrom,
      to: email,
      subject: 'Verify Your Email - StuckOnInventory',
      text: textContent,
      html: htmlContent,
    });
    console.log(`Verification email sent to ${email}`);
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
}

/**
 * Send password reset email with token
 * @param {string} email - Recipient email address
 * @param {string} token - Password reset token
 * @returns {Promise} - Resolves when email is sent
 */
export async function sendPasswordResetEmail(email, token) {
  const transport = getTransporter();

  if (!transport) {
    console.error('Email service not configured. Skipping password reset email.');
    // In development, log the reset link instead
    console.log(`\n=== PASSWORD RESET LINK ===`);
    console.log(`${frontendUrl}/reset-password?token=${token}`);
    console.log(`===========================\n`);
    return;
  }

  const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #ff9800; color: white; padding: 20px; text-align: center; }
        .content { background-color: #f9f9f9; padding: 30px; border-radius: 5px; }
        .button { display: inline-block; padding: 12px 30px; background-color: #ff9800; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        .warning { background-color: #fff3cd; border-left: 4px solid #ff9800; padding: 12px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Reset Your Password</h1>
        </div>
        <div class="content">
          <h2>Password Reset Request</h2>
          <p>We received a request to reset your password for your StuckOnInventory account.</p>
          <p style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset Password</a>
          </p>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${resetUrl}</p>
          <p><strong>This link will expire in 1 hour.</strong></p>
          <div class="warning">
            <strong>Security Notice:</strong> If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
          </div>
        </div>
        <div class="footer">
          <p>&copy; 2025 StuckOnInventory. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
    Password Reset Request

    We received a request to reset your password for your StuckOnInventory account.

    Please click the link below to reset your password:

    ${resetUrl}

    This link will expire in 1 hour.

    If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
  `;

  try {
    await transport.sendMail({
      from: smtpFrom,
      to: email,
      subject: 'Reset Your Password - StuckOnInventory',
      text: textContent,
      html: htmlContent,
    });
    console.log(`Password reset email sent to ${email}`);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
}
