'use client';

import type { FontPair } from '@lib/typography/pairings';
import { buildFontFamilyStack } from '@lib/typography/googleFonts';

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
    <button
      type="button"
      onClick={() => onSelect(pairing)}
      aria-pressed={selected}
      className={`block w-full border-l-2 px-3 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 ${
        selected
          ? 'border-l-primary bg-primary/5'
          : 'border-l-transparent bg-surface hover:border-l-border hover:bg-surface-raised'
      }`}
    >
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="min-w-0">
          <p className="truncate text-[0.875rem] font-extrabold text-ink">
            {pairing.displayName}
          </p>
          <p className="mt-0.5 truncate text-[0.75rem] font-medium text-muted">
            {pairing.heading.family} + {pairing.body.family}
          </p>
        </div>
        {selected ? (
          <span
            aria-hidden="true"
            className="mt-0.5 rounded-full bg-primary px-2 py-0.5 text-[0.6875rem] font-bold text-bg"
          >
            ✓
          </span>
        ) : null}
      </div>

      <div className={fontsReady ? 'mt-2.5' : 'mt-2.5 animate-pulse'}>
        <p
          className="truncate text-[1.5rem] font-semibold leading-tight text-ink"
          style={{ fontFamily: fontsReady ? headingFont : undefined }}
        >
          Diseñar una marca clara
        </p>
        <p
          className="mt-1 truncate text-[0.875rem] leading-snug text-muted"
          style={{ fontFamily: fontsReady ? bodyFont : undefined }}
        >
          Una línea breve para evaluar ritmo y legibilidad.
        </p>
      </div>
    </button>
  );
}
