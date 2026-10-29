import {
  deserializeWorkspace,
  serializeWorkspace,
  type WorkspaceSnapshot,
} from './workspaceSnapshot';

/**
 * Shareable-link codec for the Select-Colors workspace. Encodes a
 * {@link WorkspaceSnapshot} into a compact base64url string suitable for a URL
 * hash (`#p=...`) and decodes it back, tolerating any malformed input by
 * returning `null`. Kept framework- and browser-agnostic (no `window`,
 * `btoa`/`atob`, `Buffer`, or DOM) so it round-trips identically on any
 * runtime; the single place that touches `location`/`history` is the browser
 * adapter in `src/lib/browser/shareUrl.ts`.
 */

// Guard against pathological inputs: a shared hash far larger than any real
// snapshot is treated as malformed rather than decoded.
const MAX_ENCODED_LENGTH = 16_384;

const BASE64_ALPHABET =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

const BASE64_LOOKUP: Record<string, number> = (() => {
  const table: Record<string, number> = {};
  for (let i = 0; i < BASE64_ALPHABET.length; i += 1) {
    table[BASE64_ALPHABET[i]] = i;
  }
  return table;
})();

/** Encode a byte array into standard base64, then project to the URL-safe alphabet. */
function bytesToBase64Url(bytes: number[]): string {
  let output = '';

  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i];
    const b1 = bytes[i + 1];
    const b2 = bytes[i + 2];

    const triple = (b0 << 16) | ((b1 ?? 0) << 8) | (b2 ?? 0);

    output += BASE64_ALPHABET[(triple >> 18) & 0x3f];
    output += BASE64_ALPHABET[(triple >> 12) & 0x3f];
    output += b1 === undefined ? '' : BASE64_ALPHABET[(triple >> 6) & 0x3f];
    output += b2 === undefined ? '' : BASE64_ALPHABET[triple & 0x3f];
  }

  // URL-safe: drop padding, swap +/ for -_.
  return output.replace(/\+/g, '-').replace(/\//g, '_');
}

/** Decode a URL-safe base64 string back into a byte array; `null` if malformed. */
function base64UrlToBytes(encoded: string): number[] | null {
  const normalized = encoded.replace(/-/g, '+').replace(/_/g, '/');

  for (const char of normalized) {
    if (!(char in BASE64_LOOKUP)) return null;
  }

  const bytes: number[] = [];

  for (let i = 0; i < normalized.length; i += 4) {
    const c0 = BASE64_LOOKUP[normalized[i]];
    const c1 = BASE64_LOOKUP[normalized[i + 1]];
    const c2 = normalized[i + 2] === undefined ? undefined : BASE64_LOOKUP[normalized[i + 2]];
    const c3 = normalized[i + 3] === undefined ? undefined : BASE64_LOOKUP[normalized[i + 3]];

    if (c1 === undefined) return null;

    bytes.push(((c0 << 2) | (c1 >> 4)) & 0xff);
    if (c2 !== undefined) {
      bytes.push(((c1 << 4) | (c2 >> 2)) & 0xff);
      if (c3 !== undefined) {
        bytes.push(((c2 << 6) | c3) & 0xff);
      }
    }
  }

  return bytes;
}

/** UTF-8 encode a string into a byte array (surrogate-pair aware). */
function stringToUtf8Bytes(value: string): number[] {
  const bytes: number[] = [];

  for (let i = 0; i < value.length; i += 1) {
    let codePoint = value.charCodeAt(i);

    if (codePoint >= 0xd800 && codePoint <= 0xdbff && i + 1 < value.length) {
      const low = value.charCodeAt(i + 1);
      if (low >= 0xdc00 && low <= 0xdfff) {
        codePoint = 0x10000 + ((codePoint - 0xd800) << 10) + (low - 0xdc00);
        i += 1;
      }
    }

    if (codePoint < 0x80) {
      bytes.push(codePoint);
    } else if (codePoint < 0x800) {
      bytes.push(0xc0 | (codePoint >> 6), 0x80 | (codePoint & 0x3f));
    } else if (codePoint < 0x10000) {
      bytes.push(
        0xe0 | (codePoint >> 12),
        0x80 | ((codePoint >> 6) & 0x3f),
        0x80 | (codePoint & 0x3f),
      );
    } else {
      bytes.push(
        0xf0 | (codePoint >> 18),
        0x80 | ((codePoint >> 12) & 0x3f),
        0x80 | ((codePoint >> 6) & 0x3f),
        0x80 | (codePoint & 0x3f),
      );
    }
  }

  return bytes;
}

/** Decode a UTF-8 byte array back into a string; `null` on invalid sequences. */
function utf8BytesToString(bytes: number[]): string | null {
  let output = '';
  let i = 0;

  while (i < bytes.length) {
    const byte = bytes[i];

    if (byte < 0x80) {
      output += String.fromCharCode(byte);
      i += 1;
      continue;
    }

    let codePoint: number;
    let extraBytes: number;

    if ((byte & 0xe0) === 0xc0) {
      codePoint = byte & 0x1f;
      extraBytes = 1;
    } else if ((byte & 0xf0) === 0xe0) {
      codePoint = byte & 0x0f;
      extraBytes = 2;
    } else if ((byte & 0xf8) === 0xf0) {
      codePoint = byte & 0x07;
      extraBytes = 3;
    } else {
      return null;
    }

    if (i + extraBytes >= bytes.length) return null;

    for (let j = 1; j <= extraBytes; j += 1) {
      const continuation = bytes[i + j];
      if ((continuation & 0xc0) !== 0x80) return null;
      codePoint = (codePoint << 6) | (continuation & 0x3f);
    }

    if (codePoint > 0xffff) {
      codePoint -= 0x10000;
      output += String.fromCharCode(0xd800 + (codePoint >> 10));
      output += String.fromCharCode(0xdc00 + (codePoint & 0x3ff));
    } else {
      output += String.fromCharCode(codePoint);
    }

    i += extraBytes + 1;
  }

  return output;
}

/**
 * Encode a workspace snapshot into a base64url string. Reuses the versioned
 * {@link serializeWorkspace} envelope so a decoded value always round-trips
 * through the same validation the snapshot uses everywhere else.
 */
export function encodeShareSnapshot(snapshot: WorkspaceSnapshot): string {
  const json = serializeWorkspace(snapshot);
  return bytesToBase64Url(stringToUtf8Bytes(json));
}

/**
 * Decode a base64url share payload back into a validated snapshot. Returns
 * `null` for any input that is empty, oversized, not valid base64url, not
 * valid UTF-8, not JSON, or not a well-formed `version: 1` envelope.
 */
export function decodeShareSnapshot(encoded: string): WorkspaceSnapshot | null {
  if (typeof encoded !== 'string') return null;
  if (encoded.length === 0 || encoded.length > MAX_ENCODED_LENGTH) return null;

  const bytes = base64UrlToBytes(encoded);
  if (bytes === null) return null;

  const json = utf8BytesToString(bytes);
  if (json === null) return null;

  return deserializeWorkspace(json);
}
