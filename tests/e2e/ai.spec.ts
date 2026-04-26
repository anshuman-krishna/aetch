import { expect, test } from '@playwright/test';

test.describe('ai generator (unauthenticated)', () => {
  test('/app/ai redirects to login', async ({ page }) => {
    const resp = await page.goto('/app/ai');
    expect(resp?.status()).toBeLessThan(500);
    await expect(page).toHaveURL(/\/(login|auth)/);
  });

  test('POST /api/ai/generate requires auth', async ({ request }) => {
    const resp = await request.post('/api/ai/generate', {
      data: { idea: 'phoenix on shoulder' },
    });
    expect(resp.status()).toBe(401);
  });
});
