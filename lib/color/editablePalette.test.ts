import { describe, expect, it } from 'vitest';
import {
  applyClearedDataTokens,
  applySemanticTokenHex,
  clearSemanticTokenState,
  INITIAL_EDITABLE,
  statusColorsAsTokenOverrides,
} from './editablePalette';
import { deriveSemanticTokens } from './semanticTokens';
import type { ApplyTokenOptions } from './editablePalette';

const options: ApplyTokenOptions = { activeTheme: 'light', extractedColors: [], paletteType: undefined };

describe('applySemanticTokenHex', () => {
  it('normalizes the hex and writes it to the active theme', () => {
    const next = applySemanticTokenHex(INITIAL_EDITABLE, 'primary', '#2f5644', options);
    expect(next.tokenOverridesByTheme.light.primary).toBe('#2F5644');
  });

  it('syncs a counterpart color to the opposite theme', () => {
    const next = applySemanticTokenHex(INITIAL_EDITABLE, 'primary', '#2F5644', options);
    const dark = next.tokenOverridesByTheme.dark.primary;
    expect(dark).toBeDefined();
    expect(INITIAL_EDITABLE.tokenOverridesByTheme.dark.primary).toBeUndefined();
  });

  it('syncs the accent family companion and un-clears data tokens', () => {
    const cleared = { ...INITIAL_EDITABLE, clearedSemanticTokens: ['data-1' as const, 'data-2' as const] };
    const next = applySemanticTokenHex(cleared, 'accent', '#D9480F', options);
    expect(next.tokenOverridesByTheme.light['data-1']).toBe('#D9480F');
    expect(next.clearedSemanticTokens).toEqual(['data-2']);
  });
});

describe('clearSemanticTokenState', () => {
  it('removes overrides from both themes and marks data tokens as cleared', () => {
    const edited = applySemanticTokenHex(INITIAL_EDITABLE, 'data-1', '#D9480F', options);
    const next = clearSemanticTokenState(edited, 'data-1');
    expect(next.tokenOverridesByTheme.light['data-1']).toBeUndefined();
    expect(next.tokenOverridesByTheme.dark['data-1']).toBeUndefined();
    expect(next.clearedSemanticTokens).toContain('data-1');
  });
});

describe('applyClearedDataTokens', () => {
  const tokens = deriveSemanticTokens({ extracted: [], overrides: {}, theme: 'light' });

  it('returns the same tokens when nothing is cleared', () => {
    expect(applyClearedDataTokens(tokens, [])).toBe(tokens);
  });

  it('marks cleared data tokens as derived with a gap message', () => {
    const next = applyClearedDataTokens(tokens, ['data-2']);
    expect(next['data-2'].source).toBe('derived');
    expect(next['data-2'].gap).toBeTruthy();
    expect(next['data-3']).toBe(tokens['data-3']);
  });
});

describe('statusColorsAsTokenOverrides', () => {
  it('maps danger to the error token', () => {
    const out = statusColorsAsTokenOverrides({ danger: { hex: '#B00020' } } as never);
    expect(out).toEqual({ error: '#B00020' });
  });
});
