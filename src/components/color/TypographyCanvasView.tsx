'use client';

import { useEffect, useMemo } from 'react';

import { resolveActiveFontPair } from '@lib/typography/activePairing';
import { buildFontFamilyStack } from '@lib/typography/googleFonts';
import type { FontPair } from '@lib/typography/pairings';

import { PairingList } from '@/components/font-pairing/PairingList';
import { useRolePalette } from '@/context/RolePaletteContext';
import { loadGoogleFonts } from '@/lib/browser/googleFonts';
import { useT, useTx } from '@/context/I18nContext';

export type TypographyCanvasViewProps = {
  fontPairings: FontPair[];
  recommendedPairings: FontPair[];
  selectedPairing: FontPair | null;
  onSelectPairing: (pairing: FontPair) => void;
};

const TYPE_SCALE = [
  { label: 'H1', size: '40px', rem: '2.5rem', weight: 700, role: 'heading' },
  { label: 'H2', size: '28px', rem: '1.75rem', weight: 600, role: 'heading' },
  { label: 'Body', size: '16px', rem: '1rem', weight: 400, role: 'body' },
  { label: 'Caption', size: '13px', rem: '0.8125rem', weight: 500, role: 'body' },
] as const;

export function TypographyCanvasView({
  fontPairings,
  recommendedPairings,
  selectedPairing,
  onSelectPairing,
}: TypographyCanvasViewProps) {
  const tx = useTx();
  const t = useT();
  const { rolePalette } = useRolePalette();
  const activePairing = resolveActiveFontPair(selectedPairing, recommendedPairings);

  useEffect(() => {
    loadGoogleFonts([activePairing, ...recommendedPairings]);
  }, [activePairing, recommendedPairings]);

  const headingFont = useMemo(
    () => buildFontFamilyStack(activePairing.heading),
    [activePairing.heading],
  );
  const bodyFont = useMemo(() => buildFontFamilyStack(activePairing.body), [activePairing.body]);

  if (!rolePalette) {
    return null;
  }

  const background = rolePalette.fondo.hex;
  const surface = rolePalette.superficie.hex;
  const text = rolePalette.texto.hex;
  const primary = rolePalette.primario.hex;
  const border = rolePalette.borde.hex;

  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-bg px-5 py-5 lg:px-7 lg:py-6">
      <div className="mx-auto flex max-w-5xl flex-col gap-5">
        <section className="rounded-xl border border-border bg-surface p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-chrome-title">{t('ui.TypographyCanvasView.par-tipografico')}</h2>
              <p className="prose-measure mt-1 text-chrome-label leading-relaxed text-muted">{t('ui.TypographyCanvasView.biblioteca-curada-aplicada-al-sistema')}</p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <FontSpecCard
              label={t('ui.TypographyCanvasView.titular')}
              family={activePairing.heading.family}
              fontFamily={headingFont}
            />
            <FontSpecCard label={t('ui.TypographyCanvasView.cuerpo')} family={activePairing.body.family} fontFamily={bodyFont} />
          </div>

          <div className="mt-5">
            <PairingList
              pairings={fontPairings}
              selectedCatalogPairId={activePairing.id}
              onSelectPairing={onSelectPairing}
            />
          </div>
        </section>

        <section className="rounded-xl border border-border bg-surface p-5">
          <h2 className="text-chrome-title">{t('ui.TypographyCanvasView.escala-tipografica')}</h2>
          <div className="mt-4 divide-y divide-border">
            {TYPE_SCALE.map((item) => (
              <div
                key={item.label}
                className="grid grid-cols-[5rem_minmax(0,1fr)_7rem] items-center gap-3 py-3"
              >
                <span className="text-chrome-label font-semibold text-muted">{tx(item.label)}</span>
                <span
                  className="truncate text-ink"
                  style={{
                    fontFamily: item.role === 'heading' ? headingFont : bodyFont,
                    fontSize: item.size,
                    fontWeight: item.weight,
                    lineHeight: 1.15,
                  }}
                >{t('ui.TypographyCanvasView.aa-diseno-claro')}</span>
                <span className="text-right font-mono text-[0.75rem] text-muted">
                  {tx(item.size)} / {tx(item.rem)}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section
          className="rounded-xl border p-5"
          style={{ backgroundColor: surface, borderColor: border }}
        >
          <div
            className="rounded-lg px-5 py-5"
            style={{ backgroundColor: background, color: text }}
          >
            <p
              className="text-chrome-label font-semibold"
              style={{ color: primary, fontFamily: bodyFont }}
            >{t('ui.TypographyCanvasView.legibilidad-en-contexto')}</p>
            <h2
              className="mt-2 max-w-3xl text-[2rem] font-bold leading-tight"
              style={{ fontFamily: headingFont }}
            >{t('ui.TypographyCanvasView.una-guia-de-marca-debe')}</h2>
            <p
              className="mt-4 max-w-[68ch] text-[1rem] leading-7"
              style={{ fontFamily: bodyFont }}
            >{t('ui.TypographyCanvasView.este-bloque-usa-el-color')}</p>
          </div>
        </section>
      </div>
    </div>
  );
}

function FontSpecCard({
  label,
  family,
  fontFamily,
}: {
  label: string;
  family: string;
  fontFamily: string;
}) {
  const tx = useTx();
  return (
    <div className="rounded-lg border border-border bg-bg p-3">
      <p className="text-[0.75rem] font-semibold text-muted">{tx(label)}</p>
      <p className="mt-2 text-[2.75rem] font-semibold leading-none text-ink" style={{ fontFamily }}>
        Aa
      </p>
      <p className="mt-2 truncate text-chrome-label font-semibold text-ink">{tx(family)}</p>
    </div>
  );
}
