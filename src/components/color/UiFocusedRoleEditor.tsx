'use client';

import { useMemo, useState } from 'react';

import { normalizeHex } from '@lib/color/normalizeHex';
import type { SelectableColor } from '@lib/color/selectableColors';
import type { SemanticTokenName, SemanticTokens } from '@lib/color/semanticTokens';

import { InlineTokenDerivationEditor } from './InlineTokenDerivationEditor';
import type { CompactRoleDefinition } from './uiColorPanelGroups';

export function UiFocusedRoleEditor({
  roles,
  activeToken,
  tokens,
  colors,
  onActivate,
  onSelect,
}: {
  roles: readonly CompactRoleDefinition[];
  activeToken: SemanticTokenName;
  tokens: SemanticTokens;
  colors: SelectableColor[];
  onActivate: (token: SemanticTokenName) => void;
  onSelect: (token: SemanticTokenName, hex: string) => void;
}) {
  const [originals] = useState<Partial<Record<SemanticTokenName, string>>>(() =>
    Object.fromEntries(roles.map((role) => [role.token, tokens[role.token].hex])),
  );
  const [candidateDrafts, setCandidateDrafts] = useState<Partial<Record<SemanticTokenName, string>>>({});
  const [appliedVariants, setAppliedVariants] = useState<Partial<Record<SemanticTokenName, string>>>({});
  const uniqueColors = useMemo(() => uniqueByHex(colors), [colors]);
  const sourceHexes = useMemo(
    () => new Set(uniqueColors.map((color) => normalizeHex(color.hex))),
    [uniqueColors],
  );

  return (
    <ul className="divide-y divide-line-soft" aria-label="Roles editables">
      {roles.map((role) => {
        const token = tokens[role.token];
        const active = activeToken === role.token;
        const unassigned = Boolean(token.gap);
        const origin = token.source === 'extracted' || sourceHexes.has(normalizeHex(token.hex))
          ? 'fuente'
          : 'sintético';
        const originalHex = originals[role.token] ?? token.hex;
        const candidateDraft = candidateDrafts[role.token];

        return (
          <li key={role.token}>
            <button
              type="button"
              aria-expanded={active}
              onClick={() => onActivate(role.token)}
              className={`grid min-h-[3.75rem] w-full grid-cols-[34px_minmax(0,1fr)_auto] items-center gap-3 rounded-lg px-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-forest/25 ${active ? 'bg-line-soft' : 'hover:bg-line-soft/70'}`}
            >
              <span
                className={`size-[34px] rounded-full ${unassigned ? 'border border-dashed border-attention' : 'ring-1 ring-inset ring-ink/10'}`}
                style={unassigned ? {
                  background: 'repeating-linear-gradient(45deg,#fff,#fff 4px,#fbf1e4 4px,#fbf1e4 8px)',
                } : { backgroundColor: token.hex }}
                aria-hidden="true"
              />
              <span className="min-w-0">
                <span className={`block truncate text-base font-semibold ${unassigned ? 'text-attention' : 'text-ink'}`}>{role.label}</span>
                <span className={`block text-[0.71875rem] ${unassigned ? 'text-attention' : 'font-mono tabular-nums text-faint'}`}>
                  {unassigned ? 'Sin asignar' : token.hex.toUpperCase()}
                </span>
              </span>
              <span className="rounded-full bg-bg px-2 py-1 text-[0.625rem] font-semibold text-muted ring-1 ring-inset ring-line">
                {origin}
              </span>
            </button>

            {active ? (
              <div className="space-y-4 px-2 pb-5 pt-3">
                <section aria-label={`Candidatos para ${role.label}`}>
                  <p className="mb-2 text-[0.71875rem] font-semibold text-muted">Candidatos de tu imagen</p>
                  <div className="flex flex-wrap gap-2">
                    {uniqueColors.map((color) => {
                      const selected = normalizeHex(color.hex) === normalizeHex(candidateDraft ?? token.hex);
                      return (
                        <button
                          key={color.id}
                          type="button"
                          title={`${color.name} · ${color.hex.toUpperCase()}`}
                          aria-label={`Usar ${color.name} como ${role.label}`}
                          aria-pressed={selected}
                          onClick={() => {
                            setCandidateDrafts((current) => ({ ...current, [role.token]: color.hex }));
                            setAppliedVariants((current) => {
                              const next = { ...current };
                              delete next[role.token];
                              return next;
                            });
                          }}
                          className={`size-[30px] rounded-full ring-offset-2 ring-offset-bg transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-forest/25 motion-reduce:transition-none ${selected ? 'ring-2 ring-forest' : 'ring-1 ring-inset ring-ink/15'}`}
                          style={{ backgroundColor: color.hex }}
                        />
                      );
                    })}
                  </div>
                </section>

                <InlineTokenDerivationEditor
                  key={`${role.token}-${token.hex}-${candidateDraft ?? ''}`}
                  tokenName={role.token}
                  originalHex={originalHex}
                  currentHex={token.hex}
                  candidateHex={candidateDraft}
                  applied={Boolean(appliedVariants[role.token])
                    && normalizeHex(appliedVariants[role.token]!) === normalizeHex(token.hex)}
                  onApply={(hex) => {
                    onSelect(role.token, hex);
                    setCandidateDrafts((current) => {
                      const next = { ...current };
                      delete next[role.token];
                      return next;
                    });
                    setAppliedVariants((current) => ({ ...current, [role.token]: hex }));
                  }}
                  onDraftChange={() => setAppliedVariants((current) => {
                    const next = { ...current };
                    delete next[role.token];
                    return next;
                  })}
                />
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

function uniqueByHex(colors: SelectableColor[]): SelectableColor[] {
  const seen = new Set<string>();
  return colors.filter((color) => {
    const hex = normalizeHex(color.hex);
    if (seen.has(hex)) return false;
    seen.add(hex);
    return true;
  });
}
