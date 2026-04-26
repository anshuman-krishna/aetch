import { expect, test } from '@playwright/test';

// snapshot regressions for primary public pages
// run `npx playwright test --update-snapshots` after intentional ui changes
test.describe('visual regression', () => {
  test('landing renders consistent hero', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('landing.png', {
      fullPage: false,
      maxDiffPixelRatio: 0.02,
    });
  });

  test('login form layout', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('login.png', {
      fullPage: false,
      maxDiffPixelRatio: 0.02,
    });
  });

  test('register form layout', async ({ page }) => {
    await page.goto('/register');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('register.png', {
      fullPage: false,
      maxDiffPixelRatio: 0.02,
    });
  });
});
