'use client';

import { useEffect } from 'react';

import type { GoogleFontOption } from '@lib/typography/googleFontsCatalog';

export type GoogleFontOptionRowProps = {
  font: GoogleFontOption;
  optionId: string;
  active: boolean;
  previewReady: boolean;
  onRequestPreview: (family: string) => void;
  onSelect: (font: GoogleFontOption) => void;
};

/**
 * One listbox option. Lazy-loads its own family on mount (visible options only)
 * and renders the family name in that typeface once it is ready.
 */
export function GoogleFontOptionRow({
  font,
  optionId,
  active,
  previewReady,
  onRequestPreview,
  onSelect,
}: GoogleFontOptionRowProps) {
  useEffect(() => {
    onRequestPreview(font.family);
  }, [font.family, onRequestPreview]);

  return (
    <li
      id={optionId}
      role="option"
      aria-selected={active}
      onMouseDown={(event) => event.preventDefault()}
      onClick={() => onSelect(font)}
      className={`flex cursor-pointer items-center justify-between gap-3 rounded px-2.5 py-2 text-tools-body text-ink ${
        active ? 'bg-surface-raised' : 'hover:bg-surface-raised'
      }`}
    >
      <span
        className="truncate"
        title={font.family}
        style={previewReady ? { fontFamily: `"${font.family}"` } : undefined}
      >
        {font.family}
      </span>
      <span className="shrink-0 text-tools-meta text-muted">{font.category}</span>
    </li>
  );
}
