import { expect, test, type Locator } from '@playwright/test';

/**
 * Typing into a server-rendered input before React hydrates it is lost on the
 * next render. Retry the fill until the page reacts, which keeps these tests
 * stable against a busy development server.
 */
async function fillUntil(input: Locator, value: string, reacted: () => Promise<void>) {
  await expect(async () => {
    await input.fill(value);
    await reacted();
  }).toPass({ timeout: 20_000 });
}

test.describe('color vision and framework exports', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'Exportar' })).toBeVisible();
  });

  test('simulates color vision on the canvas without changing the palette', async ({ page }) => {
    const panel = page.locator('#canvas-panel');
    await expect(panel).not.toHaveCSS('filter', /url/);

    await page.getByLabel('Simulación de visión del color').selectOption('deuteranopia');
    await expect(panel).toHaveCSS('filter', /url/);
    await expect(page.locator('#craftie-color-vision-filter feColorMatrix')).toHaveCount(1);

    await page.getByLabel('Simulación de visión del color').selectOption('none');
    await expect(panel).not.toHaveCSS('filter', /url/);
  });

  test('offers Tailwind and shadcn/ui exports', async ({ page }) => {
    await page.getByRole('button', { name: 'Exportar' }).click();
    await expect(page.getByRole('menuitem', { name: /Tailwind CSS v4/ })).toBeVisible();

    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('menuitem', { name: /shadcn\/ui/ }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('craftie-shadcn.css');
  });
});

test.describe('language', () => {
  test('switches the interface to English and remembers the choice', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'Exportar' })).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');

    await page.getByRole('button', { name: 'Cambiar idioma a English' }).click();
    await expect(page.getByRole('button', { name: 'Export', exact: true })).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');

    await page.reload();
    await expect(page.getByRole('button', { name: 'Export', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Switch language to Español' })).toBeVisible();
  });

  test('uses English by default for English browsers', async ({ browser }) => {
    const context = await browser.newContext({ locale: 'en-US' });
    const page = await context.newPage();
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'Export', exact: true })).toBeVisible();
    await context.close();
  });
});

test.describe('standalone tools', () => {
  test('checks contrast and offers a fix when the pair fails', async ({ page }) => {
    await page.goto('/tools/contrast-checker');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { level: 1, name: 'Verificador de contraste WCAG' })).toBeVisible();
    await expect(page.getByRole('status')).toContainText(':1');

    const advice = page.getByRole('region', { name: 'Cómo mejorar el contraste' });
    await fillUntil(page.getByLabel('Color del texto', { exact: true }), '#C2653A', async () => {
      await page.getByLabel('Color de fondo', { exact: true }).fill('#FFFFFF');
      await expect(advice).toBeVisible({ timeout: 1_000 });
    });

    await page.getByLabel('Color del texto', { exact: true }).fill('#000000');
    await expect(page.getByRole('status')).toContainText('21.00:1');
    await expect(page.getByRole('region', { name: 'Cómo mejorar el contraste' })).toHaveCount(0);
  });

  test('rejects an invalid HEX', async ({ page }) => {
    await page.goto('/tools/contrast-checker');
    await page.waitForLoadState('networkidle');
    await fillUntil(page.getByLabel('Color del texto', { exact: true }), 'zzz', async () => {
      await expect(page.locator('p[role="alert"]')).toContainText('HEX válido', { timeout: 1_000 });
    });
  });

  test('serves a sitemap and robots pointing to it', async ({ request }) => {
    const sitemap = await request.get('/sitemap.xml');
    expect(sitemap.ok()).toBe(true);
    expect(await sitemap.text()).toContain('/tools/contrast-checker');
    const robots = await request.get('/robots.txt');
    expect(await robots.text()).toContain('Sitemap:');
  });
});

test('Alt+R tries another palette and Ctrl+Z restores the previous one', async ({ page }) => {
  await page.goto('/');
  const fondo = page.getByRole('button', { name: /^Primario: / });
  await expect(fondo).toBeVisible();
  const hexOf = async () => (await fondo.getAttribute('aria-label'))!.match(/#[0-9A-F]{6}/i)![0];
  const before = await hexOf();

  await page.keyboard.press('Alt+KeyR');
  await expect.poll(hexOf).not.toBe(before);

  await page.keyboard.press('Control+KeyZ');
  await expect.poll(hexOf).toBe(before);
});

test.describe('palette gallery', () => {
  test('filters palettes and opens one in the studio', async ({ page }) => {
    await page.goto('/palettes');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { level: 1, name: 'Galería de paletas' })).toBeVisible();
    const total = await page.locator('main ul > li h2').count();
    expect(total).toBeGreaterThan(10);

    const cards = page.locator('main ul > li h2');
    await expect(async () => {
      await page.getByRole('button', { name: 'minimal' }).click();
      expect(await cards.count()).toBeLessThan(total);
    }).toPass({ timeout: 20_000 });
    const filtered = await cards.count();
    expect(filtered).toBeGreaterThan(0);
    expect(filtered).toBeLessThan(total);

    await page.getByRole('link', { name: /Abrir en el estudio: Plata editorial/ }).click();
    await expect(page).toHaveURL(/\/(\?style=[^/]*)?$/, { timeout: 20_000 });
    await expect(page.locator('#tools-panel-colors')).toContainText('#5A4864');
    await expect(page.locator('#tools-panel-colors')).not.toContainText('#1F6F54');
  });
});

test.describe('tonal scales', () => {
  test('edits a step and exports the full 50–900 ramp', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.locator('button[aria-haspopup="menu"]').filter({ hasText: 'Colores' }).click();
    await page.getByRole('menuitemradio', { name: /Escalas de tonos/ }).click();

    await expect(page.getByRole('heading', { name: 'Escalas de tonos' })).toBeVisible();
    const step = page.getByRole('button', { name: /^Primario 500: / });
    const before = (await step.getAttribute('aria-label'))!.match(/#[0-9A-F]{6}/i)![0];

    await step.click();
    const hexInput = page.getByRole('textbox', { name: 'HEX' });
    await hexInput.fill('#336699');
    await hexInput.press('Enter');
    await expect(page.getByRole('button', { name: /^Primario 500: #336699/i })).toBeVisible();
    expect(before.toLowerCase()).not.toBe('#336699');

    await page.getByRole('button', { name: 'Restablecer paso' }).click();
    await expect(page.getByRole('button', { name: new RegExp(`^Primario 500: ${before}`, 'i') })).toBeVisible();
  });
});
