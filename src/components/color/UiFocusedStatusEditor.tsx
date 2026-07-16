'use client';

import { useMemo, useState } from 'react';

import { normalizeHex } from '@lib/color/normalizeHex';
import type { SelectableColor } from '@lib/color/selectableColors';
import {
  buildUiStatusCandidates,
  STATUS_COLOR_DEFINITIONS,
  type UiStatusColor,
  type UiStatusColorSet,
  type UiStatusRole,
} from '@lib/color/uiStatusColors';

import { UiStatusAdjustmentControls } from './UiStatusAdjustmentControls';

const STATUS_LABELS: Record<UiStatusRole, string> = {
  success: 'Éxito',
  warning: 'Advertencia',
  danger: 'Peligro',
};

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
  initialRole: UiStatusRole;
  onSelect: (status: UiStatusColor) => void;
}) {
  const [activeRole, setActiveRole] = useState<UiStatusRole>(initialRole);
  const [originals] = useState<UiStatusColorSet>(() => statusColors);
  const [candidateDrafts, setCandidateDrafts] = useState<Partial<Record<UiStatusRole, UiStatusColor>>>({});
  const [appliedVariants, setAppliedVariants] = useState<Partial<Record<UiStatusRole, string>>>({});
  const nameByHex = useMemo(
    () => new Map(colors.map((color) => [normalizeHex(color.hex), color.name])),
    [colors],
  );

  return (
    <ul className="divide-y divide-line-soft" aria-label="Colores de estado editables">
      {STATUS_COLOR_DEFINITIONS.map(({ role }) => {
        const status = statusColors[role];
        const candidateDraft = candidateDrafts[role];
        const active = role === activeRole;
        const origin = status.origin === 'found'
          ? 'encontrado'
          : status.origin === 'found-adjusted' ? 'encontrado · ajustado' : 'sintético';
        const candidates = active ? buildUiStatusCandidates({
          role,
          colors: colors.map((color) => ({ hex: color.hex, prominence: color.prominence ?? 1 })),
          backgroundHex,
          current: status,
        }) : [];

        return (
          <li key={role}>
            <button
              type="button"
              aria-expanded={active}
              onClick={() => setActiveRole(role)}
              className={`grid min-h-[3.75rem] w-full grid-cols-[34px_minmax(0,1fr)_auto] items-center gap-3 rounded-lg px-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-forest/25 ${active ? 'bg-line-soft' : 'hover:bg-line-soft/70'}`}
            >
              <span className="size-[34px] rounded-full ring-1 ring-inset ring-ink/10" style={{ backgroundColor: status.hex }} aria-hidden="true" />
              <span className="min-w-0">
                <span className="block truncate text-base font-semibold text-ink">{STATUS_LABELS[role]}</span>
                <span className="block font-mono text-[0.71875rem] tabular-nums text-faint">{status.hex.toUpperCase()}</span>
              </span>
              <span className="max-w-[7.25rem] rounded-full bg-bg px-2 py-1 text-right text-[0.625rem] font-semibold leading-tight text-muted ring-1 ring-inset ring-line">
                {origin}
              </span>
            </button>

            {active ? (
              <div className="space-y-4 px-2 pb-5 pt-3">
                <section aria-label={`Candidatos para ${STATUS_LABELS[role]}`}>
                  <p className="mb-2 text-[0.71875rem] font-semibold text-muted">Candidatos de tu imagen</p>
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
                          }}
                          className={`size-[30px] rounded-full ring-offset-2 ring-offset-bg transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-forest/25 motion-reduce:transition-none ${selected ? 'ring-2 ring-forest' : 'ring-1 ring-inset ring-ink/15'}`}
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
                  onApply={(nextStatus) => {
                    onSelect(nextStatus);
                    setCandidateDrafts((current) => {
                      const next = { ...current };
                      delete next[role];
                      return next;
                    });
                    setAppliedVariants((current) => ({ ...current, [role]: nextStatus.hex }));
                  }}
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
