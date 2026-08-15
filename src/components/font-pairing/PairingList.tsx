'use client';

import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import type { FontPair } from '@lib/typography/pairings';
import {
  filterFontPairs,
  shouldShowPairingSearch,
  type PairingCategoryValue,
} from '@lib/typography/pairingFilters';

import { loadGoogleFonts } from '@/lib/browser/googleFonts';
import { PairingFilterChips } from './PairingFilterChips';
import { PairGroup } from './PairingListRows';
import { PairingSearchControl } from './PairingSearchControl';

const CATALOG_PAGE_SIZE = 12;

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
  const [page, setPage] = useState(1);
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

  const pageCount = Math.max(1, Math.ceil(catalog.length / CATALOG_PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const catalogPage = useMemo(() => {
    const start = (currentPage - 1) * CATALOG_PAGE_SIZE;
    return catalog.slice(start, start + CATALOG_PAGE_SIZE);
  }, [catalog, currentPage]);

  useEffect(() => {
    if (selectedCatalogPairId) {
      const selected = pairings.find((pair) => pair.id === selectedCatalogPairId);
      if (selected) {
        loadGoogleFonts([selected]);
      }
    }
  }, [pairings, selectedCatalogPairId]);

  useEffect(() => {
    loadGoogleFonts([...suggested, ...catalogPage]);
  }, [catalogPage, suggested]);

  const handleCategoryChange = (value: PairingCategoryValue) => {
    setCategory(value);
    setPage(1);
  };

  const handleQueryChange = (value: string) => {
    setQuery(value);
    setPage(1);
  };

  const clearFilters = () => {
    setQuery('');
    setCategory('all');
    setPage(1);
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
      <div className="min-w-0 space-y-2">
        <PairingFilterChips value={category} onChange={handleCategoryChange} isTools={isTools} />
        {showSearch ? (
          <PairingSearchControl
            query={query}
            onQueryChange={handleQueryChange}
            disabled={listInert}
            isTools={isTools}
          />
        ) : null}
      </div>

      <p className="sr-only" aria-live="polite">
        {filteredPairings.length} pares
        {pageCount > 1 ? `. Página ${currentPage} de ${pageCount}.` : ''}
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
            pairings={catalogPage}
            selectedCatalogPairId={selectedCatalogPairId}
            inert={listInert}
            onSelect={selectHandler}
            onPreview={previewHandler}
            onClearPreview={clearHandler}
            variant={variant}
          />
          {pageCount > 1 ? (
            <nav
              className="flex items-center justify-between gap-2 border-t border-border pt-3"
              aria-label="Paginación del catálogo tipográfico"
            >
              <button
                type="button"
                onClick={() => setPage(currentPage - 1)}
                disabled={listInert || currentPage === 1}
                className="inline-flex min-h-8 items-center gap-1 rounded-md px-2 text-chrome-caption font-medium text-ink transition-colors hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-45"
              >
                <ChevronLeft size={14} strokeWidth={1.75} aria-hidden="true" />
                Anterior
              </button>
              <span className="text-tools-meta tabular-nums text-muted">
                Página {currentPage} de {pageCount}
              </span>
              <button
                type="button"
                onClick={() => setPage(currentPage + 1)}
                disabled={listInert || currentPage === pageCount}
                className="inline-flex min-h-8 items-center gap-1 rounded-md px-2 text-chrome-caption font-medium text-ink transition-colors hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-45"
              >
                Siguiente
                <ChevronRight size={14} strokeWidth={1.75} aria-hidden="true" />
              </button>
            </nav>
          ) : null}
        </div>
      )}
    </div>
  );
}
