'use client';

import type { Palette } from '@lib/color/contrast';
import { buildFontFamilyStack } from '@lib/typography/googleFonts';
import type { FontPair } from '@lib/typography/pairings';

export type TypographyPreviewProps = {
  palette: Palette | null;
  selectedPairing: FontPair | null;
  variant?: 'default' | 'canvas';
};

export function TypographyPreview({
  palette,
  selectedPairing,
  variant = 'default',
}: TypographyPreviewProps) {
  const isCanvas = variant === 'canvas';

  if (palette === null) {
    return (
      <section
        aria-label="Vista previa tipográfica"
        className={`flex items-center justify-center text-center ${
          isCanvas
            ? 'min-h-[320px] flex-1 bg-surface-raised/40 px-6'
            : 'rounded-md border border-dashed border-border bg-surface px-4 py-8'
        }`}
      >
        <p className="max-w-xs text-[0.9375rem] leading-relaxed text-muted">
          Genera una paleta en la pestaña Colores para previsualizar tipografía con tus colores.
        </p>
      </section>
    );
  }

  if (selectedPairing === null) {
    return (
      <section
        aria-label="Vista previa tipográfica"
        className={`flex items-center justify-center text-center ${
          isCanvas
            ? 'min-h-[320px] flex-1 bg-surface-raised/40 px-6'
            : 'rounded-md border border-dashed border-border bg-surface px-4 py-8'
        }`}
      >
        <p className="max-w-xs text-[0.9375rem] leading-relaxed text-muted">
          Selecciona un par tipográfico en el panel izquierdo para ver la mini guía de marca.
        </p>
      </section>
    );
  }

  const headingFont = buildFontFamilyStack(selectedPairing.heading);
  const bodyFont = buildFontFamilyStack(selectedPairing.body);

  return (
    <section
      aria-label="Vista previa tipográfica"
      className={`flex min-h-0 flex-1 flex-col overflow-hidden ${
        isCanvas ? 'bg-bg' : 'rounded-md border border-border'
      }`}
      style={{ backgroundColor: palette.surface }}
    >
      <div className="shrink-0 border-b border-border/60 px-5 py-3">
        <p className="text-[0.8125rem] font-medium text-muted">Mini guía de marca</p>
        <p className="mt-0.5 text-[0.75rem] text-muted">
          {selectedPairing.heading.family} + {selectedPairing.body.family}
        </p>
      </div>

      <div
        className={`flex min-h-0 flex-1 flex-col justify-center ${
          isCanvas ? 'px-8 py-10 md:px-12 md:py-14' : 'space-y-4 px-5 py-6'
        }`}
      >
        <h3
          className={`font-semibold leading-tight ${
            isCanvas ? 'text-[clamp(2rem,4vw,3.5rem)]' : 'text-[clamp(1.5rem,2.5vw,2rem)]'
          }`}
          style={{
            color: palette.primary,
            fontFamily: headingFont,
          }}
        >
          Marca con propósito
        </h3>

        <p
          className={`max-w-prose leading-relaxed ${
            isCanvas ? 'mt-6 text-[clamp(1rem,1.5vw,1.125rem)]' : 'text-[0.9375rem]'
          }`}
          style={{
            color: palette.onSurface,
            fontFamily: bodyFont,
          }}
        >
          The quick brown fox jumps over the lazy dog. Esta vista usa los colores de tu paleta
          generada para evaluar jerarquía, legibilidad y tono visual del par seleccionado.
        </p>

        <div className={`flex flex-wrap gap-2 ${isCanvas ? 'mt-8' : 'pt-2'}`}>
          <span
            className="rounded-md px-3 py-1.5 text-[0.8125rem] font-semibold"
            style={{
              backgroundColor: palette.primary,
              color: palette.surface,
              fontFamily: headingFont,
            }}
          >
            Acción principal
          </span>
          <span
            className="rounded-md border px-3 py-1.5 text-[0.8125rem] font-medium"
            style={{
              borderColor: palette.neutralLight,
              color: palette.onSurface,
              fontFamily: bodyFont,
            }}
          >
            Etiqueta secundaria
          </span>
        </div>
      </div>
    </section>
  );
}
