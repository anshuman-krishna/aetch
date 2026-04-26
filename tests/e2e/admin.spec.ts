import { expect, test } from '@playwright/test';

test.describe('admin (unauthenticated)', () => {
  test('/app/admin redirects to login', async ({ page }) => {
    const resp = await page.goto('/app/admin');
    expect(resp?.status()).toBeLessThan(500);
    await expect(page).toHaveURL(/\/(login|auth)/);
  });

  test('GET /api/admin/users returns 401', async ({ request }) => {
    const resp = await request.get('/api/admin/users');
    expect(resp.status()).toBe(401);
  });

  test('GET /api/admin/audit returns 401', async ({ request }) => {
    const resp = await request.get('/api/admin/audit');
    expect(resp.status()).toBe(401);
  });
});
