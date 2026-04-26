import { expect, test } from '@playwright/test';

test.describe('create post (unauthenticated)', () => {
  test('/app/create-post redirects to login with callback', async ({ page }) => {
    const resp = await page.goto('/app/create-post');
    expect(resp?.status()).toBeLessThan(500);
    await expect(page).toHaveURL(/\/(login|auth)/);
    expect(page.url()).toMatch(/callbackUrl=.*create-post/);
  });

  test('POST /api/posts requires auth', async ({ request }) => {
    const resp = await request.post('/api/posts', { data: { caption: 'hello' } });
    expect(resp.status()).toBe(401);
  });
});
