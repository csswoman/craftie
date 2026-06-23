'use client';

import { useMemo, useState } from 'react';

import type { ContrastTarget, Palette } from '@lib/color/contrast';
import { evaluatePalette } from '@lib/color/contrast';

import { ContrastRow } from './ContrastRow';

export type ContrastPanelProps = {
  palette: Palette | null;
  variant?: 'default' | 'embedded';
};

export function ContrastPanel({ palette, variant = 'default' }: ContrastPanelProps) {
  const isEmbedded = variant === 'embedded';
  const [target, setTarget] = useState<ContrastTarget>('AA');
  const results = useMemo(
    () => (palette === null ? [] : evaluatePalette(palette)),
    [palette],
  );

  return (
    <section
      aria-label="Evaluación de accesibilidad"
      className={isEmbedded ? 'space-y-4' : 'rounded-lg border border-border bg-bg p-5'}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-ink">Accesibilidad</h2>
          <p className="mt-1 max-w-prose text-[0.8125rem] leading-relaxed text-muted">
            Contraste WCAG 2.2 para pares semánticos de la paleta generada.
          </p>
        </div>

        <fieldset className="flex items-center gap-2">
          <legend className="sr-only">Nivel objetivo</legend>
          <TargetChip
            label="AA"
            active={target === 'AA'}
            onClick={() => setTarget('AA')}
          />
          <TargetChip
            label="AAA"
            active={target === 'AAA'}
            onClick={() => setTarget('AAA')}
          />
        </fieldset>
      </div>

      {palette === null ? (
        <p className="mt-4 rounded-md border border-dashed border-border bg-surface px-4 py-8 text-center text-[0.9375rem] text-muted">
          Genera una paleta para evaluar el contraste entre sus roles semánticos.
        </p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {results.map((result) => (
            <ContrastRow key={result.pairRole} result={result} target={target} />
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
      className={`rounded-full border px-3 py-1 text-[0.8125rem] font-medium transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 ${
        active
          ? 'border-primary bg-primary text-white'
          : 'border-border bg-surface text-muted hover:bg-surface-raised hover:text-ink'
      }`}
    >
      {label}
    </button>
  );
}
