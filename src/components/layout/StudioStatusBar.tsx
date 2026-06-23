'use client';

import type { GeneratedPalette } from '@lib/color/formulas';
import type { FontPair } from '@lib/typography/pairings';

export type StudioStatusBarProps = {
  palette: GeneratedPalette | null;
  pairing: FontPair | null;
};

export function StudioStatusBar({ palette, pairing }: StudioStatusBarProps) {
  if (!palette) {
    return null;
  }

  const swatches = [
    palette.primary,
    palette.accent,
    palette.surface,
    palette.onSurface,
    palette.neutralLight,
    palette.neutralDark,
  ];

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-sticky flex justify-center px-4">
      <div className="panel-float pointer-events-auto flex max-w-full items-center gap-4 rounded-full px-4 py-2.5">
        <div className="hidden min-w-0 items-center gap-3 sm:flex">
          <TypeChip label="Titular" value={pairing?.heading.family ?? '—'} />
          <span className="text-muted" aria-hidden="true">
            ·
          </span>
          <TypeChip label="Cuerpo" value={pairing?.body.family ?? '—'} />
        </div>
        <ul className="flex items-center gap-1.5" aria-label="Paleta activa">
          {swatches.map((hex) => (
            <li key={hex}>
              <span
                className="block size-6 rounded-full border border-border"
                style={{ backgroundColor: hex }}
                title={hex}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function TypeChip({ label, value }: { label: string; value: string }) {
  return (
    <span className="min-w-0 truncate text-[0.75rem] text-muted">
      <span className="sr-only">{label}: </span>
      <span className="font-semibold text-ink">{value}</span>
    </span>
  );
}
