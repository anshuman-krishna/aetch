import { expect, test } from '@playwright/test';

test.describe('ar preview (unauthenticated)', () => {
  test('/app/ar-preview redirects to login', async ({ page }) => {
    const resp = await page.goto('/app/ar-preview');
    expect(resp?.status()).toBeLessThan(500);
    await expect(page).toHaveURL(/\/(login|auth)/);
  });

  test('POST /api/ar-preview requires auth', async ({ request }) => {
    const resp = await request.post('/api/ar-preview', {
      data: {
        bodyImageUrl: 'https://x.test/body.jpg',
        tattooImageUrl: 'https://x.test/t.jpg',
        positionX: 50,
        positionY: 50,
        scale: 1,
        rotation: 0,
        opacity: 0.85,
      },
    });
    expect(resp.status()).toBe(401);
  });
});
