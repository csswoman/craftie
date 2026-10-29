/**
 * Browser adapter for the shareable-palette URL hash (`#p=...`). This is the
 * only module that touches `window.location` / `history`; the encode/decode
 * logic lives in the framework-agnostic `@lib/studio/shareLink`. Every access
 * is try/catch guarded so SSR or a locked-down document never throws.
 */

export const SHARE_HASH_PARAM = 'p';

/** Read the encoded share payload from the current URL hash, or `null`. */
export function readShareHash(): string | null {
  try {
    const hash = window.location.hash.replace(/^#/, '');
    if (hash.length === 0) return null;

    const params = new URLSearchParams(hash);
    const value = params.get(SHARE_HASH_PARAM);
    return value && value.length > 0 ? value : null;
  } catch {
    return null;
  }
}

/** Replace the URL hash with `#p=<encoded>` without adding a history entry. */
export function writeShareHash(encoded: string): void {
  try {
    const params = new URLSearchParams();
    params.set(SHARE_HASH_PARAM, encoded);
    const { pathname, search } = window.location;
    window.history.replaceState(null, '', `${pathname}${search}#${params.toString()}`);
  } catch {
    // Ignore: non-browser context or restricted history access.
  }
}

/** Remove the share hash from the URL, leaving path and query intact. */
export function clearShareHash(): void {
  try {
    const { pathname, search } = window.location;
    window.history.replaceState(null, '', `${pathname}${search}`);
  } catch {
    // Ignore: non-browser context or restricted history access.
  }
}

/** Build the full absolute URL for the current page with a share hash applied. */
export function buildShareUrl(encoded: string): string | null {
  try {
    const params = new URLSearchParams();
    params.set(SHARE_HASH_PARAM, encoded);
    const { origin, pathname, search } = window.location;
    return `${origin}${pathname}${search}#${params.toString()}`;
  } catch {
    return null;
  }
}

/** Copy text to the clipboard. Resolves `true` on success, `false` otherwise. */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
