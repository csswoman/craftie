'use client';

import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';

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
  mobile: _mobile = false,
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
      <h2 id="ui-system-title" className="sr-only">Sistema de color</h2>
      <PanelSection label="Composición" aside="del sistema" first>
        <UiColorComposition tokens={tokens} loadPercent={loadPercent} />
        {unassignedRoles.length > 0 ? (
          <button
            type="button"
            onClick={jumpToFirstGap}
            className="mt-3 min-h-9 w-full rounded-md bg-[#FFF4D6] px-2.5 text-left text-tools-meta-scale font-semibold text-[#6B4700] hover:bg-[#FCE9B6] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 dark:bg-[#4A3A16] dark:text-[#F7D98A]"
          >
            <span aria-hidden="true">⚠ </span>{unassignedRoles.length} {unassignedRoles.length === 1 ? 'rol sin asignar' : 'roles sin asignar'} · revisar
          </button>
        ) : null}
      </PanelSection>
      {SYSTEM_ROLE_GROUPS.map((group) => (
        <PanelSection
          key={group.label}
          label={group.label}
          aside={`${group.roles.length} roles`}
          collapsible
        >
          <ul aria-label={group.label} className="divide-y divide-border">
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
            <li id={`ui-role-${role.token}`} key={role.token}>
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => onToggle(role.token)}
                className={`grid min-h-14 w-full grid-cols-[30px_minmax(0,1fr)_auto] items-center gap-3 rounded-[9px] px-1 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-primary/25 ${isOpen ? 'bg-surface' : 'hover:bg-surface-raised'}`}
              >
                <span
                  className={`size-[30px] shrink-0 rounded-lg ${unassigned ? 'border border-dashed border-muted/60' : 'ring-1 ring-inset ring-ink/10'}`}
                  style={unassigned ? {
                    backgroundImage: 'repeating-linear-gradient(135deg, transparent 0 4px, color-mix(in oklch, var(--color-muted) 22%, transparent) 4px 6px)',
                    backgroundColor: 'var(--color-surface-raised)',
                  } : { backgroundColor: token.hex }}
                  aria-label={unassigned ? 'Rol sin asignar' : undefined}
                  aria-hidden={unassigned ? undefined : true}
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-tools-role text-ink">{role.label}</span>
                  <span className={`mt-0.5 block text-tools-meta-scale tracking-[0.02em] text-muted ${unassigned ? 'font-sans' : 'font-mono tabular-nums'}`}>
                    {unassigned ? 'Sin asignar' : token.hex.toUpperCase()}
                  </span>
                </span>
                <span className="flex items-center justify-end gap-2">
                  {!unassigned ? <span className={`whitespace-nowrap rounded-full bg-surface-raised px-[7px] py-[3px] text-tools-micro ${origin === 'fuente' ? 'text-[var(--chrome-green)]' : 'text-muted'}`}>
                    {origin}
                  </span> : null}
                  {!unassigned ? (
                    <span
                      className={`flex size-[18px] shrink-0 items-center justify-center rounded-full text-tools-micro font-bold ${fitness.result.ok ? 'bg-[var(--chrome-green-soft)] text-[var(--chrome-green)]' : 'bg-surface-raised text-muted'}`}
                      aria-label={`${fitness.result.ok ? 'Apto' : 'No apto'} para ${useLabel}${fitnessRatio === undefined ? '' : `, contraste ${fitnessRatio.toFixed(1)} a 1`}`}
                    >
                      {fitness.result.ok ? '✓' : '×'}<span className="sr-only"> {useLabel}{fitnessRatio === undefined ? '' : ` · ${fitnessRatio.toFixed(1)}:1`}</span>
                    </span>
                  ) : null}
                  <Chevron open={isOpen} />
                </span>
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
        </PanelSection>
      ))}
    </section>
  );
}

function PanelSection({
  label,
  aside,
  children,
  first = false,
  collapsible = false,
}: {
  label: string;
  aside?: string;
  children: ReactNode;
  first?: boolean;
  collapsible?: boolean;
}) {
  const [open, setOpen] = useState(true);

  return (
    <section className={`py-3 ${first ? 'pt-1' : 'border-t border-border'}`}>
      {collapsible ? (
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className="mb-2 flex min-h-8 w-full items-center justify-between gap-3 rounded-md text-left focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
        >
          <span className="flex items-center gap-1.5">
            <h3 className="text-tools-section-label uppercase text-muted">{label}</h3>
            <Chevron open={open} />
          </span>
          {aside ? <span className="text-tools-meta-scale font-semibold text-muted">{aside}</span> : null}
        </button>
      ) : (
        <div className="mb-2 flex items-baseline justify-between">
          <h3 className="text-tools-section-label uppercase text-muted">{label}</h3>
          {aside ? <span className="text-tools-meta-scale font-semibold text-muted">{aside}</span> : null}
        </div>
      )}
      {!collapsible || open ? children : null}
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
