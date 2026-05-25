import { test, expect } from '@playwright/test';

test.describe('Authentication flow', () => {
  test('login page renders email entry', async ({ page }) => {
    await page.goto('/auth/login');
    await expect(page.getByRole('heading', { name: /sign in|log in|welcome/i }).or(page.locator('form')).first()).toBeVisible();
  });

  test('register page is reachable', async ({ page }) => {
    await page.goto('/auth/register');
    await expect(page).toHaveURL(/auth\/register/);
  });

  test('unauthenticated user is redirected from dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/auth\/login/);
  });
});
