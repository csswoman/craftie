import { expect, test } from '@playwright/test';

test.describe('workspace', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'Exportar' })).toBeVisible();
  });

  test('starts with a sample role palette and contrast ratings', async ({ page }) => {
    await expect(page.getByText('Paleta de roles')).toBeVisible();
    await expect(page.getByRole('button', { name: /^Fondo: .*WCAG/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /^Texto: .*WCAG/ })).toBeVisible();
  });

  test('switches between light and dark themes', async ({ page }) => {
    await page.getByRole('button', { name: 'Cambiar a tema oscuro' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await page.getByRole('button', { name: 'Cambiar a tema claro' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  });

  test('shows font pairings in the typography tab', async ({ page }) => {
    await page.getByText('Tipografía', { exact: true }).first().click();
    await expect(page.getByText('Buscar pares tipográficos')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Escala tipográfica' })).toBeVisible();
  });

  test('undoes and redoes a palette change', async ({ page }) => {
    const undo = page.getByRole('button', { name: 'Deshacer' });
    const fondo = page.getByRole('button', { name: /^Fondo: / });
    await expect(undo).toBeDisabled();

    const before = await fondo.getAttribute('aria-label');
    await page.getByRole('button', { name: 'Generar color al azar' }).first().click();
    await expect(undo).toBeEnabled();
    await expect(fondo).not.toHaveAttribute('aria-label', before ?? '');

    await undo.click();
    await expect(fondo).toHaveAttribute('aria-label', before ?? '');
    await page.getByRole('button', { name: 'Rehacer' }).click();
    await expect(fondo).not.toHaveAttribute('aria-label', before ?? '');
  });

  test('restores the edited palette after a reload', async ({ page }) => {
    const fondo = page.getByRole('button', { name: /^Fondo: / });
    await page.getByRole('button', { name: 'Generar color al azar' }).first().click();
    const edited = await fondo.getAttribute('aria-label');

    await page.waitForTimeout(1000); // autosave is debounced by 500ms
    await page.reload();
    await expect(page.getByRole('button', { name: /^Fondo: / })).toHaveAttribute(
      'aria-label',
      edited ?? '',
    );
  });

  test('opens the export menu', async ({ page }) => {
    await page.getByRole('button', { name: 'Exportar' }).click();
    await expect(page.getByRole('menu', { name: 'Opciones de exportación' })).toBeVisible();
    await expect(page.getByText('CSS variables')).toBeVisible();
  });

  test('lists the source colors in the Colores panel', async ({ page }) => {
    await expect(page.locator('#tools-panel-colors')).toContainText('#1F6F54');
  });

  test('keeps the Colores panel populated when starting from a custom HEX', async ({ page }) => {
    await page.getByRole('button', { name: 'Volver al inicio' }).click();
    await page.getByRole('button', { name: 'Empezar de nuevo' }).click();
    await page.getByLabel('Partir de un color (HEX)').fill('#3A5BA0');
    await page.getByRole('button', { name: 'Crear paleta' }).click();

    await expect(page.locator('#tools-panel-colors')).toContainText('#3A5BA0');
  });
});
