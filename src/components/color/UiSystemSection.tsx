'use client';

import { useMemo } from 'react';

import { normalizeHex } from '@lib/color/normalizeHex';
import type { SelectableColor } from '@lib/color/selectableColors';
import { getSemanticTokenContrastInfo } from '@lib/color/semanticTokenTargets';
import type { SemanticTokenName, SemanticTokens } from '@lib/color/semanticTokens';
import {
  colorUseForSystemToken,
  systemTokenFitness,
  UI_SYSTEM_ROLES,
} from '@lib/color/uiColorPanel';
import { deriveFromPrimary } from '@lib/color/uiColorCandidates';
import { EXPRESSIVE_TOKEN_NAMES } from '@lib/color/uiExpressiveGaps';

import { InlineSystemRolePicker } from './InlineSystemRolePicker';
import { UiColorComposition } from './UiColorComposition';
import { UiColorSectionHeader } from './UiColorSectionHeader';

const SYSTEM_ROLE_GROUPS = [
  { label: 'Fundaciones', roles: UI_SYSTEM_ROLES.slice(0, 3) },
  { label: 'Texto', roles: UI_SYSTEM_ROLES.slice(3, 5) },
  { label: 'Color de marca', roles: UI_SYSTEM_ROLES.slice(5) },
] as const;

export function UiSystemSection({
  tokens,
  colors,
  neutralSteps,
  openToken,
  loadPercent,
  mobile = false,
  onToggle,
  onSelect,
}: {
  tokens: SemanticTokens;
  colors: SelectableColor[];
  neutralSteps: Array<{ lightness: number; hex: string }>;
  openToken: SemanticTokenName | null;
  loadPercent: number;
  mobile?: boolean;
  onToggle: (token: SemanticTokenName) => void;
  onSelect: (token: SemanticTokenName, hex: string) => void;
}) {
  const sourceHexes = useMemo(
    () => new Set(colors.map((color) => normalizeHex(color.hex))),
    [colors],
  );
  const unassignedRoles = UI_SYSTEM_ROLES.filter((role) => Boolean(tokens[role.token].gap));

  function jumpToFirstGap() {
    const first = unassignedRoles[0];
    if (!first) return;
    onToggle(first.token);
    requestAnimationFrame(() => {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      document.getElementById(`ui-role-${first.token}`)?.scrollIntoView({
        behavior: reduceMotion ? 'auto' : 'smooth',
        block: 'nearest',
      });
    });
  }

  return (
    <section aria-labelledby="ui-system-title">
      <div className={`${mobile ? '' : 'sticky top-0 z-sticky '} -mx-1 border-b border-border bg-bg px-1 pb-3`}>
        <UiColorSectionHeader title="Sistema" />
        <h2 id="ui-system-title" className="sr-only">Sistema de color</h2>
        <UiColorComposition tokens={tokens} loadPercent={loadPercent} />
        {unassignedRoles.length > 0 ? (
          <button
            type="button"
            onClick={jumpToFirstGap}
            className="mt-2 min-h-9 w-full rounded-md bg-[#FFF4D6] px-2.5 text-left text-tools-meta font-semibold text-[#6B4700] hover:bg-[#FCE9B6] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 dark:bg-[#4A3A16] dark:text-[#F7D98A]"
          >
            <span aria-hidden="true">⚠ </span>{unassignedRoles.length} {unassignedRoles.length === 1 ? 'rol sin asignar' : 'roles sin asignar'} · revisar
          </button>
        ) : null}
      </div>
      <div className="mt-4 space-y-4">
        {SYSTEM_ROLE_GROUPS.map((group) => (
          <section key={group.label} aria-labelledby={`ui-role-group-${group.label.replaceAll(' ', '-').toLowerCase()}`}>
            <h3
              id={`ui-role-group-${group.label.replaceAll(' ', '-').toLowerCase()}`}
              className="mb-2 text-tools-meta font-semibold text-ink"
            >
              {group.label}
            </h3>
            <ul className="overflow-hidden rounded-lg border border-border bg-bg">
              {group.roles.map((role, index) => {
          const token = tokens[role.token];
          const contrast = role.contrast
            ? getSemanticTokenContrastInfo(tokens, role.token)
            : null;
          const isOpen = openToken === role.token;
          const unassigned = EXPRESSIVE_TOKEN_NAMES.includes(role.token as typeof EXPRESSIVE_TOKEN_NAMES[number]) && Boolean(token.gap);
          const fromSource = sourceHexes.has(normalizeHex(token.hex));
          const fitness = systemTokenFitness(tokens, role.token);
          const origin = fromSource || token.source === 'extracted'
            ? 'fuente'
            : token.source === 'derived'
              ? 'sintético'
              : 'derivado';
          const useLabel = fitness.use === 'fill'
            ? 'Fill'
            : fitness.use === 'accent'
              ? 'Acento'
              : fitness.use === 'text'
                ? 'Texto'
                : 'Superficie';
          const fitnessRatio = contrast?.ratio ?? fitness.result.ratio;

          return (
            <li id={`ui-role-${role.token}`} key={role.token} className={index > 0 ? 'border-t border-border' : ''}>
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => onToggle(role.token)}
                className={`flex min-h-12 w-full items-center gap-2 px-2.5 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-primary/25 ${isOpen ? 'bg-surface' : 'hover:bg-surface-raised'}`}
              >
                {unassigned ? <span className="shrink-0 text-[#8A5A00] dark:text-[#F7D98A]" aria-label="Requiere atención">⚠</span> : null}
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
                {!unassigned ? <span className={`hidden rounded-full px-1.5 py-0.5 text-[0.625rem] font-medium sm:inline ${origin === 'fuente' ? 'text-[var(--chrome-green)]' : 'text-muted'}`}>
                  {origin}
                </span> : null}
                {!unassigned ? (
                  <span
                    className={`shrink-0 rounded-md px-1.5 py-1 text-[0.625rem] font-semibold ${fitness.result.ok ? 'bg-[var(--chrome-green-soft)] text-[var(--chrome-green)]' : 'bg-surface-raised text-muted'}`}
                    aria-label={`${fitness.result.ok ? 'Apto' : 'No apto'} para ${useLabel}${fitnessRatio === undefined ? '' : `, contraste ${fitnessRatio.toFixed(1)} a 1`}`}
                  >
                    {fitness.result.ok ? '✓' : '✕'}<span className={isOpen ? '' : 'sr-only'}> {useLabel}{fitnessRatio === undefined ? '' : ` · ${fitnessRatio.toFixed(1)}:1`}</span>
                  </span>
                ) : null}
                <Chevron open={isOpen} />
              </button>
              {isOpen ? (
                <InlineSystemRolePicker
                  tokenName={role.token}
                  currentHex={token.hex}
                  tokens={tokens}
                  colors={colors}
                  neutralSteps={neutralSteps}
                  unassigned={unassigned}
                  roleLabel={role.label}
                  relevantUse={colorUseForSystemToken(role.token)}
                  onSelect={(hex) => onSelect(role.token, hex)}
                  onDeriveFromPrimary={() => onSelect(role.token, deriveFromPrimary(tokens.primary.hex))}
                  onContinueWithout={() => onToggle(role.token)}
                />
              ) : null}
            </li>
          );
              })}
            </ul>
          </section>
        ))}
      </div>
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
