import { buildGoogleFontsUrl, getGoogleFontsLinkId } from '@lib/typography/googleFonts';
import type { FontPair } from '@lib/typography/pairings';

/**
 * Injects a stylesheet link for the required Google Fonts families.
 * Skips injection when an identical URL is already present.
 */
export function loadGoogleFonts(pairs: FontPair[]): void {
  const url = buildGoogleFontsUrl(pairs);

  if (url === '') {
    return;
  }

  const linkId = getGoogleFontsLinkId(url);
  const existing = document.getElementById(linkId);

  if (existing instanceof HTMLLinkElement && existing.href === url) {
    return;
  }

  if (existing) {
    existing.remove();
  }

  const link = document.createElement('link');
  link.id = linkId;
  link.rel = 'stylesheet';
  link.href = url;
  document.head.appendChild(link);
}
