# Centralized Error Handling Guide

This guide demonstrates how to use the new centralized error handling system to eliminate try-catch blocks and create consistent error responses.

## Table of Contents
- [Overview](#overview)
- [Available Error Classes](#available-error-classes)
- [Using asyncHandler](#using-asynchandler)
- [Migration Examples](#migration-examples)
- [Best Practices](#best-practices)

## Overview

The error handling system provides:
- **Custom error classes** for different HTTP status codes
- **asyncHandler** wrapper to eliminate try-catch blocks
- **Structured logging** with consistent format
- **Automatic error responses** with proper status codes

## Available Error Classes

Import from `middleware/errorHandler.js`:

```javascript
import {
  BadRequestError,      // 400 - Invalid input
  UnauthorizedError,    // 401 - Authentication required
  ForbiddenError,       // 403 - Insufficient permissions
  NotFoundError,        // 404 - Resource not found
  ConflictError,        // 409 - Duplicate/conflict
  ValidationError,      // 422 - Validation failed
  InternalServerError,  // 500 - Server error
  asyncHandler          // Wrapper to eliminate try-catch
} from '../middleware/errorHandler.js';
```

## Using asyncHandler

The `asyncHandler` wrapper automatically catches errors and passes them to the error middleware:

### Before (with try-catch):
```javascript
router.get('/coins/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM coins WHERE id = $1', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Coin not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching coin:', error);
    res.status(500).json({ error: 'Failed to fetch coin' });
  }
});
```

### After (with asyncHandler):
```javascript
router.get('/coins/:id', asyncHandler(async (req, res) => {
  const result = await pool.query('SELECT * FROM coins WHERE id = $1', [req.params.id]);

  if (result.rows.length === 0) {
    throw new NotFoundError('Coin not found');
  }

  res.json(result.rows[0]);
}));
```

**Benefits:**
- No try-catch needed
- Database errors automatically caught and logged
- Consistent error responses
- Cleaner, more readable code

## Migration Examples

### Example 1: Simple GET endpoint

**Before:**
```javascript
router.get('/coins', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM coins ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching coins:', error);
    res.status(500).json({ error: 'Failed to fetch coins' });
  }
});
```

**After:**
```javascript
router.get('/coins', asyncHandler(async (req, res) => {
  const result = await pool.query('SELECT * FROM coins ORDER BY created_at DESC');
  res.json(result.rows);
}));
```

### Example 2: POST with validation

**Before:**
```javascript
router.post('/coins', async (req, res) => {
  const { type, mintlocation, mintyear } = req.body;

  if (!type || !mintlocation || !mintyear) {
    return res.status(400).send('Missing required fields');
  }

  try {
    const result = await pool.query(
      'INSERT INTO coins (type, mintlocation, mintyear) VALUES ($1, $2, $3) RETURNING *',
      [type, mintlocation, mintyear]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating coin:', error);

    if (error.code === '23505') { // Duplicate key
      return res.status(409).json({ error: 'Coin already exists' });
    }

    res.status(500).json({ error: 'Failed to create coin' });
  }
});
```

**After:**
```javascript
router.post('/coins', asyncHandler(async (req, res) => {
  const { type, mintlocation, mintyear } = req.body;

  // Validation
  if (!type || !mintlocation || !mintyear) {
    throw new BadRequestError('Missing required fields: type, mintlocation, mintyear');
  }

  try {
    const result = await pool.query(
      'INSERT INTO coins (type, mintlocation, mintyear) VALUES ($1, $2, $3) RETURNING *',
      [type, mintlocation, mintyear]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    // Handle specific database errors
    if (error.code === '23505') {
      throw new ConflictError('A coin with these details already exists');
    }
    // All other errors will be caught by asyncHandler
    throw error;
  }
}));
```

### Example 3: DELETE endpoint

**Before:**
```javascript
router.delete('/coins/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM coins WHERE id = $1 RETURNING id', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Coin not found' });
    }

    res.json({ message: 'Coin deleted successfully' });
  } catch (error) {
    console.error('Error deleting coin:', error);
    res.status(500).json({ error: 'Failed to delete coin' });
  }
});
```

**After:**
```javascript
router.delete('/coins/:id', asyncHandler(async (req, res) => {
  const result = await pool.query('DELETE FROM coins WHERE id = $1 RETURNING id', [req.params.id]);

  if (result.rows.length === 0) {
    throw new NotFoundError('Coin not found');
  }

  res.json({ message: 'Coin deleted successfully' });
}));
```

### Example 4: Complex validation with multiple errors

**Before:**
```javascript
router.post('/users', async (req, res) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email) errors.push('Email is required');
  if (!password) errors.push('Password is required');
  if (password && password.length < 6) errors.push('Password must be at least 6 characters');

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    // Create user...
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});
```

**After:**
```javascript
router.post('/users', asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email) errors.push('Email is required');
  if (!password) errors.push('Password is required');
  if (password && password.length < 6) errors.push('Password must be at least 6 characters');

  if (errors.length > 0) {
    throw new ValidationError('Validation failed', errors);
  }

  // Create user...
}));
```

## Best Practices

### 1. Choose the Right Error Class

- **BadRequestError** - Invalid input format, malformed data
- **UnauthorizedError** - Missing/invalid auth token
- **ForbiddenError** - Valid auth but insufficient permissions
- **NotFoundError** - Resource doesn't exist
- **ConflictError** - Duplicate entries, concurrent modifications
- **ValidationError** - Semantic validation failures (with detailed errors array)

### 2. Provide Descriptive Error Messages

❌ Bad:
```javascript
throw new NotFoundError('Not found');
```

✅ Good:
```javascript
throw new NotFoundError(`Coin with ID ${coinId} not found`);
```

### 3. Handle Database-Specific Errors

For PostgreSQL error codes:
```javascript
try {
  await pool.query('INSERT INTO ...');
} catch (error) {
  if (error.code === '23505') {
    throw new ConflictError('Resource already exists');
  }
  if (error.code === '23503') {
    throw new BadRequestError('Referenced resource does not exist');
  }
  throw error; // Let asyncHandler catch other errors
}
```

### 4. Validation Errors with Details

```javascript
const validationErrors = [];

if (!email) validationErrors.push('Email is required');
if (email && !emailRegex.test(email)) validationErrors.push('Invalid email format');
if (!password) validationErrors.push('Password is required');
if (password && password.length < 6) validationErrors.push('Password must be at least 6 characters');

if (validationErrors.length > 0) {
  throw new ValidationError('Validation failed', validationErrors);
}
```

Response will be:
```json
{
  "error": "Validation failed",
  "status": 422,
  "validationErrors": [
    "Email is required",
    "Password must be at least 6 characters"
  ]
}
```

### 5. Don't Catch Errors You Can't Handle

Let asyncHandler catch unexpected errors:

❌ Bad:
```javascript
try {
  const data = await someAsyncOperation();
  // ... use data
} catch (error) {
  console.error(error);
  throw new InternalServerError('Something went wrong');
}
```

✅ Good:
```javascript
const data = await someAsyncOperation();
// ... use data
// asyncHandler will catch any errors automatically
```

### 6. Use asyncHandler for ALL Async Routes

Even simple routes should use asyncHandler:

```javascript
// Database query could fail
router.get('/health', asyncHandler(async (req, res) => {
  const result = await pool.query('SELECT 1');
  res.json({ status: 'healthy' });
}));
```

## Error Response Format

All errors return JSON in this format:

```json
{
  "error": "Error message",
  "status": 404
}
```

ValidationError adds validationErrors:
```json
{
  "error": "Validation failed",
  "status": 422,
  "validationErrors": ["Email is required", "Password too short"]
}
```

In development mode, stack traces are included:
```json
{
  "error": "Database query failed",
  "status": 500,
  "stack": "Error: Database query failed\n    at ..."
}
```

## Logging

All errors are automatically logged with:
- Timestamp
- Request method and URL
- User ID (if authenticated)
- HTTP status code
- Error message
- Stack trace (for unexpected errors only)

Example log output:
```
================================================================================
[ERROR] 2024-01-15T10:30:45.123Z
Request: GET /api/coins/999
User: 123
Status: 404
Message: Coin with ID 999 not found
================================================================================
```
