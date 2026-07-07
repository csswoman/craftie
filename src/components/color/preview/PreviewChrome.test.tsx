import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { PreviewContrastWarnings } from './PreviewChrome';

describe('PreviewChrome', () => {
  it('renders contrast warnings as a status message', () => {
    const html = renderToStaticMarkup(
      <PreviewContrastWarnings warnings={['Primario no cumple AA']} />,
    );

    expect(html).toContain('role="status"');
    expect(html).toContain('Contraste en vista previa');
    expect(html).toContain('Primario no cumple AA');
  });
});
