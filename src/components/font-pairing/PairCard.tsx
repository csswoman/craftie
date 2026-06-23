'use client';

import type { FontPair } from '@lib/typography/pairings';
import { buildFontFamilyStack } from '@lib/typography/googleFonts';

import { Button } from '@/components/ui/Button';

export type PairCardProps = {
  pairing: FontPair;
  selected: boolean;
  fontsReady: boolean;
  onSelect: (pairing: FontPair) => void;
};

export function PairCard({ pairing, selected, fontsReady, onSelect }: PairCardProps) {
  const headingFont = buildFontFamilyStack(pairing.heading);
  const bodyFont = buildFontFamilyStack(pairing.body);

  return (
    <article
      className={`flex h-full flex-col rounded-lg border p-4 ${
        selected ? 'border-primary ring-2 ring-ink ring-offset-2 ring-offset-bg' : 'border-border bg-surface'
      }`}
    >
      <div className={fontsReady ? '' : 'animate-pulse'}>
        <h3
          className="text-lg font-semibold leading-tight text-ink"
          style={{ fontFamily: headingFont }}
        >
          {fontsReady ? 'Título de muestra' : 'Cargando tipografía…'}
        </h3>
        <p
          className="mt-2 text-[0.9375rem] leading-relaxed text-muted"
          style={{ fontFamily: bodyFont }}
        >
          {fontsReady
            ? 'Un párrafo breve para evaluar legibilidad, ritmo y personalidad del par.'
            : 'Preparando la vista previa de fuentes.'}
        </p>
      </div>

      <ul className="mt-3 flex flex-wrap gap-1.5" aria-label={`Estado de ánimo: ${pairing.id}`}>
        {pairing.mood.map((tag) => (
          <li
            key={`${pairing.id}-${tag}`}
            className="rounded-full border border-border bg-bg px-2.5 py-0.5 text-[0.75rem] font-medium text-muted"
          >
            {tag}
          </li>
        ))}
      </ul>

      <p className="mt-3 flex-1 text-[0.8125rem] leading-relaxed text-muted">{pairing.rationale}</p>

      {pairing.wcagNote ? (
        <p className="mt-2 text-[0.75rem] text-muted">{pairing.wcagNote}</p>
      ) : null}

      <div className="mt-4">
        <Button
          type="button"
          variant={selected ? 'primary' : 'ghost'}
          onClick={() => onSelect(pairing)}
          aria-pressed={selected}
        >
          {selected ? 'Seleccionado' : 'Seleccionar par'}
        </Button>
      </div>
    </article>
  );
}
