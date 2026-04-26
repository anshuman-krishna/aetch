import { expect, test } from '@playwright/test';

test.describe('booking (unauthenticated)', () => {
  test('redirects /app/book to login', async ({ page }) => {
    const resp = await page.goto('/app/book');
    expect(resp?.status()).toBeLessThan(500);
    await expect(page).toHaveURL(/\/(login|auth)/);
  });

  test('booking api requires auth', async ({ request }) => {
    const resp = await request.post('/api/bookings', {
      data: { artistId: 'fix_artist_1', date: new Date().toISOString(), tattooIdea: 'koi' },
    });
    expect(resp.status()).toBe(401);
  });
});
