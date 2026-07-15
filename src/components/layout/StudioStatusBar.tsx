'use client';

import type { GeneratedPalette } from '@lib/color/formulas';
import type { FontPair } from '@lib/typography/pairings';

export type StudioStatusBarProps = {
  palette: GeneratedPalette | null;
  pairing: FontPair | null;
  mobileDockOffset?: boolean;
};

const SWATCH_ROLES: { role: keyof GeneratedPalette; label: string }[] = [
  { role: 'primary', label: 'Primario' },
  { role: 'accent', label: 'Acento' },
  { role: 'surface', label: 'Fondo' },
  { role: 'onSurface', label: 'Texto' },
  { role: 'neutralLight', label: 'Superficie' },
  { role: 'neutralDark', label: 'Borde' },
];

export function StudioStatusBar({
  palette,
  pairing,
  mobileDockOffset = false,
}: StudioStatusBarProps) {
  if (!palette) {
    return null;
  }

  return (
    <div
      className={`pointer-events-none fixed inset-x-0 z-sticky flex justify-center px-4 ${
        mobileDockOffset
          ? 'bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))] xl:bottom-4'
          : 'bottom-4'
      }`}
    >
      <div className="pointer-events-auto flex max-w-full items-center gap-4 rounded-lg border border-border bg-bg/95 px-3 py-2 shadow-sm backdrop-blur-sm">
        <div className="hidden min-w-0 items-center gap-3 sm:flex">
          <TypeChip label="Titular" value={pairing?.heading.family ?? 'Sin asignar'} />
          <span className="text-muted" aria-hidden="true">
            ·
          </span>
          <TypeChip label="Cuerpo" value={pairing?.body.family ?? 'Sin asignar'} />
        </div>
        <ul className="flex items-center gap-1.5" aria-label="Colores activos de la paleta generada">
          {SWATCH_ROLES.map(({ role, label }) => {
            const hex = palette[role];

            return (
              <li key={role}>
                <span
                  className="block size-6 rounded-full border border-border"
                  style={{ backgroundColor: hex }}
                  role="img"
                  aria-label={`${label}: ${hex.toUpperCase()}`}
                />
              </li>
            );
          })}
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
