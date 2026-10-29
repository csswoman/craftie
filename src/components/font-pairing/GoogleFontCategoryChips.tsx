'use client';

import {
  GOOGLE_FONT_CATEGORY_FILTERS,
  type GoogleFontCategoryFilter,
} from '@lib/typography/googleFontsCatalog';

export type GoogleFontCategoryChipsProps = {
  value: GoogleFontCategoryFilter;
  onChange: (value: GoogleFontCategoryFilter) => void;
};

export function GoogleFontCategoryChips({
  value,
  onChange,
}: GoogleFontCategoryChipsProps) {
  return (
    <div
      className="mt-1.5 flex flex-wrap gap-1.5"
      role="group"
      aria-label="Filtrar fuentes por categoría"
    >
      {GOOGLE_FONT_CATEGORY_FILTERS.map((filter) => {
        const active = value === filter.value;

        return (
          <button
            key={filter.value}
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => onChange(filter.value)}
            aria-pressed={active}
            className={`min-h-8 shrink-0 rounded-full px-2.5 py-1 text-tools-chip font-medium transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 ${
              active
                ? 'bg-ink text-bg'
                : 'bg-surface-raised text-muted hover:bg-border/60 hover:text-ink'
            }`}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}
