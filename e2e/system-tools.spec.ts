import { expect, test } from '@playwright/test';

import { openStudio } from './helpers';

test.describe('role derivation', () => {
  test('explains the primary color with measured facts', async ({ page }) => {
    await openStudio(page);
    await page.getByRole('button', { name: /Editar/ }).first().click();

    const summary = page.getByText('¿Por qué este color?');
    await expect(summary).toBeVisible();
    await summary.click();
    await expect(page.getByText(/^Texto de botón sobre este color: \d+\.\d{2}:1/)).toBeVisible();
  });
});

test.describe('shadcn/ui theme tester', () => {
  test('audits the sample theme in light and dark', async ({ page }) => {
    await page.goto('/tools/theme-tester');

    await expect(page.getByRole('heading', { level: 1, name: 'Probador de temas shadcn/ui' })).toBeVisible();
    await expect(page.getByRole('status')).toHaveText('Todos los pares verificados cumplen');
    await page.getByRole('button', { name: 'Oscuro', exact: true }).click();
    await expect(page.getByRole('status')).toHaveText('Todos los pares verificados cumplen');
  });

  test('flags a pasted pair below AA', async ({ page }) => {
    await page.goto('/tools/theme-tester');
    await page.waitForLoadState('networkidle');

    await page.getByLabel('CSS del tema').fill(':root { --background: #ffffff; --foreground: #bbbbbb; }');
    await expect(page.getByRole('status')).toHaveText('1 par no cumple');
    await expect(page.getByRole('row', { name: /Texto de la página/ })).toContainText('No cumple');
  });

  test('opens the studio export in the tester', async ({ page, context }) => {
    await openStudio(page);
    await page.getByRole('button', { name: 'Exportar' }).click();

    const [tester] = await Promise.all([
      context.waitForEvent('page'),
      page.getByRole('menuitem', { name: /Probar el tema shadcn/ }).click(),
    ]);

    await expect(tester.getByText('Tema exportado desde tu proyecto en Craftie.')).toBeVisible();
    await expect(tester.getByLabel('CSS del tema')).toHaveValue(/Craftie · shadcn\/ui/);
  });
});

test.describe('image extraction worker', () => {
  test('extracts colors from a large photo off the main thread', async ({ page }) => {
    const workers: string[] = [];
    page.on('worker', (worker) => workers.push(worker.url()));
    await page.goto('/tools/palette-from-image');
    await page.waitForLoadState('networkidle');

    const jpeg = await page.evaluate(async () => {
      const canvas = document.createElement('canvas');
      canvas.width = 3000;
      canvas.height = 2000;
      const context = canvas.getContext('2d')!;
      const gradient = context.createLinearGradient(0, 0, 3000, 2000);
      gradient.addColorStop(0, '#2c5d4a');
      gradient.addColorStop(1, '#e9c46a');
      context.fillStyle = gradient;
      context.fillRect(0, 0, 3000, 2000);
      const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.9));
      return Array.from(new Uint8Array(await blob.arrayBuffer()));
    });

    await page.locator('input[type="file"]').setInputFiles({
      name: 'large.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from(jpeg),
    });

    await expect(page.getByRole('button', { name: /^Copiar #[0-9A-F]{6}/i }).first()).toBeVisible();
    expect(workers.length).toBeGreaterThan(0);
  });
});
