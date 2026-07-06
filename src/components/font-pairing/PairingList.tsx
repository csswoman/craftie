'use client';

import { useEffect, useMemo, useState } from 'react';

import type { FontPair } from '@lib/typography/pairings';

import { loadGoogleFonts } from '@/lib/browser/googleFonts';
import { PairCard } from './PairCard';

export type PairingListProps = {
  pairings: FontPair[];
  selectedPairing: FontPair | null;
  onSelectPairing: (pairing: FontPair) => void;
};

const MAX_VISIBLE_PAIRINGS = 3;

export function PairingList({
  pairings,
  selectedPairing,
  onSelectPairing,
}: PairingListProps) {
  const visiblePairings = useMemo(
    () => pairings.slice(0, MAX_VISIBLE_PAIRINGS),
    [pairings],
  );
  const [fontsReady, setFontsReady] = useState(false);

  useEffect(() => {
    if (visiblePairings.length === 0) {
      // No font request is pending when there are no visible pairings.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFontsReady(false);
      return;
    }

    // Mark the preview as loading until the browser font set settles.
    setFontsReady(false);
    loadGoogleFonts(visiblePairings);

    let cancelled = false;

    if (typeof document !== 'undefined' && document.fonts) {
      void document.fonts.ready.then(() => {
        if (!cancelled) {
          setFontsReady(true);
        }
      });
    } else {
      // Older browsers without FontFaceSet cannot report readiness.
      setFontsReady(true);
    }

    return () => {
      cancelled = true;
    };
  }, [visiblePairings]);

  if (visiblePairings.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-border bg-bg px-4 py-8 text-center text-[0.9375rem] text-muted">
        No hay parejas tipográficas disponibles para este estado de ánimo. Elige un estilo de
        inspiración en la pestaña Colores.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {!fontsReady ? (
        <p className="text-[0.8125rem] text-muted" aria-live="polite">
          Cargando fuentes de Google…
        </p>
      ) : null}

      <ul className="flex flex-col gap-3">
        {visiblePairings.map((pairing) => (
          <li key={pairing.id}>
            <PairCard
              pairing={pairing}
              selected={selectedPairing?.id === pairing.id}
              fontsReady={fontsReady}
              onSelect={onSelectPairing}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
