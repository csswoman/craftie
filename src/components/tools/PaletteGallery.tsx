'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { pickReadableTextColor } from '@lib/color/readableText';
import { collectMoods, filterStylesByMood, type DesignStyle } from '@lib/styles/presets';
import { useT, useTx } from '@/context/I18nContext';

export function PaletteGallery({ styles }: { styles: DesignStyle[] }) {
  const tx = useTx();
  const t = useT();
  const [mood, setMood] = useState<string | null>(null);
  const moods = useMemo(() => collectMoods(styles), [styles]);
  const visible = useMemo(() => filterStylesByMood(styles, mood), [styles, mood]);

  return (
    <div>
      <div role="group" aria-label={t('ui.PaletteGallery.filtrar-por-estilo')} className="flex flex-wrap gap-2">
        {[null, ...moods].map((option) => {
          const active = option === mood;
          return (
            <button
              key={option ?? 'all'}
              type="button"
              aria-pressed={active}
              onClick={() => setMood(option)}
              className={`min-h-11 rounded-full border px-4 text-sm font-semibold capitalize transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 ${
                active
                  ? 'border-primary bg-primary text-on-primary'
                  : 'border-border bg-bg text-muted hover:bg-surface-raised hover:text-ink'
              }`}
            >
              {option ?? t('ui.PaletteGallery.todas')}
            </button>
          );
        })}
      </div>

      <p role="status" className="mt-4 text-sm text-muted">
        {visible.length} {visible.length === 1 ? 'paleta' : 'paletas'}
      </p>

      <ul className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((style) => (
          <li key={style.id} className="overflow-hidden rounded-xl border border-border bg-bg">
            <ul className="flex h-24" aria-label={t('ui.PaletteGallery.colores-de', { name: tx(style.name) })}>
              {style.thumbnailColors.map((hex) => (
                <li
                  key={hex}
                  className="flex flex-1 items-end p-1.5"
                  style={{ backgroundColor: hex, color: pickReadableTextColor(hex) }}
                >
                  <span className="font-mono text-[0.6875rem] font-semibold">{hex.toUpperCase()}</span>
                </li>
              ))}
            </ul>
            <div className="p-4">
              <h2 className="font-display text-xl font-medium text-ink">{tx(style.name)}</h2>
              <p className="mt-1 text-sm leading-relaxed text-muted">{tx(style.description)}</p>
              <p className="mt-3 text-xs font-semibold capitalize text-muted">{tx(style.mood.join(' · '))}</p>
              <Link
                href={`/?style=${encodeURIComponent(style.id)}`}
                aria-label={t('ui.PaletteGallery.abrir-en-el-estudio-2', { name: tx(style.name) })}
                className="mt-4 inline-flex min-h-11 items-center rounded-lg bg-primary px-4 text-sm font-semibold text-on-primary transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
              >{t('ui.PaletteGallery.abrir-en-el-estudio')}</Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
