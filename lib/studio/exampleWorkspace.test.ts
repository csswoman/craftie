import { describe, expect, it } from 'vitest';

import { deriveSemanticTokens } from '../color/semanticTokens';
import { PALETTE_ROLE_ORDER } from '../color/roleTypes';
import { tokenNameForPaletteRole } from '../color/semanticRoleProjection';
import { validateRolePalette } from '../color/rolePaletteGenerated';
import { projectSemanticTokensToRolePalette } from '../color/semanticRoleProjection';

import { buildExampleWorkspaceSnapshot } from './exampleWorkspace';
import { deserializeWorkspace, serializeWorkspace } from './workspaceSnapshot';

describe('example workspace snapshot', () => {
  it('returns a fresh object each call (no shared mutable state)', () => {
    const first = buildExampleWorkspaceSnapshot();
    const second = buildExampleWorkspaceSnapshot();

    expect(first).not.toBe(second);
    expect(first.extractedColors).not.toBe(second.extractedColors);
    expect(first).toEqual(second);
  });

  it('round-trips through the versioned serializer', () => {
    const snapshot = buildExampleWorkspaceSnapshot();

    expect(deserializeWorkspace(serializeWorkspace(snapshot))).toEqual(snapshot);
  });

  it('derives a gap-free, valid core role palette in both themes', () => {
    const snapshot = buildExampleWorkspaceSnapshot();

    for (const theme of ['light', 'dark'] as const) {
      const tokens = deriveSemanticTokens({
        extracted: snapshot.extractedColors,
        overrides: snapshot.tokenOverridesByTheme[theme],
        theme,
        neutralStyle: snapshot.neutralStyle,
        vibrancy: snapshot.savedVibrancy,
        paletteType: snapshot.paletteType,
      });

      for (const role of PALETTE_ROLE_ORDER) {
        expect(tokens[tokenNameForPaletteRole(role)].gap, `${theme}:${role}`).toBeFalsy();
      }

      expect(validateRolePalette(projectSemanticTokensToRolePalette(tokens)).ok).toBe(true);
    }
  });
});
