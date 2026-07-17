'use client';

import { useEffect, useMemo, useState } from 'react';

import { normalizeHex } from '@lib/color/normalizeHex';
import type { SelectableColor } from '@lib/color/selectableColors';
import {
  buildUiStatusCandidates,
  STATUS_COLOR_DEFINITIONS,
  type UiStatusColor,
  type UiStatusColorSet,
  type UiStatusRole,
} from '@lib/color/uiStatusColors';

import { useRolePalette } from '@/context/RolePaletteContext';

import { UiStatusAdjustmentControls } from './UiStatusAdjustmentControls';

const STATUS_LABELS: Record<UiStatusRole, string> = {
  success: 'Éxito',
  warning: 'Advertencia',
  danger: 'Peligro',
};

const ORIGIN_LABELS = {
  found: {
    short: 'Imagen',
    detail: 'Tomado de un color de tu imagen',
  },
  'found-adjusted': {
    short: 'Ajustado',
    detail: 'Partió de tu imagen y se afinó L o chroma',
  },
  synthetic: {
    short: 'Generado',
    detail: 'Creado por Craftie para cubrir el hue del estado',
  },
} as const;

export function UiFocusedStatusEditor({
  colors,
  statusColors,
  backgroundHex,
  initialRole,
  onSelect,
}: {
  colors: SelectableColor[];
  statusColors: UiStatusColorSet;
  backgroundHex: string;
  initialRole: UiStatusRole | null;
  onSelect: (status: UiStatusColor) => void;
}) {
  const { setTokenEditPreview, clearTokenEditPreview } = useRolePalette();
  const [activeRole, setActiveRole] = useState<UiStatusRole | null>(initialRole);
  const [prevInitialRole, setPrevInitialRole] = useState(initialRole);
  const [originals] = useState<UiStatusColorSet>(() => statusColors);
  const [candidateDrafts, setCandidateDrafts] = useState<Partial<Record<UiStatusRole, UiStatusColor>>>({});
  const [appliedVariants, setAppliedVariants] = useState<Partial<Record<UiStatusRole, string>>>({});
  const nameByHex = useMemo(
    () => new Map(colors.map((color) => [normalizeHex(color.hex), color.name])),
    [colors],
  );

  if (initialRole !== prevInitialRole) {
    setPrevInitialRole(initialRole);
    setActiveRole(initialRole);
  }

  useEffect(() => () => {
    clearTokenEditPreview();
  }, [clearTokenEditPreview]);

  function collapseAfterCommit(role: UiStatusRole, nextStatus: UiStatusColor) {
    onSelect(nextStatus);
    setCandidateDrafts((current) => {
      const next = { ...current };
      delete next[role];
      return next;
    });
    setAppliedVariants((current) => ({ ...current, [role]: nextStatus.hex }));
    clearTokenEditPreview();
    setActiveRole(null);
  }

  return (
    <ul className="space-y-2" aria-label="Colores de estado editables">
      {STATUS_COLOR_DEFINITIONS.map(({ role }) => {
        const status = statusColors[role];
        const candidateDraft = candidateDrafts[role];
        const active = role === activeRole;
        const origin = ORIGIN_LABELS[status.origin];
        const candidates = active ? buildUiStatusCandidates({
          role,
          colors: colors.map((color) => ({ hex: color.hex, prominence: color.prominence ?? 1 })),
          backgroundHex,
          current: status,
        }) : [];

        return (
          <li
            key={role}
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
                  setActiveRole(null);
                  return;
                }

                setActiveRole(role);
              }}
              className={`grid min-h-12 w-full grid-cols-[34px_minmax(0,1fr)_auto] items-center gap-3 px-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-forest/25 ${
                active ? 'bg-surface' : 'hover:bg-line-soft/70'
              }`}
            >
              <span
                className="size-[34px] rounded-full ring-1 ring-inset ring-ink/10"
                style={{ backgroundColor: status.hex }}
                aria-hidden="true"
              />
              <span className="min-w-0">
                <span className="block truncate text-tools-role text-ink">{STATUS_LABELS[role]}</span>
                <span className="block font-mono text-tools-meta-scale tabular-nums text-muted">
                  {status.hex.toUpperCase()}
                </span>
              </span>
              <span
                title={origin.detail}
                className="shrink-0 rounded-full bg-bg px-2.5 py-1 text-tools-meta-scale font-semibold text-muted ring-1 ring-inset ring-line"
              >
                {origin.short}
              </span>
            </button>

            {active ? (
              <div className="space-y-3 border-t border-line-soft px-2.5 pb-3 pt-3">
                <section aria-label={`Candidatos para ${STATUS_LABELS[role]}`}>
                  <p className="mb-2 text-tools-meta-scale font-semibold text-muted">
                    Candidatos de tu imagen
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {candidates.map((candidate) => {
                      const selected = normalizeHex(candidate.hex) === normalizeHex(candidateDraft?.hex ?? status.hex);
                      const name = candidate.sourceHex
                        ? nameByHex.get(normalizeHex(candidate.sourceHex)) ?? candidate.label
                        : candidate.label;
                      return (
                        <button
                          key={candidate.id}
                          type="button"
                          title={`${name} · ${candidate.hex.toUpperCase()}`}
                          aria-label={`Usar ${name} para ${STATUS_LABELS[role]}`}
                          aria-pressed={selected}
                          onClick={() => {
                            setCandidateDrafts((current) => ({ ...current, [role]: candidate }));
                            setAppliedVariants((current) => {
                              const next = { ...current };
                              delete next[role];
                              return next;
                            });
                            setTokenEditPreview({
                              kind: 'status',
                              role,
                              status: candidate,
                            });
                          }}
                          className={`size-8 rounded-full ring-offset-2 ring-offset-bg transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-forest/25 motion-reduce:transition-none ${selected ? 'ring-2 ring-forest' : 'ring-1 ring-inset ring-ink/15'}`}
                          style={{ backgroundColor: candidate.hex }}
                        />
                      );
                    })}
                  </div>
                </section>

                <UiStatusAdjustmentControls
                  key={`${status.hex}-${candidateDraft?.hex ?? ''}`}
                  status={candidateDraft ?? status}
                  currentHex={status.hex}
                  original={originals[role]}
                  backgroundHex={backgroundHex}
                  candidateSelected={Boolean(candidateDraft)}
                  applied={Boolean(appliedVariants[role])
                    && normalizeHex(appliedVariants[role]!) === normalizeHex(status.hex)}
                  onApply={(nextStatus) => collapseAfterCommit(role, nextStatus)}
                  onDraftChange={() => setAppliedVariants((current) => {
                    const next = { ...current };
                    delete next[role];
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
