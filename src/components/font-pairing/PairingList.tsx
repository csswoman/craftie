'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import type { FontPair } from '@lib/typography/pairings';

import { loadGoogleFonts } from '@/lib/browser/googleFonts';
import { PairCard } from './PairCard';

export type PairingListProps = {
  pairings: FontPair[];
  selectedPairing: FontPair | null;
  onSelectPairing: (pairing: FontPair) => void;
  variant?: 'default' | 'tools';
};

const FILTERS = [
  { label: 'Todos', value: 'all' },
  { label: 'Editorial', value: 'editorial' },
  { label: 'Técnico', value: 'technical' },
  { label: 'Cálido', value: 'warm' },
  { label: 'Geométrico', value: 'geometric' },
  { label: 'Minimal', value: 'minimal' },
  { label: 'Audaz', value: 'bold' },
] as const;

type FilterValue = (typeof FILTERS)[number]['value'];

export function PairingList({
  pairings,
  selectedPairing,
  onSelectPairing,
  variant = 'default',
}: PairingListProps) {
  const [activeFilter, setActiveFilter] = useState<FilterValue>('all');
  const isTools = variant === 'tools';
  const chipClass = isTools ? 'text-tools-chip' : 'text-[0.75rem]';
  const emptyClass = isTools ? 'text-tools-body' : 'text-[0.9375rem]';
  const filteredPairings = useMemo(() => {
    if (activeFilter === 'all') {
      return pairings;
    }

    return pairings.filter((pairing) => pairing.character.includes(activeFilter));
  }, [activeFilter, pairings]);

  useEffect(() => {
    if (selectedPairing !== null) {
      loadGoogleFonts([selectedPairing]);
    }
  }, [selectedPairing]);

  if (pairings.length === 0) {
    return (
      <p className={`rounded-md border border-dashed border-border bg-bg px-4 py-8 text-center ${emptyClass} text-muted`}>
        No hay parejas tipográficas disponibles para este estado de ánimo. Elige un estilo de
        inspiración en la pestaña Colores.
      </p>
    );
  }

  return (
    <div className={isTools ? 'flex min-h-0 flex-1 flex-col gap-3' : 'space-y-3'}>
      <div
        className="scrollbar-none -mx-1 flex shrink-0 gap-1.5 overflow-x-auto px-1"
        aria-label="Filtrar pares por carácter"
      >
        {FILTERS.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => setActiveFilter(filter.value)}
            aria-pressed={activeFilter === filter.value}
            className={`shrink-0 rounded-full border px-2.5 py-1.5 ${chipClass} font-semibold transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 ${
              activeFilter === filter.value
                ? 'border-primary bg-primary text-bg'
                : 'border-border bg-bg text-muted hover:bg-surface-raised hover:text-ink'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <ul
        className={`scrollbar-chrome space-y-2 overflow-y-auto ${
          isTools ? 'min-h-0 flex-1' : 'max-h-[30rem]'
        }`}
      >
        {filteredPairings.map((pairing) => (
          <li key={pairing.id} className={isTools ? 'pb-2 last:pb-0' : undefined}>
            <LazyPairCard
              pairing={pairing}
              selected={selectedPairing?.id === pairing.id}
              onSelect={onSelectPairing}
              variant={variant}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

function LazyPairCard({
  pairing,
  selected,
  onSelect,
  variant = 'default',
}: {
  pairing: FontPair;
  selected: boolean;
  onSelect: (pairing: FontPair) => void;
  variant?: 'default' | 'tools';
}) {
  const cardRef = useRef<HTMLDivElement | null>(null);
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

    const element = cardRef.current;

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
      { rootMargin: '160px 0px' },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [fontsRequested, pairing]);

  return (
    <div ref={cardRef}>
      <PairCard
        pairing={pairing}
        selected={selected}
        fontsReady={fontsRequested}
        onSelect={onSelect}
        variant={variant}
      />
    </div>
  );
}
