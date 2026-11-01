import { expect, test } from '@playwright/test';

// The service worker is only registered in production builds, so this test
// skips itself against `next dev`.
test('the studio and the contrast tool keep working offline', async ({ page, context, baseURL }) => {
  await page.goto('/');
  const registered = await page.evaluate(async () => {
    if (!('serviceWorker' in navigator)) return false;
    try {
      await Promise.race([
        navigator.serviceWorker.ready,
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 4000)),
      ]);
      return true;
    } catch {
      return false;
    }
  });
  test.skip(!registered, 'Service worker is not active (development server).');

  // Visit the tool once online so it is cached, then reload the page under the worker's control.
  await page.goto('/tools/contrast-checker');
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  await context.setOffline(true);
  await page.goto(`${baseURL}/`);
  await expect(page.getByRole('button', { name: 'Exportar' })).toBeVisible();
  await page.goto(`${baseURL}/tools/contrast-checker`);
  await expect(page.getByRole('heading', { level: 1, name: 'Verificador de contraste WCAG' })).toBeVisible();
  await context.setOffline(false);
});
