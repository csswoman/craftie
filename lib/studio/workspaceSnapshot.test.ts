import { describe, expect, it } from 'vitest';

import {
  deserializeWorkspace,
  serializeWorkspace,
  type WorkspaceSnapshot,
} from './workspaceSnapshot';

function minimalSnapshot(): WorkspaceSnapshot {
  return {
    tokenOverridesByTheme: { light: {}, dark: {} },
    clearedSemanticTokens: [],
    roleNames: {},
    lockedRolesByTheme: { light: [], dark: [] },
    savedVibrancy: 50,
    neutralStyle: 'pure',
    forcedStatusSources: {},
    forcedStatusColors: {},
    extractedColors: [],
    paletteType: undefined,
    illustrationSeed: 0,
  };
}

function populatedSnapshot(): WorkspaceSnapshot {
  return {
    tokenOverridesByTheme: {
      light: { background: '#FFFFFF', primary: '#3366FF' },
      dark: { background: '#101010' },
    },
    clearedSemanticTokens: ['data-1', 'data-2'],
    roleNames: { primario: 'Marca' },
    lockedRolesByTheme: { light: ['primario'], dark: [] },
    savedVibrancy: 72,
    neutralStyle: 'tinted',
    forcedStatusSources: { success: '#22AA55' },
    forcedStatusColors: {
      danger: { hex: '#CC2233', origin: 'found', sourceHex: '#DD3344' },
    },
    extractedColors: [{ hex: '#3366FF', prominence: 0.9 }],
    paletteType: 'vivid',
    illustrationSeed: 7,
  };
}

describe('serializeWorkspace / deserializeWorkspace', () => {
  it('round-trips a populated snapshot', () => {
    const snapshot = populatedSnapshot();
    const result = deserializeWorkspace(serializeWorkspace(snapshot));
    expect(result).toEqual(snapshot);
  });

  it('accepts a minimal valid snapshot', () => {
    const snapshot = minimalSnapshot();
    const result = deserializeWorkspace(serializeWorkspace(snapshot));
    expect(result).toEqual(snapshot);
  });

  it('wraps the payload in a version: 1 envelope', () => {
    const parsed = JSON.parse(serializeWorkspace(minimalSnapshot()));
    expect(parsed.version).toBe(1);
  });

  it('rejects a snapshot with no version field', () => {
    // minimalSnapshot() carries no envelope version, so this is a bare payload.
    expect(deserializeWorkspace(JSON.stringify(minimalSnapshot()))).toBeNull();
  });

  it('rejects an unknown version', () => {
    const envelope = { version: 2, ...minimalSnapshot() };
    expect(deserializeWorkspace(JSON.stringify(envelope))).toBeNull();
  });

  it('rejects non-object input', () => {
    expect(deserializeWorkspace(null)).toBeNull();
    expect(deserializeWorkspace(42)).toBeNull();
    expect(deserializeWorkspace('hello')).toBeNull();
    expect(deserializeWorkspace([])).toBeNull();
  });

  it('rejects a malformed JSON string', () => {
    expect(deserializeWorkspace('{ not valid json')).toBeNull();
  });

  it('rejects wrong field types', () => {
    const base = { version: 1, ...minimalSnapshot() };

    expect(
      deserializeWorkspace(JSON.stringify({ ...base, savedVibrancy: '50' })),
    ).toBeNull();
    expect(
      deserializeWorkspace(JSON.stringify({ ...base, neutralStyle: 'bogus' })),
    ).toBeNull();
    expect(
      deserializeWorkspace(JSON.stringify({ ...base, clearedSemanticTokens: 'data-1' })),
    ).toBeNull();
    expect(
      deserializeWorkspace(
        JSON.stringify({ ...base, tokenOverridesByTheme: { light: {} } }),
      ),
    ).toBeNull();
    expect(
      deserializeWorkspace(
        JSON.stringify({ ...base, lockedRolesByTheme: { light: [1], dark: [] } }),
      ),
    ).toBeNull();
    expect(
      deserializeWorkspace(
        JSON.stringify({ ...base, extractedColors: [{ hex: '#fff' }] }),
      ),
    ).toBeNull();
    expect(
      deserializeWorkspace(JSON.stringify({ ...base, paletteType: 'rainbow' })),
    ).toBeNull();
    expect(
      deserializeWorkspace(
        JSON.stringify({
          ...base,
          forcedStatusColors: { danger: { hex: '#fff', origin: 'nope' } },
        }),
      ),
    ).toBeNull();
  });
});
