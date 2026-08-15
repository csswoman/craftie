import type { GoogleFontOption } from '@lib/typography/googleFontsCatalog';

let fontsCache: GoogleFontOption[] | null = null;
let fontsPromise: Promise<GoogleFontOption[]> | null = null;

export async function getGoogleFontsCatalog(): Promise<GoogleFontOption[]> {
  if (fontsCache) {
    return fontsCache;
  }

  if (!fontsPromise) {
    fontsPromise = fetch('/api/google-fonts')
      .then(async (response) => {
        const payload = (await response.json()) as {
          fonts?: GoogleFontOption[];
          error?: string;
        };

        if (!response.ok || !payload.fonts) {
          throw new Error(payload.error ?? 'No se pudo cargar el catálogo de Google Fonts.');
        }

        fontsCache = payload.fonts;
        return fontsCache;
      })
      .catch((error: unknown) => {
        fontsPromise = null;
        throw error;
      });
  }

  return fontsPromise;
}
