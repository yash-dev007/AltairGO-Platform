/**
 * auth.js — Shared Playwright auth helpers
 *
 * Test user: testreviewer@altairgo.com / TestReviewer123!
 * (user must already exist in the running backend — register once if needed)
 */

export const TEST_USER = {
  email: 'testreviewer@altairgo.com',
  password: 'TestReviewer123!',
  name: 'Test Reviewer',
};

export const API_BASE = 'http://127.0.0.1:5000';

/**
 * Ensure test user exists and return JWT token via API.
 * Tries login first; registers if 401/404.
 */
export async function getToken(request) {
  // Try login
  let res = await request.post(`${API_BASE}/auth/login`, {
    data: { email: TEST_USER.email, password: TEST_USER.password },
  });
  if (res.ok()) {
    const body = await res.json();
    return body.token;
  }
  // Register if not found
  res = await request.post(`${API_BASE}/auth/register`, {
    data: { name: TEST_USER.name, email: TEST_USER.email, password: TEST_USER.password },
  });
  const body = await res.json();
  return body.token;
}

/**
 * Log in via the UI and wait for redirect to dashboard.
 */
export async function loginViaUI(page) {
  await page.goto('/login', { waitUntil: 'domcontentloaded' });
  await page.getByPlaceholder(/email/i).fill(TEST_USER.email);
  await page.getByPlaceholder(/password/i).fill(TEST_USER.password);
  await page.getByRole('button', { name: /sign in|log in/i }).click();
  // Wait for redirect away from login page
  await page.waitForURL(/\/(dashboard|trips|$)/, { timeout: 15_000 });
}

/**
 * Set auth token in localStorage so page loads as logged-in user.
 */
export async function setTokenInStorage(page, token) {
  await page.addInitScript((tok) => {
    localStorage.setItem('ag_token', tok);
  }, token);
}
