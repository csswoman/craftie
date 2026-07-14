'use client';

import { useMemo, useState } from 'react';

import {
  collectMoods,
  filterStylesByMood,
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

/** Only show mood filters when the list is large enough to need them. */
const MOOD_FILTER_MIN_STYLES = 8;

export function StyleGallery({
  styles,
  selectedStyleId = null,
  onSelectStyle,
  variant = 'default',
  showHeader = true,
}: StyleGalleryProps) {
  const isEmbedded = variant === 'embedded';
  const [activeMood, setActiveMood] = useState<string | null>(null);
  const moods = useMemo(() => collectMoods(styles), [styles]);
  const showMoodFilters = styles.length >= MOOD_FILTER_MIN_STYLES && moods.length > 0;
  const visibleStyles = useMemo(
    () => (showMoodFilters ? filterStylesByMood(styles, activeMood) : styles),
    [styles, activeMood, showMoodFilters],
  );

  return (
    <section
      aria-label="Estilos de diseño"
      className={isEmbedded ? 'space-y-3' : 'rounded-lg border border-border bg-bg p-5'}
    >
      {showHeader ? (
        <div>
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
        <p
          className={`rounded-md border border-dashed border-border bg-surface px-4 py-8 text-center text-[0.9375rem] text-muted ${
            showHeader ? 'mt-4' : ''
          }`}
        >
          Aún no hay estilos de diseño disponibles.
        </p>
      ) : (
        <>
          {showMoodFilters ? (
            <div
              className={`flex flex-wrap gap-1.5 ${showHeader ? 'mt-4' : ''}`}
              role="group"
              aria-label="Filtrar por estado de ánimo"
            >
              <MoodChip
                label="Todos"
                active={activeMood === null}
                onClick={() => setActiveMood(null)}
              />
              {moods.map((mood) => (
                <MoodChip
                  key={mood}
                  label={mood}
                  active={activeMood === mood}
                  onClick={() => setActiveMood(mood)}
                />
              ))}
            </div>
          ) : null}

          {visibleStyles.length === 0 ? (
            <p className="mt-4 text-[0.9375rem] text-muted">
              Ningún estilo coincide con este filtro.
            </p>
          ) : (
            <ul
              className={`${showMoodFilters || showHeader ? 'mt-4' : ''} grid gap-3 ${
                isEmbedded
                  ? 'grid-cols-1'
                  : 'grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4'
              }`}
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
      className={`rounded-md px-2.5 py-1.5 text-[0.8125rem] font-medium transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 ${
        active
          ? 'bg-surface-raised text-ink'
          : 'text-muted hover:bg-surface-raised/70 hover:text-ink'
      }`}
    >
      {label}
    </button>
  );
}
