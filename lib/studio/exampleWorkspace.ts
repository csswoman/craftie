import type { WorkspaceSnapshot } from './workspaceSnapshot';

/**
 * Deterministic example workspace used to greet first-time visitors with a
 * populated palette instead of an empty canvas. Values are an original Craftie
 * sample (a warm terracotta + sage pairing), not copied from any third party.
 *
 * Framework- and browser-agnostic: it only assembles a plain WorkspaceSnapshot
 * so the same object can be applied through the normal RolePaletteContext
 * restore path the share link and saved projects already use.
 */

const EXAMPLE_LIGHT_OVERRIDES = {
  background: '#faf7f2',
  surface: '#ffffff',
  'on-background': '#2b2724',
  'on-background-muted': '#6f6a63',
  primary: '#1f6f54',
  secondary: '#c2653a',
  accent: '#d99a28',
  border: '#e4ddd2',
} as const;

const EXAMPLE_DARK_OVERRIDES = {
  background: '#171513',
  surface: '#211e1b',
  'on-background': '#f3efe8',
  'on-background-muted': '#b2aba0',
  primary: '#5bbf99',
  secondary: '#e08a5c',
  accent: '#e8b64d',
  border: '#33302b',
} as const;

const EXAMPLE_EXTRACTED: ReadonlyArray<{ hex: string; prominence: number }> = [
  { hex: '#1f6f54', prominence: 1 },
  { hex: '#c2653a', prominence: 0.82 },
  { hex: '#d99a28', prominence: 0.64 },
  { hex: '#faf7f2', prominence: 0.46 },
  { hex: '#2b2724', prominence: 0.28 },
];

/** Build the first-load example snapshot. Returns a fresh object each call. */
export function buildExampleWorkspaceSnapshot(): WorkspaceSnapshot {
  return {
    tokenOverridesByTheme: {
      light: { ...EXAMPLE_LIGHT_OVERRIDES },
      dark: { ...EXAMPLE_DARK_OVERRIDES },
    },
    clearedSemanticTokens: [],
    roleNames: {},
    lockedRolesByTheme: { light: [], dark: [] },
    savedVibrancy: 50,
    neutralStyle: 'tinted',
    forcedStatusSources: {},
    forcedStatusColors: {},
    extractedColors: EXAMPLE_EXTRACTED.map((color) => ({ ...color })),
    paletteType: 'vivid',
    illustrationSeed: 1,
  };
}
