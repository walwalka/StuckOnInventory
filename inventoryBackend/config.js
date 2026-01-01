import process from 'node:process';
import * as dotenv from 'dotenv'

/**
 * Environment variable loading strategy:
 * - In Docker: Environment variables are injected via docker-compose.yml (DOCKER_ENV=true)
 * - Local development: Load from .env files (npm run dev, npm run local)
 *
 * This conditional approach prevents dotenv from attempting to load files in Docker
 * where they don't exist, eliminating unnecessary log messages.
 */
if (!process.env.DOCKER_ENV) {
  dotenv.config({ path: `.env.${process.env.NODE_ENV}` });
  dotenv.config(); // Load default .env as fallback
}

export const PORT = process.env.APP_PORT;
export const sqlIp = process.env.SQL_SERVER_IP;
export const sqlPort = process.env.SQL_SERVER_PORT;
export const sqlUser = process.env.SQL_USER;
export const sqlDb = process.env.SQL_DB;
export const sqlPass = process.env.SQL_PASS;

// JWT Configuration
export const jwtSecret = process.env.JWT_SECRET;
export const jwtAccessExpiry = process.env.JWT_ACCESS_EXPIRY || '15m';
export const jwtRefreshExpiry = process.env.JWT_REFRESH_EXPIRY || '7d';

// Email Configuration
export const smtpHost = process.env.SMTP_HOST;
export const smtpPort = process.env.SMTP_PORT;
export const smtpSecure = process.env.SMTP_SECURE === 'true';
export const smtpUser = process.env.SMTP_USER;
export const smtpPass = process.env.SMTP_PASS;
export const smtpFrom = process.env.SMTP_FROM;
export const frontendUrl = process.env.FRONTEND_URL;

// Token Expiry
export const emailVerificationExpiry = process.env.EMAIL_VERIFICATION_EXPIRY || '24h';
export const passwordResetExpiry = process.env.PASSWORD_RESET_EXPIRY || '1h';