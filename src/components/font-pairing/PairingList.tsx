'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import type { FontPair } from '@lib/typography/pairings';

import { loadGoogleFonts } from '@/lib/browser/googleFonts';
import { PairCard } from './PairCard';

export type PairingListProps = {
  pairings: FontPair[];
  selectedPairing: FontPair | null;
  onSelectPairing: (pairing: FontPair) => void;
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
}: PairingListProps) {
  const [activeFilter, setActiveFilter] = useState<FilterValue>('all');
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
      <p className="rounded-md border border-dashed border-border bg-bg px-4 py-8 text-center text-[0.9375rem] text-muted">
        No hay parejas tipográficas disponibles para este estado de ánimo. Elige un estilo de
        inspiración en la pestaña Colores.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-1" aria-label="Filtrar pares por carácter">
        {FILTERS.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => setActiveFilter(filter.value)}
            aria-pressed={activeFilter === filter.value}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-[0.75rem] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 ${
              activeFilter === filter.value
                ? 'border-primary bg-primary text-bg'
                : 'border-border bg-bg text-muted hover:bg-surface-raised hover:text-ink'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <ul className="max-h-[30rem] overflow-y-auto rounded-lg border border-border bg-surface">
        {filteredPairings.map((pairing) => (
          <li key={pairing.id} className="border-b border-border/70 last:border-b-0">
            <LazyPairCard
              pairing={pairing}
              selected={selectedPairing?.id === pairing.id}
              onSelect={onSelectPairing}
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
}: {
  pairing: FontPair;
  selected: boolean;
  onSelect: (pairing: FontPair) => void;
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
      />
    </div>
  );
}
