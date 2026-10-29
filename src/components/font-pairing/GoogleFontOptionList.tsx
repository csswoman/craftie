'use client';

import { forwardRef, useCallback, useRef, useState } from 'react';

import type { GoogleFontOption } from '@lib/typography/googleFontsCatalog';

import { loadGoogleFontFamily } from '@/lib/browser/customFonts';

import { GoogleFontOptionRow } from './GoogleFontOptionRow';

export type GoogleFontOptionListProps = {
  listboxId: string;
  label: string;
  suggestions: GoogleFontOption[];
  activeIndex: number;
  position: { left: number; top: number; width: number };
  onSelect: (font: GoogleFontOption) => void;
};

/**
 * Renders the suggestion listbox and lazy-loads a font preview for each visible
 * option only (never the whole catalog), guarding against duplicate loads.
 */
export const GoogleFontOptionList = forwardRef<
  HTMLUListElement,
  GoogleFontOptionListProps
>(function GoogleFontOptionList(
  { listboxId, label, suggestions, activeIndex, position, onSelect },
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
    <ul
      ref={ref}
      id={`${listboxId}-options`}
      role="listbox"
      aria-label={`Sugerencias para ${label}`}
      className="z-dropdown max-h-60 overflow-y-auto rounded-md border border-border bg-bg p-1"
      style={{
        position: 'fixed',
        left: position.left,
        top: position.top,
        width: position.width,
      }}
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
  );
});
