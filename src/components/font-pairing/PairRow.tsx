'use client';

import type { FontPair } from '@lib/typography/pairings';
import { buildFontFamilyStack } from '@lib/typography/googleFonts';
import { specimenForPair } from '@lib/typography/pairSpecimen';

import { TypeWeightBadge } from './AppliedTypeZoneParts';

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
}: PairRowProps) {
  const headingFont = buildFontFamilyStack(pairing.heading);
  const bodyFont = buildFontFamilyStack(pairing.body);
  const headingWeight = roleWeight(pairing, 'heading');
  const bodyWeight = roleWeight(pairing, 'body');
  const specimen = specimenForPair(pairing);

  return (
    <button
      type="button"
      onClick={() => onSelect(pairing)}
      onPointerEnter={() => onPreview?.(pairing)}
      onPointerLeave={() => onClearPreview?.()}
      aria-pressed={selected}
      className={`block w-full min-w-0 max-w-full overflow-hidden rounded-xl border px-3.5 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 ${
        selected
          ? 'border-primary/45 bg-primary/8'
          : 'border-border/70 bg-bg hover:border-border'
      }`}
    >
      <p className="flex min-w-0 items-center justify-between gap-2">
        <span
          className={`min-w-0 truncate text-chrome-caption ${
            selected ? 'font-bold text-primary' : 'font-semibold text-ink'
          }`}
        >
          {pairing.heading.family} · {pairing.body.family}
        </span>
        <span className="flex shrink-0 items-center gap-1">
          <TypeWeightBadge weight={headingWeight} tone="ink" />
          <TypeWeightBadge weight={bodyWeight} />
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
        title={specimen.heading}
      >
        {specimen.heading}
      </p>

      <p
        className={`mt-1 min-w-0 line-clamp-2 text-[13px] leading-snug text-muted ${
          fontsReady ? '' : 'opacity-70'
        }`}
        style={{
          fontFamily: bodyFont,
          fontWeight: bodyWeight,
        }}
        title={specimen.body}
      >
        {specimen.body}
      </p>
    </button>
  );
}
