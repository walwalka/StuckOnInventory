import rateLimit from 'express-rate-limit';

/**
 * Strict rate limiter for authentication endpoints
 * Limits: 5 requests per 15 minutes per IP
 * Protects against brute force attacks on login/register
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    message: 'Too many authentication attempts',
    error: 'Please try again after 15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Skip successful requests from counting against the limit
  skipSuccessfulRequests: false,
  // Skip rate limiting in test environment
  skip: (req) => process.env.NODE_ENV === 'test',
});

/**
 * General rate limiter for all other endpoints
 * Limits: 100 requests per 15 minutes per IP
 * Prevents API abuse while allowing normal usage
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    message: 'Too many requests',
    error: 'Please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'test',
});

/**
 * Moderate rate limiter for password reset endpoints
 * Limits: 3 requests per hour per IP
 * Prevents abuse of password reset functionality
 */
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 requests per hour
  message: {
    message: 'Too many password reset attempts',
    error: 'Please try again after 1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'test',
});

/**
 * Moderate rate limiter for email verification resend
 * Limits: 3 requests per hour per IP
 * Prevents spam of verification emails
 */
export const emailVerificationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 requests per hour
  message: {
    message: 'Too many verification email requests',
    error: 'Please try again after 1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'test',
});
