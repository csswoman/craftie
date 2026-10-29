'use client';

import { forwardRef, useCallback, useRef, useState } from 'react';

import type {
  GoogleFontCategoryFilter,
  GoogleFontOption,
} from '@lib/typography/googleFontsCatalog';

import { loadGoogleFontFamily } from '@/lib/browser/customFonts';

import { GoogleFontCategoryChips } from './GoogleFontCategoryChips';
import { GoogleFontOptionRow } from './GoogleFontOptionRow';

export type GoogleFontOptionListProps = {
  listboxId: string;
  label: string;
  suggestions: GoogleFontOption[];
  activeIndex: number;
  position: { left: number; top: number; width: number };
  category: GoogleFontCategoryFilter;
  onCategoryChange: (value: GoogleFontCategoryFilter) => void;
  loading: boolean;
  onSelect: (font: GoogleFontOption) => void;
};

/**
 * Renders the suggestion listbox and lazy-loads a font preview for each visible
 * option only (never the whole catalog), guarding against duplicate loads.
 */
export const GoogleFontOptionList = forwardRef<
  HTMLDivElement,
  GoogleFontOptionListProps
>(function GoogleFontOptionList(
  {
    listboxId,
    label,
    suggestions,
    activeIndex,
    position,
    category,
    onCategoryChange,
    loading,
    onSelect,
  },
  ref,
) {
  const [readyFamilies, setReadyFamilies] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const requestedRef = useRef<Set<string>>(new Set());

  const requestPreview = useCallback((family: string) => {
    if (requestedRef.current.has(family)) {
      return;
    }
    requestedRef.current.add(family);

    void loadGoogleFontFamily(family)
      .then(() => {
        setReadyFamilies((prev) => {
          const next = new Set(prev);
          next.add(family);
          return next;
        });
      })
      .catch(() => {
        // Preview is best-effort; keep the default font on failure.
      });
  }, []);

  return (
    <div
      ref={ref}
      className="z-dropdown flex max-h-72 flex-col overflow-hidden rounded-md border border-border bg-bg shadow-lg"
      style={{
        position: 'fixed',
        left: position.left,
        top: position.top,
        width: 'max-content',
        minWidth: position.width,
        maxWidth: `calc(100vw - ${position.left + 12}px)`,
      }}
    >
      <div className="border-b border-border/70 px-2 py-1.5">
        <GoogleFontCategoryChips value={category} onChange={onCategoryChange} />
      </div>
      {loading ? (
        <p className="px-2.5 py-3 text-chrome-caption text-muted" role="status">
          Cargando catálogo…
        </p>
      ) : suggestions.length === 0 ? (
        <p className="px-2.5 py-3 text-chrome-caption text-muted">
          Sin coincidencias para este filtro.
        </p>
      ) : (
        <ul
          id={`${listboxId}-options`}
          role="listbox"
          aria-label={`Sugerencias para ${label}`}
          className="min-h-0 flex-1 overflow-y-auto p-1"
        >
          {suggestions.map((font, index) => (
            <GoogleFontOptionRow
              key={font.family}
              font={font}
              optionId={`${listboxId}-option-${index}`}
              active={activeIndex === index}
              previewReady={readyFamilies.has(font.family)}
              onRequestPreview={requestPreview}
              onSelect={onSelect}
            />
          ))}
        </ul>
      )}
    </div>
  );
});
