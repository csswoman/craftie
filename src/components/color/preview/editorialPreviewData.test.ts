import { describe, expect, it } from 'vitest';

import { EDITORIAL_ARTICLE, EDITORIAL_RELATED } from './editorialPreviewData';

describe('editorial preview data', () => {
  it('provides a complete article and related reading', () => {
    expect(EDITORIAL_ARTICLE.title.length).toBeGreaterThan(0);
    expect(EDITORIAL_ARTICLE.paragraphs.length).toBeGreaterThanOrEqual(2);
    expect(EDITORIAL_RELATED).toHaveLength(3);
  });
});
