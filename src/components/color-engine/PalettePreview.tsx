'use client';

import type { GeneratedPalette } from '@lib/color/formulas';
import { summarizeOklch } from '@lib/color/formatOklch';

const ROLE_LABELS: Record<keyof GeneratedPalette, string> = {
  primary: 'Primario',
  accent: 'Acento',
  surface: 'Superficie',
  onSurface: 'Sobre superficie',
  neutralLight: 'Neutro claro',
  neutralDark: 'Neutro oscuro',
};

const ROLE_ORDER: (keyof GeneratedPalette)[] = [
  'primary',
  'accent',
  'surface',
  'onSurface',
  'neutralLight',
  'neutralDark',
];

interface PalettePreviewProps {
  palette: GeneratedPalette | null;
  variant?: 'default' | 'embedded';
}

export function PalettePreview({ palette, variant = 'default' }: PalettePreviewProps) {
  const isEmbedded = variant === 'embedded';

  return (
    <section
      aria-label="Vista previa de paleta generada"
      className={isEmbedded ? 'space-y-3' : 'rounded-lg border border-border bg-bg p-5'}
    >
      <h2 className="text-base font-semibold text-ink">Paleta generada</h2>

      {palette === null ? (
        <p className="mt-4 rounded-md border border-dashed border-border bg-surface px-4 py-8 text-center text-[0.9375rem] text-muted">
          Aún no hay paleta. Introduce tus semillas y pulsa «Generar paleta».
        </p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {ROLE_ORDER.map((role) => {
            const hex = palette[role];

            return (
              <li
                key={role}
                className="flex items-center gap-4 rounded-md border border-border bg-surface p-3"
              >
                <div
                  className="h-12 w-12 shrink-0 rounded-md border border-border"
                  style={{ backgroundColor: hex }}
                  aria-hidden="true"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[0.8125rem] font-medium text-muted">{ROLE_LABELS[role]}</p>
                  <p className="font-mono text-[0.9375rem] font-semibold text-ink">{hex}</p>
                  <p className="mt-0.5 text-[0.8125rem] text-muted">{summarizeOklch(hex)}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
