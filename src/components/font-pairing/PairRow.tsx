'use client';

import type { FontPair } from '@lib/typography/pairings';
import { buildFontFamilyStack } from '@lib/typography/googleFonts';

export const PAIR_SPECIMEN_HEADING = 'Ship the brand story';
export const PAIR_SPECIMEN_BODY =
  'El cuerpo se mantiene neutro y la paleta lleva la personalidad.';

export type PairRowProps = {
  pairing: FontPair;
  selected: boolean;
  fontsReady: boolean;
  onSelect: (pairing: FontPair) => void;
  onPreview?: (pairing: FontPair) => void;
  onClearPreview?: () => void;
  variant?: 'default' | 'tools';
};

function roleWeight(pairing: FontPair, role: 'heading' | 'body'): number {
  const meta = role === 'heading' ? pairing.heading : pairing.body;
  if (typeof meta.defaultWeight === 'number') {
    return meta.defaultWeight;
  }
  return role === 'heading' ? 700 : 400;
}

export function PairRow({
  pairing,
  selected,
  fontsReady,
  onSelect,
  onPreview,
  onClearPreview,
  variant = 'default',
}: PairRowProps) {
  const headingFont = buildFontFamilyStack(pairing.heading);
  const bodyFont = buildFontFamilyStack(pairing.body);
  const headingWeight = roleWeight(pairing, 'heading');
  const bodyWeight = roleWeight(pairing, 'body');

  return (
    <button
      type="button"
      onClick={() => onSelect(pairing)}
      onPointerEnter={() => onPreview?.(pairing)}
      onPointerLeave={() => onClearPreview?.()}
      aria-pressed={selected}
      className={`block w-full min-w-0 max-w-full overflow-hidden rounded-xl border border-l-[3px] px-3.5 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 ${
        selected
          ? 'border-primary/30 border-l-primary bg-primary/8'
          : 'border-border/70 border-l-transparent bg-bg hover:border-border'
      }`}
    >
      <p className="flex min-w-0 items-baseline justify-between gap-2 uppercase tracking-[0.05em] text-muted">
        <span className="min-w-0 truncate text-[10.5px] font-semibold">
          {pairing.heading.family} · {pairing.body.family}
        </span>
        <span className="shrink-0 text-[10.5px] font-normal tabular-nums">
          {headingWeight} / {bodyWeight}
        </span>
      </p>

      <p
        className={`mt-2 min-w-0 truncate text-[1.25rem] leading-tight text-ink ${
          fontsReady ? '' : 'opacity-70'
        }`}
        style={{
          fontFamily: headingFont,
          fontWeight: headingWeight,
        }}
        title={PAIR_SPECIMEN_HEADING}
      >
        {PAIR_SPECIMEN_HEADING}
      </p>

      <p
        className={`mt-1 min-w-0 line-clamp-2 text-[13px] leading-snug text-muted ${
          fontsReady ? '' : 'opacity-70'
        }`}
        style={{
          fontFamily: bodyFont,
          fontWeight: bodyWeight,
        }}
        title={PAIR_SPECIMEN_BODY}
      >
        {PAIR_SPECIMEN_BODY}
      </p>
    </button>
  );
}
