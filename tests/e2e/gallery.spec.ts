import { expect, test } from '@playwright/test';

test.describe('gallery (unauthenticated)', () => {
  test('redirects unauthenticated /app/gallery to login', async ({ page }) => {
    const resp = await page.goto('/app/gallery');
    expect(resp?.status()).toBeLessThan(500);
    await expect(page).toHaveURL(/\/(login|auth)/);
  });

  test('login page surfaces gallery callback', async ({ page }) => {
    await page.goto('/app/gallery');
    await expect(page).toHaveURL(/callbackUrl=/);
    expect(page.url()).toMatch(/callbackUrl=.*gallery/);
  });
});
