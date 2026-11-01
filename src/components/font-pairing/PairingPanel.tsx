'use client';

import type { Palette } from '@lib/color/contrast';
import type { FontPair } from '@lib/typography/pairings';

import { PairingList } from './PairingList';
import { TypographyPreview } from './TypographyPreview';
import { useT } from '@/context/I18nContext';

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
  const t = useT();
  const isEmbedded = variant === 'embedded';

  return (
    <section
      aria-label={t('ui.PairingPanel.parejas-tipograficas-recomendadas')}
      className={isEmbedded ? 'space-y-4' : 'rounded-lg border border-border bg-bg p-5'}
    >
      <div>
        <h2 className={`font-semibold text-ink ${isEmbedded ? 'text-[0.9375rem]' : 'text-base'}`}>{t('ui.PairingPanel.tipografia')}</h2>
        <p className="mt-1 max-w-prose text-[0.8125rem] leading-relaxed text-muted">{t('ui.PairingPanel.pares-curados-segun-el-estado')}</p>
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
