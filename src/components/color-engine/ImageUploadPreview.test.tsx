import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { ImageUploadPreview } from './ImageUploadPreview';

describe('ImageUploadPreview', () => {
  it('renders the uploaded file preview and disables regenerate while loading', () => {
    const html = renderToStaticMarkup(
      <ImageUploadPreview
        previewUrl="blob:preview"
        fileName="brand.png"
        isLoading
        onRegenerate={vi.fn()}
      />,
    );

    expect(html).toContain('src="blob:preview"');
    expect(html).toContain('Vista previa de brand.png');
    expect(html).toContain('brand.png');
    expect(html).toContain('disabled=""');
  });
});
