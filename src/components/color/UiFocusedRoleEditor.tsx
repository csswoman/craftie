'use client';

import { useEffect, useMemo, useState } from 'react';

import { normalizeHex } from '@lib/color/normalizeHex';
import type { SelectableColor } from '@lib/color/selectableColors';
import type { SemanticTokenName, SemanticTokens } from '@lib/color/semanticTokens';

import { useRolePalette } from '@/context/RolePaletteContext';

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
  activeToken: SemanticTokenName | null;
  tokens: SemanticTokens;
  colors: SelectableColor[];
  onActivate: (token: SemanticTokenName | null) => void;
  onSelect: (token: SemanticTokenName, hex: string) => void;
}) {
  const { setTokenEditPreview, clearTokenEditPreview } = useRolePalette();
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

  useEffect(() => () => {
    clearTokenEditPreview();
  }, [clearTokenEditPreview]);

  function collapseAfterCommit(tokenName: SemanticTokenName, hex: string) {
    onSelect(tokenName, hex);
    setCandidateDrafts((current) => {
      const next = { ...current };
      delete next[tokenName];
      return next;
    });
    setAppliedVariants((current) => ({ ...current, [tokenName]: hex }));
    clearTokenEditPreview();
    onActivate(null);
  }

  return (
    <ul className="space-y-2" aria-label="Roles editables">
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
          <li
            key={role.token}
            className={`overflow-hidden rounded-lg border transition-colors ${
              active
                ? 'border-forest/35 bg-bg shadow-[var(--shadow-float)]'
                : 'border-transparent hover:border-line-soft'
            }`}
          >
            <button
              type="button"
              aria-expanded={active}
              onClick={() => {
                if (active) {
                  clearTokenEditPreview();
                  onActivate(null);
                  return;
                }

                onActivate(role.token);
              }}
              className={`grid min-h-12 w-full grid-cols-[34px_minmax(0,1fr)_auto] items-center gap-3 px-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-forest/25 ${
                active ? 'bg-surface' : 'hover:bg-line-soft/70'
              }`}
            >
              <span
                className={`size-[34px] rounded-full ${unassigned ? 'border border-dashed border-attention' : 'ring-1 ring-inset ring-ink/10'}`}
                style={unassigned ? {
                  background: 'repeating-linear-gradient(45deg,#fff,#fff 4px,#fbf1e4 4px,#fbf1e4 8px)',
                } : { backgroundColor: token.hex }}
                aria-hidden="true"
              />
              <span className="min-w-0">
                <span className={`block truncate text-tools-role ${unassigned ? 'text-attention' : 'text-ink'}`}>
                  {role.label}
                </span>
                <span className={`block text-tools-meta-scale ${unassigned ? 'text-attention' : 'font-mono tabular-nums text-muted'}`}>
                  {unassigned ? 'Sin asignar' : token.hex.toUpperCase()}
                </span>
              </span>
              <span className="rounded-full bg-bg px-2 py-1 text-tools-micro font-semibold text-muted ring-1 ring-inset ring-line">
                {origin}
              </span>
            </button>

            {active ? (
              <div className="space-y-3 border-t border-line-soft px-2.5 pb-3 pt-3">
                <section aria-label={`Candidatos para ${role.label}`}>
                  <p className="mb-2 text-tools-meta-scale font-semibold text-muted">
                    Candidatos de tu imagen
                  </p>
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
                            setTokenEditPreview({
                              kind: 'token',
                              tokenName: role.token,
                              hex: color.hex,
                            });
                          }}
                          className={`size-8 rounded-full ring-offset-2 ring-offset-bg transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-forest/25 motion-reduce:transition-none ${selected ? 'ring-2 ring-forest' : 'ring-1 ring-inset ring-ink/15'}`}
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
                  onApply={(hex) => collapseAfterCommit(role.token, hex)}
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
