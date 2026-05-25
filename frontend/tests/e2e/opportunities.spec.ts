import { test, expect } from '@playwright/test';

/**
 * Full authenticated E2E flows require Clerk test credentials.
 * Set E2E_CLERK_EMAIL and E2E_CLERK_PASSWORD to run the signed-in suite.
 */
const clerkEmail = process.env.E2E_CLERK_EMAIL;
const clerkPassword = process.env.E2E_CLERK_PASSWORD;

test.describe('Opportunities (authenticated)', () => {
  test.skip(!clerkEmail || !clerkPassword, 'Requires E2E_CLERK_EMAIL and E2E_CLERK_PASSWORD');

  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login');
    await page.getByLabel(/email/i).fill(clerkEmail!);
    await page.getByRole('button', { name: /continue/i }).click();
    await page.getByLabel(/password/i).fill(clerkPassword!);
    await page.getByRole('button', { name: /continue|sign in/i }).click();
    await page.waitForURL(/dashboard/, { timeout: 60_000 });
  });

  test('business owner can open campaigns area', async ({ page }) => {
    await page.goto('/campaigns');
    await expect(page).not.toHaveURL(/auth\/login/);
  });
});
