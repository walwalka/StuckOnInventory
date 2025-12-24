import passport from 'passport';

/**
 * Middleware to authenticate using Passport JWT strategy
 * Validates JWT token and attaches user to req.user
 */
export const authenticateJWT = passport.authenticate('jwt', { session: false });

/**
 * Middleware to require authentication
 * Returns 401 if user is not authenticated
 */
export function requireAuth(req, res, next) {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
      console.error('Authentication error:', err);
      return res.status(500).json({ message: 'Authentication error' });
    }

    if (!user) {
      return res.status(401).json({
        message: 'Unauthorized',
        error: info?.message || 'Invalid or missing token'
      });
    }

    // Attach user to request
    req.user = user;
    next();
  })(req, res, next);
}

/**
 * Middleware to require verified email
 * Returns 403 if email is not verified
 * Should be used after requireAuth middleware
 */
export function requireVerifiedEmail(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (!req.user.email_verified) {
    return res.status(403).json({
      message: 'Email not verified',
      error: 'Please verify your email address to access this resource'
    });
  }

  next();
}

/**
 * Combined middleware: require authentication and verified email
 * Convenience wrapper for the common case
 */
export function requireVerifiedAuth(req, res, next) {
  requireAuth(req, res, (err) => {
    if (err) return next(err);
    requireVerifiedEmail(req, res, next);
  });
}

/**
 * Middleware to require admin role
 * Returns 403 if user is not an admin
 * Should be used after requireAuth middleware
 */
export function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      message: 'Forbidden',
      error: 'Admin access required'
    });
  }

  next();
}

/**
 * Combined middleware: require authentication, verified email, and admin role
 */
export function requireAdminAuth(req, res, next) {
  requireAuth(req, res, (err) => {
    if (err) return next(err);
    requireVerifiedEmail(req, res, (err) => {
      if (err) return next(err);
      requireAdmin(req, res, next);
    });
  });
}
