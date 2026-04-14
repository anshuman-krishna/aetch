import { expect, test } from '@playwright/test';

test.describe('landing page', () => {
  test('renders hero + CTA links', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /tattoo creative platform/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /sign in/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /create account/i })).toBeVisible();
  });

  test('sign-in CTA navigates to /login', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /sign in/i }).first().click();
    await expect(page).toHaveURL(/\/login$/);
  });
});
