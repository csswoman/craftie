import { describe, expect, it } from 'vitest';

import { decodeShareSnapshot, encodeShareSnapshot } from './shareLink';
import type { WorkspaceSnapshot } from './workspaceSnapshot';

function snapshot(partial: Partial<WorkspaceSnapshot> = {}): WorkspaceSnapshot {
  return {
    tokenOverridesByTheme: {
      light: { primary: '#3366FF', background: '#FFFFFF' },
      dark: { primary: '#88AAFF' },
    },
    clearedSemanticTokens: ['data-1'],
    roleNames: { primario: 'Marca', acento: 'Acentó' },
    lockedRolesByTheme: { light: ['primario'], dark: [] },
    savedVibrancy: 0.42,
    neutralStyle: 'tinted',
    forcedStatusSources: { success: '#2E7D32' },
    forcedStatusColors: {
      success: { hex: '#2E7D32', origin: 'found' },
      danger: { hex: '#C62828', origin: 'synthetic', sourceHex: '#FF0000' },
    },
    extractedColors: [
      { hex: '#3366FF', prominence: 0.9 },
      { hex: '#FFAA00', prominence: 0.6 },
    ],
    paletteType: 'vivid',
    illustrationSeed: 7,
    ...partial,
  };
}

describe('encodeShareSnapshot / decodeShareSnapshot', () => {
  it('round-trips a snapshot through encode then decode', () => {
    const original = snapshot();
    const encoded = encodeShareSnapshot(original);

    expect(typeof encoded).toBe('string');
    expect(encoded.length).toBeGreaterThan(0);
    // URL-safe alphabet only: no +, /, or = padding.
    expect(encoded).toMatch(/^[A-Za-z0-9\-_]+$/);

    expect(decodeShareSnapshot(encoded)).toEqual(original);
  });

  it('round-trips non-ASCII role names (UTF-8 safe)', () => {
    const original = snapshot({ roleNames: { primario: 'Até — ñandú 🎨' } });
    const encoded = encodeShareSnapshot(original);

    expect(decodeShareSnapshot(encoded)).toEqual(original);
  });

  it('round-trips an undefined paletteType', () => {
    const original = snapshot({ paletteType: undefined });

    expect(decodeShareSnapshot(encodeShareSnapshot(original))).toEqual(original);
  });

  it('returns null for an empty string', () => {
    expect(decodeShareSnapshot('')).toBeNull();
  });

  it('returns null for a garbage / non-base64 string', () => {
    expect(decodeShareSnapshot('%%% not base64 %%%')).toBeNull();
  });

  it('returns null for a truncated payload', () => {
    const encoded = encodeShareSnapshot(snapshot());
    const truncated = encoded.slice(0, Math.floor(encoded.length / 2));

    expect(decodeShareSnapshot(truncated)).toBeNull();
  });

  it('returns null when the decoded payload is valid base64 but not JSON', () => {
    // "not json" encoded as base64url is a well-formed base64 string whose
    // decoded bytes do not parse as JSON.
    const encoded = encodeShareSnapshot(snapshot());
    // Flip to a short payload that decodes to plain text, not a JSON envelope.
    const notJson = 'bm90LWpzb24'; // "not-json"

    expect(decodeShareSnapshot(notJson)).toBeNull();
    // And a corrupted-but-decodable variant of a real payload also rejects.
    expect(decodeShareSnapshot(encoded.replace(/.$/, 'A'))).toBeNull();
  });

  it('returns null for an oversized payload', () => {
    const huge = 'A'.repeat(20_000);

    expect(decodeShareSnapshot(huge)).toBeNull();
  });
});
