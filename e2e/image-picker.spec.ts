import { expect, test, type Page } from '@playwright/test';

/** Left half teal, right half amber: two flat areas a marker can land on. */
async function makeTwoToneImage(page: Page): Promise<Buffer> {
  const bytes = await page.evaluate(async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 400;
    const context = canvas.getContext('2d')!;
    context.fillStyle = '#1F6F6A';
    context.fillRect(0, 0, 300, 400);
    context.fillStyle = '#E9A23B';
    context.fillRect(300, 0, 300, 400);
    context.fillStyle = '#F4EFE6';
    context.fillRect(240, 150, 120, 100);
    const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), 'image/png'));
    return Array.from(new Uint8Array(await blob.arrayBuffer()));
  });
  return Buffer.from(bytes);
}

test('picks a palette color by dragging its marker on the image', async ({ page }) => {
  await page.goto('/');
  await page.locator('input[type="file"]').first().setInputFiles({
    name: 'two-tone.png',
    mimeType: 'image/png',
    buffer: await makeTwoToneImage(page),
  });

  const thumbnail = page.getByRole('button', { name: 'Elegir colores de la imagen' });
  await thumbnail.click();
  await expect(thumbnail).toHaveAttribute('aria-pressed', 'true');

  const picker = page.getByRole('region', { name: 'Elige colores de tu imagen' });
  const swatches = picker.getByRole('list', { name: 'Colores tomados de la imagen' });
  const firstMarker = picker.getByRole('button', { name: /^Color 1: #[0-9A-F]{6}/ });
  await expect(firstMarker).toBeVisible();

  // Drag the first marker onto the far left (teal) area.
  const stage = await picker.locator('img').boundingBox();
  const marker = await firstMarker.boundingBox();
  if (!stage || !marker) throw new Error('Picker did not render.');
  await page.mouse.move(marker.x + marker.width / 2, marker.y + marker.height / 2);
  await page.mouse.down();
  await page.mouse.move(stage.x + stage.width * 0.1, stage.y + stage.height * 0.5, { steps: 8 });
  await page.mouse.up();

  await expect(picker.getByRole('button', { name: 'Color 1: #1F6F6A. Usa las flechas para moverlo' })).toBeVisible();
  await expect(swatches.getByRole('button', { name: '#1F6F6A', exact: true })).toBeVisible();

  // Keyboard: move it into the amber half.
  const moved = picker.getByRole('button', { name: /^Color 1: / });
  await moved.focus();
  for (let i = 0; i < 15; i += 1) await page.keyboard.press('Shift+ArrowRight');
  await expect(picker.getByRole('button', { name: 'Color 1: #E9A23B. Usa las flechas para moverlo' })).toBeVisible();

  const before = await swatches.getByRole('listitem').count();
  await picker.getByRole('button', { name: 'Añadir color' }).click();
  await expect(swatches.getByRole('listitem')).toHaveCount(before + 1);

  await picker.getByRole('button', { name: 'Volver a la paleta' }).click();
  await expect(picker).toHaveCount(0);
});
