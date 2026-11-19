import { contrastRatio } from '../utils/colorMath';
import {
  resolveThemeColor,
  type ThemeCssVariables,
  type ThemeMode,
} from './themeCssVariables';

/**
 * Audits a shadcn/ui theme the way its components use it: each `*-foreground`
 * is read on its surface, muted text sits on the page and on muted blocks,
 * and the focus ring must stand out from the page (WCAG 1.4.11, 3:1).
 */

export type ShadcnPairKind = 'text' | 'non-text';

export type ShadcnContrastPair = {
  id: string;
  foreground: string;
  background: string;
  kind: ShadcnPairKind;
};

export const SHADCN_CONTRAST_PAIRS: readonly ShadcnContrastPair[] = [
  { id: 'page', foreground: 'foreground', background: 'background', kind: 'text' },
  { id: 'card', foreground: 'card-foreground', background: 'card', kind: 'text' },
  { id: 'popover', foreground: 'popover-foreground', background: 'popover', kind: 'text' },
  { id: 'primary', foreground: 'primary-foreground', background: 'primary', kind: 'text' },
  { id: 'secondary', foreground: 'secondary-foreground', background: 'secondary', kind: 'text' },
  { id: 'accent', foreground: 'accent-foreground', background: 'accent', kind: 'text' },
  { id: 'muted-on-page', foreground: 'muted-foreground', background: 'background', kind: 'text' },
  { id: 'muted-on-muted', foreground: 'muted-foreground', background: 'muted', kind: 'text' },
  { id: 'destructive', foreground: 'destructive', background: 'background', kind: 'text' },
  { id: 'ring', foreground: 'ring', background: 'background', kind: 'non-text' },
];

const REQUIRED: Record<ShadcnPairKind, number> = { text: 4.5, 'non-text': 3 };

export type ShadcnPairResult = ShadcnContrastPair & {
  mode: ThemeMode;
  foregroundHex: string;
  backgroundHex: string;
  ratio: number;
  required: number;
  passes: boolean;
};

export type ShadcnThemeAudit = {
  /** Modes the stylesheet actually defines (dark only when it has dark overrides). */
  modes: ThemeMode[];
  results: ShadcnPairResult[];
  /** Pair ids that could not be checked in a mode because a variable is missing or not a color. */
  missing: Array<{ mode: ThemeMode; id: string }>;
  failures: number;
};

export function auditShadcnTheme(vars: ThemeCssVariables): ShadcnThemeAudit {
  const modes: ThemeMode[] = Object.keys(vars.dark).length > 0 ? ['light', 'dark'] : ['light'];
  const results: ShadcnPairResult[] = [];
  const missing: ShadcnThemeAudit['missing'] = [];

  for (const mode of modes) {
    for (const pair of SHADCN_CONTRAST_PAIRS) {
      const foregroundHex = resolveThemeColor(vars, mode, pair.foreground);
      const backgroundHex = resolveThemeColor(vars, mode, pair.background);
      if (!foregroundHex || !backgroundHex) {
        missing.push({ mode, id: pair.id });
        continue;
      }
      const ratio = contrastRatio(foregroundHex, backgroundHex);
      const required = REQUIRED[pair.kind];
      results.push({ ...pair, mode, foregroundHex, backgroundHex, ratio, required, passes: ratio >= required });
    }
  }

  return { modes, results, missing, failures: results.filter((result) => !result.passes).length };
}
