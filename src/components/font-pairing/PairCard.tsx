'use client';

import type { FontPair } from '@lib/typography/pairings';
import { buildFontFamilyStack } from '@lib/typography/googleFonts';

export type PairCardProps = {
  pairing: FontPair;
  selected: boolean;
  fontsReady: boolean;
  onSelect: (pairing: FontPair) => void;
  variant?: 'default' | 'tools';
};

export function PairCard({ pairing, selected, fontsReady, onSelect, variant = 'default' }: PairCardProps) {
  const isTools = variant === 'tools';
  const headingFont = buildFontFamilyStack(pairing.heading);
  const bodyFont = buildFontFamilyStack(pairing.body);
  const metaClass = isTools ? 'text-tools-meta' : 'text-chrome-caption';
  const nameClass = isTools ? 'text-tools-name' : 'text-chrome-label';
  const headlineClass = isTools ? 'text-tools-font-headline' : 'text-[1.75rem]';
  const bodyClass = isTools ? 'text-tools-font-body' : 'text-[1.25rem]';

  return (
    <button
      type="button"
      onClick={() => onSelect(pairing)}
      aria-pressed={selected}
      className={`block w-full rounded-lg border px-3 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 ${
        selected
          ? 'border-primary/40 bg-primary/6 ring-1 ring-primary/12'
          : 'border-border/50 bg-transparent hover:border-border hover:bg-surface-raised/35'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className={`min-w-0 truncate font-semibold text-ink ${nameClass}`}>{pairing.displayName}</p>
        {selected ? (
          <span
            aria-hidden="true"
            className={`shrink-0 rounded-full bg-primary px-2 py-0.5 font-semibold text-bg ${metaClass}`}
          >
            ✓
          </span>
        ) : null}
      </div>

      <div
        className={`mt-2 overflow-hidden rounded-md border border-border/50 ${fontsReady ? '' : 'animate-pulse'}`}
      >
        <FontRolePreview
          label="Headline"
          family={pairing.heading.family}
          fontStack={headingFont}
          fontsReady={fontsReady}
          labelClass={metaClass}
          nameClass={`${headlineClass} font-semibold`}
        />
        <div className="h-px bg-border/60" aria-hidden="true" />
        <FontRolePreview
          label="Body"
          family={pairing.body.family}
          fontStack={bodyFont}
          fontsReady={fontsReady}
          labelClass={metaClass}
          nameClass={bodyClass}
        />
      </div>
    </button>
  );
}

function FontRolePreview({
  label,
  family,
  fontStack,
  fontsReady,
  labelClass,
  nameClass,
}: {
  label: string;
  family: string;
  fontStack: string;
  fontsReady: boolean;
  labelClass: string;
  nameClass: string;
}) {
  return (
    <div className="px-2.5 py-2">
      <p className={`font-medium uppercase tracking-[0.08em] text-muted ${labelClass}`}>{label}</p>
      <p
        className={`mt-1 truncate leading-none text-ink ${nameClass}`}
        style={{ fontFamily: fontsReady ? fontStack : undefined }}
      >
        {family}
      </p>
    </div>
  );
}
