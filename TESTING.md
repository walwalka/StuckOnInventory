# Testing Guide

This project includes comprehensive unit tests for both backend and frontend, with a focus on the authentication/login flow.

## Quick Start

### Running Tests with Docker

Since the backend tests require a PostgreSQL database connection, they run in a Docker container with database access:

```bash
# Start the database and run tests
docker compose --profile test up --abort-on-container-exit backend-test

# Or run in the background and check results
docker compose --profile test run --rm backend-test
```

The `backend-test` service:
- Uses the `test` profile (won't start with normal `docker compose up`)
- Waits for the database to be healthy before running tests
- Runs all 31 backend tests
- Exits when tests complete (success or failure)

### CI/CD Integration

For continuous integration pipelines, use this command to fail the build if tests fail:

```bash
# Run tests and return exit code (0 = pass, 1 = fail)
docker compose --profile test up --abort-on-container-exit --exit-code-from backend-test backend-test
```

This ensures broken code can't be deployed.

## Running Tests Locally

### Backend Tests

```bash
cd inventoryBackend

# Install dependencies (first time only)
npm install

# Run all tests (requires database connection)
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

**Note**: Local tests require a PostgreSQL database running. Set environment variables in `.env` or use the Docker database:
```bash
docker compose up -d db
npm test
```

### Frontend Tests

```bash
cd inventoryFrontend

# Install dependencies (first time only)
npm install

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## What's Been Tested

### Backend (31 Tests - All Passing)

**Login Endpoint** (`/api/auth/login`)
- Successful login with valid credentials
- Returns accessToken and refreshToken
- Returns user object with correct data
- Updates last_login timestamp in database
- Stores refresh_token in database
- Includes user role in response
- Returns 400 if email is missing
- Returns 400 if password is missing
- Returns 401 if user not found
- Returns 401 if password is incorrect
- Returns 403 if account is disabled
- Returns 403 if email is not verified
- Handles case-insensitive email lookup

**Token Refresh Endpoint** (`/api/auth/refresh`)
- Refreshes access token with valid refresh token
- Returns new accessToken
- Does not change refreshToken
- Returns 400 if refreshToken is missing
- Returns 401 if refreshToken is invalid
- Returns 401 if refreshToken not in database

**Authentication Middleware**
- requireAuth - allows access with valid JWT
- requireAuth - attaches user to req.user
- requireAuth - returns 401 without token
- requireAuth - returns 401 with invalid token
- requireVerifiedEmail - allows if verified
- requireVerifiedEmail - returns 403 if not verified
- requireAdmin - allows access if admin
- requireAdmin - returns 403 if not admin
- requireVerifiedAuth - combined middleware works correctly
- requireAdminAuth - combined admin middleware works correctly

### Frontend Tests (To Be Written)

Infrastructure is in place for testing:
- Login component
- Token utilities (decoding, expiration checking, storage)
- API client interceptors (automatic token refresh)
- useToken hook
- RequireAuth protected route component

## Test Structure

### Backend

```
inventoryBackend/
├── jest.config.cjs             # Jest configuration (CommonJS for ESM project)
├── babel.config.cjs            # Babel config for transforming ESM
├── tests/
│   ├── setup.js                # Global test setup
│   ├── utils/
│   │   └── dbHelper.js         # Database helpers for tests
│   ├── routes/
│   │   └── authRoute.test.js   # Login/auth endpoint tests (16 tests)
│   └── middleware/
│       └── auth.test.js        # Middleware tests (15 tests)
```

### Frontend

```
inventoryFrontend/
├── jest.config.js              # Jest configuration
├── babel.config.test.js        # Babel config for tests
├── src/
│   └── tests/
│       ├── setup.js            # Global test setup (localStorage mocks, etc.)
│       ├── utils/
│       │   └── testUtils.js    # Test helpers
│       └── __mocks__/
│           └── fileMock.js     # Mock for static assets
```

## ESM Testing Configuration

The backend uses ES modules (`"type": "module"` in package.json), which requires special Jest configuration:

1. **jest.config.cjs** - CommonJS config file (required for ESM projects)
2. **NODE_OPTIONS=--experimental-vm-modules** - Enables ESM support in Jest
3. **Module name mapper** - Strips `.js` extensions from imports for compatibility

All test files use `import { jest } from '@jest/globals'` to access Jest globals in ESM mode.

## Writing New Tests

### Backend Test Example

```javascript
import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import { createTestUser, cleanupTestDB } from '../utils/dbHelper.js';

describe('My API Endpoint', () => {
  beforeAll(async () => {
    await cleanupTestDB();
  });

  afterAll(async () => {
    await cleanupTestDB();
    await pool.end();
  });

  test('should do something', async () => {
    // Arrange: Set up test data
    const user = await createTestUser({
      email: 'test@test.com',
      password: 'password123',
      emailVerified: true
    });

    // Act: Make request
    const response = await request(app)
      .post('/api/endpoint')
      .send({ data: 'value' });

    // Assert: Check response
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success');
  });
});
```

### Frontend Test Example

```javascript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '../tests/utils/testUtils';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  test('should render correctly', () => {
    renderWithRouter(<MyComponent />);

    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

## Continuous Integration

### Docker Compose Test Service

The `docker-compose.yml` includes a `backend-test` service that:

1. Builds from the `base` stage (includes all code and dependencies)
2. Waits for the database to be healthy
3. Sets `NODE_ENV=test` and test-specific environment variables
4. Runs `npm test` command
5. Exits with the test exit code (0 = pass, 1 = fail)

This allows CI/CD pipelines to:
- Run tests in an isolated environment
- Ensure database connectivity
- Fail builds on test failures
- Run tests before deploying

### GitHub Actions Example

```yaml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Create .env file
        run: |
          echo "SQL_USER=postgres" >> .env
          echo "SQL_PASS=testpass" >> .env
          echo "SQL_DB=testdb" >> .env

      - name: Run Backend Tests
        run: |
          docker compose --profile test up --abort-on-container-exit --exit-code-from backend-test backend-test
```

## Troubleshooting

**Tests fail with database connection errors**
- Make sure the database service is running: `docker compose up -d db`
- Check database health: `docker compose ps db`
- Verify environment variables match `.env` settings

**"Cannot use import statement outside a module" errors**
- Make sure `jest.config.cjs` is used (not .js)
- Check that `NODE_OPTIONS=--experimental-vm-modules` is set in test script
- All test files should import jest: `import { jest } from '@jest/globals'`

**"jest is not defined" errors in ESM mode**
- Import jest explicitly: `import { jest } from '@jest/globals'`
- Don't use `jest.mock()` in setup files (move to individual test files)

**"Cannot find module" errors**
- Make sure you've run `npm install` in the respective directory
- Check that import paths include `.js` extension for local modules
- Verify the module name mapper in jest.config is correct

**Frontend tests can't find components**
- Make sure you're using `renderWithRouter()` for components that use React Router
- Check that mocks are set up correctly in `tests/setup.js`

**Docker build is slow**
- Use `--no-cache` flag only when needed
- Consider using local `npm test` for faster iteration during development

## Coverage Goals

Target test coverage:
- **Backend**: 85%+ coverage for routes, middleware, and utils
- **Frontend**: 80%+ coverage for components and utilities

Run coverage reports to see what's missing:
```bash
npm run test:coverage
```

Coverage reports are generated in the `coverage/` directory.

## Next Steps

1. Write frontend component tests (Login, useToken hook, etc.)
2. Add integration tests for full login flow
3. Set up automated test runs in CI/CD
4. Increase coverage for edge cases
