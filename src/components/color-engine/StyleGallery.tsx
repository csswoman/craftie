'use client';

import { useMemo, useState } from 'react';

import {
  filterStylesByMood,
  formatInspirationCountLabel,
  formatInspirationFilterLabel,
  INSPIRATION_FILTER_TAGS,
  type DesignStyle,
} from '@lib/styles/presets';

import { StyleCard } from './StyleCard';

export type StyleGalleryProps = {
  styles: DesignStyle[];
  selectedStyleId?: string | null;
  onSelectStyle: (style: DesignStyle) => void;
  variant?: 'default' | 'embedded';
  showHeader?: boolean;
};

export function StyleGallery({
  styles,
  selectedStyleId = null,
  onSelectStyle,
  variant = 'default',
  showHeader = true,
}: StyleGalleryProps) {
  const isEmbedded = variant === 'embedded';
  const [activeMood, setActiveMood] = useState<string | null>(null);
  const visibleStyles = useMemo(
    () => filterStylesByMood(styles, activeMood),
    [styles, activeMood],
  );
  const showFilters = styles.length > 0;
  const countLabel = formatInspirationCountLabel(visibleStyles.length, styles.length);

  return (
    <section
      aria-label="Estilos de diseño"
      className={
        isEmbedded
          ? 'flex min-h-0 flex-1 flex-col gap-3'
          : 'flex flex-col gap-3 rounded-lg border border-border bg-bg p-5'
      }
    >
      {showHeader ? (
        <div className="shrink-0">
          <h2 className={`font-semibold text-ink ${isEmbedded ? 'text-[0.9375rem]' : 'text-base'}`}>
            Elegir inspiración
          </h2>
          <p className="mt-1 text-[0.8125rem] leading-relaxed text-muted">
            Selecciona un estilo curado para cargar sus colores semilla. Puedes ajustarlos después a
            mano.
          </p>
        </div>
      ) : null}

      {styles.length === 0 ? (
        <p className="rounded-md border border-dashed border-border bg-surface px-4 py-8 text-center text-[0.9375rem] text-muted">
          Aún no hay estilos de diseño disponibles.
        </p>
      ) : (
        <>
          {showFilters ? (
            <div
              className="relative z-10 flex shrink-0 flex-wrap gap-2 bg-surface pb-0.5"
              role="group"
              aria-label="Filtrar por vibe"
            >
              <MoodChip
                label="Todas"
                active={activeMood === null}
                onClick={() => setActiveMood(null)}
              />
              {INSPIRATION_FILTER_TAGS.map((tag) => (
                <MoodChip
                  key={tag}
                  label={formatInspirationFilterLabel(tag)}
                  active={activeMood === tag}
                  onClick={() => setActiveMood(tag)}
                />
              ))}
            </div>
          ) : null}

          {visibleStyles.length === 0 ? (
            <p className="flex-1 py-8 text-center text-[0.9375rem] text-muted">
              Ningún estilo coincide con este filtro.
            </p>
          ) : (
            <ul
              key={activeMood ?? 'all'}
              className="grid min-h-0 flex-1 animate-[inspiration-grid-in_220ms_cubic-bezier(0.16,1,0.3,1)] grid-cols-2 content-start gap-2.5 overflow-y-auto overscroll-contain sm:gap-3 motion-reduce:animate-none"
            >
              {visibleStyles.map((style) => (
                <li key={style.id}>
                  <StyleCard
                    style={style}
                    selected={style.id === selectedStyleId}
                    onSelect={onSelectStyle}
                  />
                </li>
              ))}
            </ul>
          )}

          <p
            className="shrink-0 border-t border-border/40 pt-3 text-center text-[0.75rem] leading-snug text-muted"
            aria-live="polite"
          >
            {countLabel}
          </p>
        </>
      )}
    </section>
  );
}

function MoodChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`min-h-9 shrink-0 rounded-full px-3.5 py-1.5 text-[0.8125rem] font-medium transition-[color,background-color,border-color,transform,box-shadow] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 active:scale-[0.97] motion-reduce:transition-colors motion-reduce:active:scale-100 ${
        active
          ? 'bg-ink text-bg shadow-[0_1px_0_rgb(0_0_0_/0.06)]'
          : 'border border-border/60 bg-surface-raised text-muted hover:border-border hover:bg-border/40 hover:text-ink'
      }`}
    >
      {label}
    </button>
  );
}
