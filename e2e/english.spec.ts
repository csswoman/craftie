import { expect, test, type Page } from '@playwright/test';

test.use({ locale: 'en-US' });

// Spanish-only accented characters. Person names in the sample copy and the
// language switcher legitimately contain them.
const SPANISH_CHARS = /[áéíóúñ¿¡]/i;
const ALLOWED = /Lucía Ríos|Marta Ibáñez|Español/;

async function collectSpanish(page: Page): Promise<string[]> {
  const texts = await page.evaluate(() => {
    const out: string[] = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node: Node | null;
    while ((node = walker.nextNode())) {
      const el = node.parentElement;
      if (!el || ['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(el.tagName)) continue;
      const text = (node.textContent ?? '').replace(/\s+/g, ' ').trim();
      if (text) out.push(text);
    }
    document.querySelectorAll('[aria-label],[title],[placeholder],[alt]').forEach((element) => {
      for (const attribute of ['aria-label', 'title', 'placeholder', 'alt']) {
        const value = element.getAttribute(attribute);
        if (value) out.push(value);
      }
    });
    return out;
  });
  return texts.filter((text) => SPANISH_CHARS.test(text) && !ALLOWED.test(text));
}

test('the studio shows no Spanish text in English across the canvas views', async ({ page }) => {
  test.setTimeout(120_000);
  const leaks = new Set<string>();
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await expect(page.getByRole('button', { name: 'Export', exact: true })).toBeVisible();
  for (const text of await collectSpanish(page)) leaks.add(`home: ${text}`);

  const selector = page.locator('div.hidden.lg\\:block button[aria-haspopup="menu"]').first();
  for (let index = 0; index < 12; index++) {
    await selector.click();
    const items = page.getByRole('menuitemradio');
    if (index >= (await items.count())) break;
    const name = (await items.nth(index).innerText()).split('\n')[0];
    await items.nth(index).click();
    await page.waitForTimeout(300);
    for (const text of await collectSpanish(page)) leaks.add(`${name}: ${text}`);
  }

  await page.getByRole('tab', { name: 'Typography' }).click();
  await page.waitForTimeout(500);
  for (const text of await collectSpanish(page)) leaks.add(`typography: ${text}`);

  expect([...leaks]).toEqual([]);
});

test('the start screen and the style gallery are in English', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: 'Back to start' }).click();
  await page.getByRole('button', { name: 'Start over', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Start here' })).toBeVisible();
  await page.getByRole('button', { name: 'Explore styles' }).click();
  await expect(page.getByText(/styles available/)).toBeVisible();
  expect(await collectSpanish(page)).toEqual([]);
});
