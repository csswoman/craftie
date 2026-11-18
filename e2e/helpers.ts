import type { Page } from '@playwright/test';

/** Opens the studio and loads the example palette from the empty welcome card. */
export async function openStudio(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: /^(Ver una paleta de ejemplo|See an example palette)$/ }).click();
}
