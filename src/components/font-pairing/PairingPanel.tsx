'use client';

import type { Palette } from '@lib/color/contrast';
import type { FontPair } from '@lib/typography/pairings';

import { PairingList } from './PairingList';
import { TypographyPreview } from './TypographyPreview';

export type PairingPanelProps = {
  pairings: FontPair[];
  palette: Palette | null;
  selectedPairing: FontPair | null;
  onSelectPairing: (pairing: FontPair) => void;
  variant?: 'default' | 'embedded';
};

export function PairingPanel({
  pairings,
  palette,
  selectedPairing,
  onSelectPairing,
  variant = 'default',
}: PairingPanelProps) {
  const isEmbedded = variant === 'embedded';

  return (
    <section
      aria-label="Parejas tipográficas recomendadas"
      className={isEmbedded ? 'space-y-4' : 'rounded-lg border border-border bg-bg p-5'}
    >
      <div>
        <h2 className={`font-semibold text-ink ${isEmbedded ? 'text-[0.9375rem]' : 'text-base'}`}>
          Tipografía
        </h2>
        <p className="mt-1 max-w-prose text-[0.8125rem] leading-relaxed text-muted">
          Pares curados según el estado de ánimo del estilo. Selecciona uno para la vista previa de
          marca.
        </p>
      </div>

      <PairingList
        pairings={pairings}
        selectedCatalogPairId={selectedPairing?.id ?? null}
        onSelectPairing={onSelectPairing}
      />

      <div className="mt-6">
        <TypographyPreview palette={palette} selectedPairing={selectedPairing} />
      </div>
    </section>
  );
}
