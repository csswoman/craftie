import { NextResponse } from 'next/server';

import type { GoogleFontCategory, GoogleFontOption } from '@lib/typography/googleFontsCatalog';

const GOOGLE_FONTS_METADATA_URL = 'https://fonts.google.com/metadata/fonts';
const VALID_CATEGORIES = new Set<GoogleFontCategory>([
  'serif',
  'sans-serif',
  'display',
  'monospace',
  'handwriting',
]);

type GoogleFontsMetadataResponse = {
  familyMetadataList?: Array<{ family?: unknown; category?: unknown }>;
};

function normalizeCategory(category: string): GoogleFontCategory | null {
  const normalized = category.toLocaleLowerCase('en').replace(/\s+/g, '-');
  return VALID_CATEGORIES.has(normalized as GoogleFontCategory)
    ? (normalized as GoogleFontCategory)
    : null;
}

export async function GET() {
  const response = await fetch(GOOGLE_FONTS_METADATA_URL, { next: { revalidate: 86_400 } });

  if (!response.ok) {
    return NextResponse.json(
      { error: 'No se pudo obtener el catálogo de Google Fonts.' },
      { status: 502 },
    );
  }

  const payload = (await response.json()) as GoogleFontsMetadataResponse;
  const fonts: GoogleFontOption[] = (payload.familyMetadataList ?? []).flatMap((item) => {
    if (typeof item.family !== 'string' || typeof item.category !== 'string') {
      return [];
    }

    const category = normalizeCategory(item.category);
    return category ? [{ family: item.family, category }] : [];
  });

  return NextResponse.json({ fonts });
}
