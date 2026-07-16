'use client';

import { useEffect, useMemo, useState } from 'react';

import type { FontPair } from '@lib/typography/pairings';
import {
  filterFontPairs,
  shouldShowPairingSearch,
  type PairingCategoryValue,
} from '@lib/typography/pairingFilters';

import { loadGoogleFonts } from '@/lib/browser/googleFonts';
import { PairingFilterChips } from './PairingFilterChips';
import { PairGroup } from './PairingListRows';

export type PairingListProps = {
  pairings: FontPair[];
  recommendedPairings?: FontPair[];
  selectedCatalogPairId: string | null;
  listInert?: boolean;
  onSelectPairing: (pairing: FontPair) => void;
  onPreviewPairing?: (pairing: FontPair) => void;
  onClearPreview?: () => void;
  variant?: 'default' | 'tools';
};

export function PairingList({
  pairings,
  recommendedPairings = [],
  selectedCatalogPairId,
  listInert = false,
  onSelectPairing,
  onPreviewPairing,
  onClearPreview,
  variant = 'default',
}: PairingListProps) {
  const [category, setCategory] = useState<PairingCategoryValue>('all');
  const [query, setQuery] = useState('');
  const isTools = variant === 'tools';
  const emptyClass = isTools ? 'text-tools-body' : 'text-[0.9375rem]';
  const showSearch = shouldShowPairingSearch(pairings.length);
  const searchQuery = showSearch ? query : '';

  const filteredPairings = useMemo(
    () => filterFontPairs(pairings, { category, query: searchQuery }),
    [pairings, category, searchQuery],
  );

  const recommendedIds = useMemo(
    () => new Set(recommendedPairings.map((pair) => pair.id)),
    [recommendedPairings],
  );

  const suggested = useMemo(
    () => filteredPairings.filter((pair) => recommendedIds.has(pair.id)),
    [filteredPairings, recommendedIds],
  );

  const catalog = useMemo(
    () => filteredPairings.filter((pair) => !recommendedIds.has(pair.id)),
    [filteredPairings, recommendedIds],
  );

  useEffect(() => {
    if (selectedCatalogPairId) {
      const selected = pairings.find((pair) => pair.id === selectedCatalogPairId);
      if (selected) {
        loadGoogleFonts([selected]);
      }
    }
  }, [pairings, selectedCatalogPairId]);

  useEffect(() => {
    if (filteredPairings.length === 0) {
      return;
    }
    loadGoogleFonts(filteredPairings.slice(0, 12));
  }, [filteredPairings]);

  const clearFilters = () => {
    setQuery('');
    setCategory('all');
  };

  if (pairings.length === 0) {
    return (
      <p
        className={`rounded-md border border-dashed border-border bg-bg px-4 py-8 text-center ${emptyClass} text-muted`}
      >
        No hay pares tipográficos disponibles.
      </p>
    );
  }

  const selectHandler = listInert ? () => undefined : onSelectPairing;
  const previewHandler = listInert ? undefined : onPreviewPairing;
  const clearHandler = listInert ? undefined : onClearPreview;

  return (
    <div className={`min-w-0 space-y-3 ${listInert ? 'opacity-60' : ''}`}>
      <div className="flex min-w-0 items-center gap-2">
        <div className="scrollbar-none min-w-0 flex-1 overflow-x-auto">
          <PairingFilterChips value={category} onChange={setCategory} isTools={isTools} />
        </div>

        {showSearch ? (
          <div className="w-32 shrink-0" role="search">
            <label className="sr-only" htmlFor="pairing-search-input">
              Buscar pares tipográficos
            </label>
            <input
              id="pairing-search-input"
              type="search"
              value={query}
              placeholder="Buscar pares…"
              autoComplete="off"
              disabled={listInert}
              onChange={(event) => setQuery(event.target.value)}
              className={`h-8 w-full rounded-lg border border-border bg-bg px-2.5 text-ink placeholder:text-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 disabled:cursor-not-allowed ${
                isTools ? 'text-tools-body' : 'text-[0.9375rem]'
              }`}
            />
          </div>
        ) : null}
      </div>

      <p className="sr-only" aria-live="polite">
        {filteredPairings.length} pares
        {listInert ? '. Lista inactiva: ambos roles fijados.' : ''}
      </p>

      {filteredPairings.length === 0 ? (
        <div
          className={`rounded-md border border-dashed border-border bg-bg px-4 py-6 text-center ${emptyClass} text-muted`}
        >
          <p>No hay pares que coincidan.</p>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-2 font-medium text-ink underline-offset-2 hover:underline"
          >
            Limpiar filtros
          </button>
        </div>
      ) : (
        <div className="min-w-0 space-y-3" aria-disabled={listInert || undefined}>
          {suggested.length > 0 ? (
            <PairGroup
              heading="Sugeridos"
              pairings={suggested}
              selectedCatalogPairId={selectedCatalogPairId}
              inert={listInert}
              onSelect={selectHandler}
              onPreview={previewHandler}
              onClearPreview={clearHandler}
              variant={variant}
            />
          ) : null}
          <PairGroup
            heading={suggested.length > 0 ? 'Catálogo' : null}
            pairings={suggested.length > 0 ? catalog : filteredPairings}
            selectedCatalogPairId={selectedCatalogPairId}
            inert={listInert}
            onSelect={selectHandler}
            onPreview={previewHandler}
            onClearPreview={clearHandler}
            variant={variant}
          />
        </div>
      )}
    </div>
  );
}
