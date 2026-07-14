'use client';

import { useMemo } from 'react';

import { normalizeHex } from '@lib/color/normalizeHex';
import type { SelectableColor } from '@lib/color/selectableColors';
import { getSemanticTokenContrastInfo } from '@lib/color/semanticTokenTargets';
import type { SemanticTokenName, SemanticTokens } from '@lib/color/semanticTokens';
import { UI_SYSTEM_ROLES } from '@lib/color/uiColorPanel';
import { EXPRESSIVE_TOKEN_NAMES } from '@lib/color/uiExpressiveGaps';

import { InlineSystemRolePicker } from './InlineSystemRolePicker';
import { UiColorComposition } from './UiColorComposition';
import { UiColorSectionHeader } from './UiColorSectionHeader';

export function UiSystemSection({
  tokens,
  colors,
  neutralSteps,
  openToken,
  loadPercent,
  onToggle,
  onSelect,
}: {
  tokens: SemanticTokens;
  colors: SelectableColor[];
  neutralSteps: Array<{ lightness: number; hex: string }>;
  openToken: SemanticTokenName | null;
  loadPercent: number;
  onToggle: (token: SemanticTokenName) => void;
  onSelect: (token: SemanticTokenName, hex: string) => void;
}) {
  const sourceHexes = useMemo(
    () => new Set(colors.map((color) => normalizeHex(color.hex))),
    [colors],
  );

  return (
    <section aria-labelledby="ui-system-title">
      <UiColorSectionHeader title="Sistema" />
      <h2 id="ui-system-title" className="sr-only">Sistema de color</h2>
      <UiColorComposition tokens={tokens} loadPercent={loadPercent} />
      <ul className="mt-2 overflow-hidden rounded-lg border border-border bg-bg">
        {UI_SYSTEM_ROLES.map((role, index) => {
          const token = tokens[role.token];
          const contrast = role.contrast
            ? getSemanticTokenContrastInfo(tokens, role.token)
            : null;
          const isOpen = openToken === role.token;
          const unassigned = EXPRESSIVE_TOKEN_NAMES.includes(role.token as typeof EXPRESSIVE_TOKEN_NAMES[number]) && Boolean(token.gap);
          const fromSource = sourceHexes.has(normalizeHex(token.hex));

          return (
            <li key={role.token} className={index > 0 ? 'border-t border-border' : ''}>
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => onToggle(role.token)}
                className={`flex min-h-12 w-full items-center gap-2 px-2.5 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-primary/25 ${isOpen ? 'bg-surface' : 'hover:bg-surface-raised'}`}
              >
                <span
                  className={`size-[26px] shrink-0 rounded-md ${unassigned ? 'border border-dashed border-muted/60' : 'ring-1 ring-inset ring-ink/10'}`}
                  style={unassigned ? {
                    backgroundImage: 'repeating-linear-gradient(135deg, transparent 0 4px, color-mix(in oklch, var(--color-muted) 22%, transparent) 4px 6px)',
                    backgroundColor: 'var(--color-surface-raised)',
                  } : { backgroundColor: token.hex }}
                  aria-hidden="true"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[0.78125rem] font-semibold text-ink">{role.label}</span>
                  <span className={`block text-[0.65625rem] text-muted ${unassigned ? 'font-sans' : 'font-mono tabular-nums'}`}>
                    {unassigned ? 'Sin asignar' : token.hex.toUpperCase()}
                  </span>
                </span>
                {!unassigned ? <span className={`rounded-full px-1.5 py-0.5 text-[0.625rem] font-medium ${fromSource ? 'bg-[var(--chrome-green-soft)] text-[var(--chrome-green)]' : 'bg-surface-raised text-muted'}`}>
                  {fromSource ? 'fuente' : 'derivado'}
                </span> : null}
                {contrast && !unassigned ? (
                  <span className={`shrink-0 font-mono text-[0.65625rem] font-semibold tabular-nums ${contrast.status === 'pass' ? 'text-pass' : 'text-fail'}`}>
                    {contrast.ratio.toFixed(1)}:1 {contrast.status === 'pass' ? '✓' : '⚠'}
                  </span>
                ) : null}
                <Chevron open={isOpen} />
              </button>
              {isOpen ? (
                <InlineSystemRolePicker
                  tokenName={role.token}
                  currentHex={token.hex}
                  colors={colors}
                  neutralSteps={neutralSteps}
                  unassigned={unassigned}
                  roleLabel={role.label}
                  onSelect={(hex) => onSelect(role.token, hex)}
                  onContinueWithout={() => onToggle(role.token)}
                />
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className={`size-3 shrink-0 text-muted transition-transform duration-200 motion-reduce:transition-none ${open ? 'rotate-180' : ''}`}>
      <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
