'use client';

import { useMemo, useState } from 'react';

import type { ContrastTarget, Palette } from '@lib/color/contrast';
import { evaluatePalette } from '@lib/color/contrast';

import { ContrastRow } from './ContrastRow';

export type ContrastPanelProps = {
  palette: Palette | null;
  variant?: 'default' | 'embedded';
  onApplyForeground?: (role: keyof Palette, hex: string) => void;
};

export function ContrastPanel({
  palette,
  variant = 'default',
  onApplyForeground,
}: ContrastPanelProps) {
  const isEmbedded = variant === 'embedded';
  const [target, setTarget] = useState<ContrastTarget>('AA');
  const results = useMemo(
    () => (palette === null ? [] : evaluatePalette(palette)),
    [palette],
  );

  return (
    <section
      aria-label="Evaluación de accesibilidad"
      className={isEmbedded ? 'space-y-3.5' : 'rounded-lg border border-border bg-bg p-5'}
    >
      <div
        className={
          isEmbedded
            ? 'flex items-center justify-between gap-2'
            : 'flex flex-wrap items-start justify-between gap-4'
        }
      >
        {!isEmbedded ? (
          <div>
            <h2 className="text-base font-semibold text-ink">Accesibilidad</h2>
            <p className="mt-1 max-w-prose text-[0.8125rem] leading-relaxed text-muted">
              Contraste WCAG 2.2 para pares semánticos de la paleta generada.
            </p>
          </div>
        ) : (
          <p className="text-[0.875rem] font-semibold text-ink">WCAG 2.2</p>
        )}

        <fieldset className="flex items-center gap-1">
          <legend className="sr-only">Nivel objetivo</legend>
          <TargetChip label="AA" active={target === 'AA'} onClick={() => setTarget('AA')} />
          <TargetChip label="AAA" active={target === 'AAA'} onClick={() => setTarget('AAA')} />
        </fieldset>
      </div>

      {palette === null ? (
        <p className="rounded-md border border-dashed border-border bg-surface px-3 py-4 text-center text-[0.75rem] text-muted">
          Genera una paleta para evaluar contraste.
        </p>
      ) : (
        <ul className={`flex flex-col ${isEmbedded ? 'gap-3' : 'mt-4 gap-3'}`}>
          {results.map((result) => (
            <ContrastRow
              key={result.pairRole}
              result={result}
              target={target}
              compact={isEmbedded}
              onApplyForeground={onApplyForeground}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

function TargetChip({
  label,
  active,
  onClick,
}: {
  label: ContrastTarget;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-3 py-1 text-[0.8125rem] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 ${
        active
          ? 'border-primary bg-primary text-white'
          : 'border-border bg-surface text-muted hover:bg-surface-raised hover:text-ink'
      }`}
    >
      {label}
    </button>
  );
}
