import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';

/**
 * Render a component with React Router context
 * @param {React.ReactElement} component - Component to render
 * @param {Object} options - Additional options
 * @returns {Object} Render result from @testing-library/react
 */
export function renderWithRouter(component, options = {}) {
  const { initialEntries = ['/'], ...renderOptions } = options;

  const Wrapper = ({ children }) => (
    <BrowserRouter>
      <SnackbarProvider maxSnack={3}>
        {children}
      </SnackbarProvider>
    </BrowserRouter>
  );

  return render(component, { wrapper: Wrapper, ...renderOptions });
}

/**
 * Create a mock successful login response
 * @param {Object} overrides - Override default response values
 * @returns {Object} Mock login response
 */
export function mockSuccessfulLogin(overrides = {}) {
  return {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    user: {
      id: 1,
      email: 'test@example.com',
      emailVerified: true,
      role: 'user',
      createdAt: new Date().toISOString()
    },
    ...overrides
  };
}

/**
 * Create a mock failed login response
 * @param {number} status - HTTP status code
 * @param {Object} data - Response data
 * @returns {Object} Mock error response
 */
export function mockFailedLogin(status, data) {
  const error = new Error('Request failed');
  error.response = { status, data };
  return error;
}

/**
 * Wait for loading indicators to finish
 * @returns {Promise<void>}
 */
export async function waitForLoadingToFinish() {
  const { waitFor } = await import('@testing-library/react');
  await waitFor(() => {
    expect(document.querySelector('[data-testid="loading"]')).not.toBeInTheDocument();
  }, { timeout: 3000 });
}

/**
 * Create a mock JWT token for testing
 * @param {Object} payload - Token payload
 * @returns {string} Mock JWT token
 */
export function createMockJWT(payload = {}) {
  const defaultPayload = {
    userId: 1,
    role: 'user',
    type: 'access',
    exp: Math.floor(Date.now() / 1000) + 900 // 15 minutes from now
  };

  const combinedPayload = { ...defaultPayload, ...payload };
  const encodedPayload = btoa(JSON.stringify(combinedPayload));

  // Create a fake JWT (header.payload.signature)
  return `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${encodedPayload}.mock-signature`;
}

/**
 * Create an expired mock JWT token
 * @returns {string} Expired mock JWT token
 */
export function createExpiredJWT() {
  return createMockJWT({
    exp: Math.floor(Date.now() / 1000) - 3600 // 1 hour ago
  });
}
