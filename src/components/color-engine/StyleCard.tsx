'use client';

import type { DesignStyle } from '@lib/styles/presets';

export type StyleCardProps = {
  style: DesignStyle;
  selected: boolean;
  onSelect: (style: DesignStyle) => void;
};

export function StyleCard({ style, selected, onSelect }: StyleCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(style)}
      aria-pressed={selected}
      className={`flex h-full w-full flex-col rounded-lg border border-border bg-surface p-4 text-left transition-[box-shadow,background-color] hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 ${
        selected ? 'ring-2 ring-ink ring-offset-2 ring-offset-bg' : ''
      }`}
    >
      <div
        className="flex h-14 overflow-hidden rounded-md border border-border"
        aria-hidden="true"
      >
        {style.thumbnailColors.map((color, index) => (
          <span
            key={`${style.id}-thumb-${index}`}
            className="min-w-0 flex-1"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>

      <h3 className="mt-3 line-clamp-2 text-base font-semibold text-ink">{style.name}</h3>
      <p className="mt-1 line-clamp-3 flex-1 text-[0.8125rem] leading-relaxed text-muted">
        {style.description}
      </p>

      <ul className="mt-3 flex flex-wrap gap-1.5" aria-label={`Estado de ánimo: ${style.name}`}>
        {style.mood.map((tag) => (
          <li
            key={`${style.id}-${tag}`}
            className="rounded-full border border-border bg-bg px-2.5 py-0.5 text-[0.75rem] font-medium text-muted"
          >
            {tag}
          </li>
        ))}
      </ul>
    </button>
  );
}
