'use client';

import type { DesignStyle } from '@lib/styles/presets';

export type StyleCardProps = {
  style: DesignStyle;
  selected: boolean;
  onSelect: (style: DesignStyle) => void;
};

export function StyleCard({ style, selected, onSelect }: StyleCardProps) {
  const moodLabel = style.mood.join(' · ');

  return (
    <button
      type="button"
      data-style-card
      onClick={() => onSelect(style)}
      aria-pressed={selected}
      aria-label={
        moodLabel.length > 0
          ? `${style.name}. ${moodLabel}. ${style.description}`
          : `${style.name}. ${style.description}`
      }
      className={`group flex h-full w-full flex-col overflow-hidden rounded-xl border text-left transition-[box-shadow,background-color,border-color,transform] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 active:scale-[0.985] motion-reduce:transition-colors motion-reduce:active:scale-100 ${
        selected
          ? 'border-ink bg-surface-raised shadow-[var(--shadow-float)] ring-2 ring-ink ring-offset-2 ring-offset-bg'
          : 'border-border/70 bg-surface hover:-translate-y-px hover:border-border hover:bg-surface-raised hover:shadow-[var(--shadow-float)] motion-reduce:hover:translate-y-0'
      }`}
    >
      <div className="flex h-11 shrink-0 overflow-hidden sm:h-12" aria-hidden="true">
        {style.thumbnailColors.map((color, index) => (
          <span
            key={`${style.id}-thumb-${index}`}
            className="min-w-0 flex-1 transition-[filter] duration-200 ease-out group-hover:brightness-[1.03] motion-reduce:transition-none"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-0.5 px-3 py-2.5">
        <h3 className="line-clamp-2 text-balance text-[0.875rem] font-semibold leading-snug text-ink">
          {style.name}
        </h3>
        {moodLabel.length > 0 ? (
          <p className="line-clamp-1 text-[0.75rem] leading-snug text-muted">{moodLabel}</p>
        ) : null}
      </div>
    </button>
  );
}
