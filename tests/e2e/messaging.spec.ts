import { expect, test } from '@playwright/test';

test.describe('messaging (unauthenticated)', () => {
  test('/app/messages redirects to login', async ({ page }) => {
    const resp = await page.goto('/app/messages');
    expect(resp?.status()).toBeLessThan(500);
    await expect(page).toHaveURL(/\/(login|auth)/);
  });

  test('GET /api/messages/conversations requires auth', async ({ request }) => {
    const resp = await request.get('/api/messages/conversations');
    expect(resp.status()).toBe(401);
  });

  test('POST /api/messages/send requires auth', async ({ request }) => {
    const resp = await request.post('/api/messages/send', {
      data: { conversationId: 'x', content: 'hi' },
    });
    expect(resp.status()).toBe(401);
  });
});
