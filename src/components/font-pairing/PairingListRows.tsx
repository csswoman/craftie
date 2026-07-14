'use client';

import { useEffect, useRef, useState } from 'react';

import type { FontPair } from '@lib/typography/pairings';

import { loadGoogleFonts } from '@/lib/browser/googleFonts';
import { PairRow } from './PairRow';

export function PairGroup({
  heading,
  pairings,
  selectedCatalogPairId,
  inert,
  onSelect,
  onPreview,
  onClearPreview,
  variant,
}: {
  heading: string | null;
  pairings: FontPair[];
  selectedCatalogPairId: string | null;
  inert: boolean;
  onSelect: (pairing: FontPair) => void;
  onPreview?: (pairing: FontPair) => void;
  onClearPreview?: () => void;
  variant?: 'default' | 'tools';
}) {
  if (pairings.length === 0) {
    return null;
  }

  return (
    <div className="min-w-0">
      {heading ? (
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted">
          {heading}
        </p>
      ) : null}
      <ul className="min-w-0 space-y-2 overflow-x-hidden">
        {pairings.map((pairing) => (
          <li key={pairing.id} className="min-w-0">
            <LazyPairRow
              pairing={pairing}
              selected={!inert && selectedCatalogPairId === pairing.id}
              inert={inert}
              onSelect={onSelect}
              onPreview={onPreview}
              onClearPreview={onClearPreview}
              variant={variant}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

function LazyPairRow({
  pairing,
  selected,
  inert,
  onSelect,
  onPreview,
  onClearPreview,
  variant = 'default',
}: {
  pairing: FontPair;
  selected: boolean;
  inert: boolean;
  onSelect: (pairing: FontPair) => void;
  onPreview?: (pairing: FontPair) => void;
  onClearPreview?: () => void;
  variant?: 'default' | 'tools';
}) {
  const rowRef = useRef<HTMLDivElement | null>(null);
  const [isNearViewport, setIsNearViewport] = useState(false);
  const fontsRequested = selected || isNearViewport;

  useEffect(() => {
    if (selected) {
      loadGoogleFonts([pairing]);
    }
  }, [pairing, selected]);

  useEffect(() => {
    if (fontsRequested || typeof IntersectionObserver === 'undefined') {
      if (!fontsRequested) {
        const timer = window.setTimeout(() => {
          setIsNearViewport(true);
          loadGoogleFonts([pairing]);
        }, 0);
        return () => window.clearTimeout(timer);
      }
      return;
    }

    const element = rowRef.current;
    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsNearViewport(true);
          loadGoogleFonts([pairing]);
          observer.disconnect();
        }
      },
      { rootMargin: '240px 0px' },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [fontsRequested, pairing]);

  return (
    <div ref={rowRef} className={`min-w-0 ${inert ? 'pointer-events-none' : ''}`}>
      <PairRow
        pairing={pairing}
        selected={selected}
        fontsReady={fontsRequested}
        onSelect={onSelect}
        onPreview={onPreview}
        onClearPreview={onClearPreview}
        variant={variant}
      />
    </div>
  );
}
