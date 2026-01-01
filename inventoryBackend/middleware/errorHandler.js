/**
 * Centralized Error Handling Middleware
 * Provides structured error types and consistent error responses across the application
 */

/**
 * Base class for all custom application errors
 * Extends the built-in Error class with HTTP status code support
 */
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // Indicates this is a known/expected error
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 400 Bad Request - Client sent invalid data
 * Use for validation errors, malformed requests, etc.
 */
class BadRequestError extends AppError {
  constructor(message = 'Bad request') {
    super(message, 400);
  }
}

/**
 * 401 Unauthorized - Authentication required or failed
 * Use when user is not authenticated or token is invalid
 */
class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

/**
 * 403 Forbidden - User lacks permission
 * Use when user is authenticated but doesn't have access rights
 */
class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

/**
 * 404 Not Found - Resource doesn't exist
 * Use when requested resource cannot be found
 */
class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

/**
 * 409 Conflict - Request conflicts with current state
 * Use for duplicate entries, concurrent modifications, etc.
 */
class ConflictError extends AppError {
  constructor(message = 'Conflict') {
    super(message, 409);
  }
}

/**
 * 422 Unprocessable Entity - Validation failed
 * Use for semantic validation errors (valid format but invalid content)
 */
class ValidationError extends AppError {
  constructor(message = 'Validation failed', errors = []) {
    super(message, 422);
    this.errors = errors; // Array of specific validation errors
  }
}

/**
 * 429 Too Many Requests - Rate limit exceeded
 * Use when user exceeds rate limiting thresholds
 */
class TooManyRequestsError extends AppError {
  constructor(message = 'Too many requests') {
    super(message, 429);
  }
}

/**
 * 500 Internal Server Error - Unexpected server error
 * Use for database errors, external API failures, etc.
 */
class InternalServerError extends AppError {
  constructor(message = 'Internal server error') {
    super(message, 500);
  }
}

/**
 * 503 Service Unavailable - Service temporarily unavailable
 * Use when external dependencies are down (database, APIs, etc.)
 */
class ServiceUnavailableError extends AppError {
  constructor(message = 'Service unavailable') {
    super(message, 503);
  }
}

/**
 * Async handler wrapper to eliminate try-catch blocks in route handlers
 * Automatically catches errors and passes them to the error handling middleware
 *
 * @param {Function} fn - Async route handler function
 * @returns {Function} - Express middleware function
 *
 * @example
 * router.get('/users/:id', asyncHandler(async (req, res) => {
 *   const user = await getUserById(req.params.id);
 *   if (!user) throw new NotFoundError('User not found');
 *   res.json(user);
 * }));
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Structured error logger
 * Logs errors with consistent format including timestamp, request info, and stack trace
 */
const logError = (err, req) => {
  const timestamp = new Date().toISOString();
  const method = req?.method || 'UNKNOWN';
  const url = req?.originalUrl || req?.url || 'UNKNOWN';
  const userId = req?.user?.id || 'anonymous';

  console.error('\n' + '='.repeat(80));
  console.error(`[ERROR] ${timestamp}`);
  console.error(`Request: ${method} ${url}`);
  console.error(`User: ${userId}`);
  console.error(`Status: ${err.statusCode || 500}`);
  console.error(`Message: ${err.message}`);

  // Only log stack trace for unexpected errors (non-operational)
  if (!err.isOperational) {
    console.error('Stack trace:');
    console.error(err.stack);
  }

  console.error('='.repeat(80) + '\n');
};

/**
 * Global error handling middleware
 * Catches all errors and sends appropriate JSON responses
 * Should be registered LAST in the middleware chain
 *
 * @example
 * // In index.js:
 * app.use(errorHandler);
 */
export const errorHandler = (err, req, res, next) => {
  // Log the error
  logError(err, req);

  // Default to 500 Internal Server Error if no status code is set
  const statusCode = err.statusCode || 500;

  // Build error response object
  const errorResponse = {
    error: err.message || 'An unexpected error occurred',
    status: statusCode
  };

  // Add validation errors if present (for ValidationError)
  if (err.errors && Array.isArray(err.errors) && err.errors.length > 0) {
    errorResponse.validationErrors = err.errors;
  }

  // Include stack trace in development mode for debugging
  if (process.env.NODE_ENV === 'development' && err.stack) {
    errorResponse.stack = err.stack;
  }

  // Send JSON error response
  res.status(statusCode).json(errorResponse);
};

/**
 * 404 Not Found handler for undefined routes
 * Should be registered AFTER all route handlers but BEFORE errorHandler
 *
 * @example
 * // In index.js:
 * app.use(notFoundHandler);
 * app.use(errorHandler);
 */
export const notFoundHandler = (req, res, next) => {
  const error = new NotFoundError(`Route not found: ${req.method} ${req.originalUrl}`);
  next(error);
};

// Export error classes
export {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
  TooManyRequestsError,
  InternalServerError,
  ServiceUnavailableError
};
