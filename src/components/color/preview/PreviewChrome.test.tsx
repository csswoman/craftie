import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { PreviewContrastWarnings, PreviewThemeToggle } from './PreviewChrome';

describe('PreviewChrome', () => {
  it('marks the active theme in the segmented control', () => {
    const html = renderToStaticMarkup(
      <PreviewThemeToggle activeTheme="dark" onChange={vi.fn()} />,
    );

    expect(html).toContain('aria-label="Tema de vista previa"');
    expect(html).toContain('aria-pressed="false"');
    expect(html).toContain('aria-pressed="true"');
    expect(html).toContain('Oscuro');
  });

  it('renders contrast warnings as a status message', () => {
    const html = renderToStaticMarkup(
      <PreviewContrastWarnings warnings={['Primario no cumple AA']} />,
    );

    expect(html).toContain('role="status"');
    expect(html).toContain('Contraste en vista previa');
    expect(html).toContain('Primario no cumple AA');
  });
});
