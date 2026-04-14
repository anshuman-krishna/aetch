import { expect, test } from '@playwright/test';

test.describe('auth pages', () => {
  test('login page renders form', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading')).toBeVisible();
    await expect(page.locator('input[type="email"]').first()).toBeVisible();
  });

  test('register page renders form', async ({ page }) => {
    await page.goto('/register');
    await expect(page.locator('input[type="email"]').first()).toBeVisible();
  });

  test('protected /app route redirects unauthenticated user', async ({ page }) => {
    const resp = await page.goto('/app/gallery');
    expect(resp?.status()).toBeLessThan(500);
    await expect(page).toHaveURL(/\/(login|auth)/);
  });
});
