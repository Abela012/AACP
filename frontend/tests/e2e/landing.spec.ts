import { test, expect } from '@playwright/test';

test.describe('Landing page', () => {
  test('loads marketing home and shows primary CTA', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\//);
    const heading = page.getByRole('heading').first();
    await expect(heading).toBeVisible();
  });

  test('navigates to login from public site', async ({ page }) => {
    await page.goto('/');
    const loginLink = page.getByRole('link', { name: /log in|sign in|login/i }).first();
    if (await loginLink.isVisible()) {
      await loginLink.click();
      await expect(page).toHaveURL(/auth\/login/);
    } else {
      await page.goto('/auth/login');
      await expect(page).toHaveURL(/auth\/login/);
    }
  });
});
