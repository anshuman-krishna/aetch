import { expect, test } from '@playwright/test';

// confirms middleware emits the per-request nonce csp + static security headers
test.describe('security headers', () => {
  test('landing page has csp w/ nonce + hsts + frame-ancestors none', async ({ page }) => {
    const resp = await page.goto('/');
    expect(resp).not.toBeNull();
    const headers = resp!.headers();
    const csp = headers['content-security-policy'];
    expect(csp).toBeDefined();
    expect(csp).toMatch(/script-src[^;]*'nonce-/);
    expect(csp).toContain("frame-ancestors 'none'");
    expect(headers['strict-transport-security']).toContain('max-age=');
    expect(headers['x-frame-options']).toBe('DENY');
    expect(headers['x-content-type-options']).toBe('nosniff');
  });
});
