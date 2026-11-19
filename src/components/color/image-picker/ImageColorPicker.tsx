'use client';

import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';

import type { ImagePoint } from '@lib/color/imagePicking';
import type { ExtractedColor } from '@lib/color/imageTypes';
import {
  addSourceColor,
  MAX_PICKED_SOURCE_COLORS,
  removeSourceColor,
  replaceSourceColor,
} from '@lib/color/pickedSourceColors';

import { useT } from '@/context/I18nContext';
import { useRolePalette } from '@/context/RolePaletteContext';
import { ImagePickerStage } from './ImagePickerStage';
import { ImagePickerSwatches } from './ImagePickerSwatches';
import { useImagePickerPoints } from './useImagePickerPoints';

export type ImageColorPickerProps = {
  previewUrl: string;
  fileName: string | null;
  onChange: (colors: ExtractedColor[]) => void;
  onClose: () => void;
};

/**
 * Canvas view to pick the palette's source colors straight from the photo.
 * Roles re-derive from the picked colors; manual role edits are kept.
 */
export function ImageColorPicker({ previewUrl, fileName, onChange, onClose }: ImageColorPickerProps) {
  const t = useT();
  const { seeds, rolePalette } = useRolePalette();
  const colors = seeds?.extracted ?? [];
  const hexes = colors.map((color) => color.hex);
  const { aspect, failed, ready, points, keepPoints, sample, distinctPoint } = useImagePickerPoints(previewUrl, colors);
  const [selected, setSelected] = useState<number | null>(0);
  const activeIndex = selected !== null && selected < colors.length ? selected : null;

  function apply(next: ExtractedColor[], nextPoints: ImagePoint[]) {
    keepPoints(next, nextPoints);
    onChange(next);
  }

  function handleCommit(index: number, point: ImagePoint, hex: string) {
    if (hex === hexes[index]) {
      keepPoints(colors, points.map((current, position) => (position === index ? point : current)));
      return;
    }
    apply(replaceSourceColor(colors, index, hex), points.map((current, position) => (position === index ? point : current)));
  }

  function handleAdd() {
    const point = distinctPoint();
    const hex = point ? sample(point) : null;
    if (!point || !hex) return;
    apply(addSourceColor(colors, hex), [...points, point]);
    setSelected(colors.length);
  }

  function handleRemove(index: number) {
    apply(removeSourceColor(colors, index), points.filter((_, position) => position !== index));
    setSelected((current) => (current === null || current < index ? current : Math.max(0, current - 1)));
  }

  const alt = fileName ? t('ui.PaletteImageBlock.imagen-fuente', { fileName }) : t('ui.PaletteImageBlock.imagen-fuente-2');

  return (
    <section
      aria-label={t('ui.ImageColorPicker.titulo')}
      className="flex min-h-0 flex-1 flex-col gap-4 px-4 py-4 sm:px-6"
    >
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-chrome-label font-semibold text-ink">{t('ui.ImageColorPicker.titulo')}</h2>
          <p className="text-chrome-caption text-muted">{t('ui.ImageColorPicker.ayuda')}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-lg border border-line px-3 text-chrome-label font-semibold text-ink transition-colors hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
        >
          <ArrowLeft aria-hidden="true" className="size-4" strokeWidth={2} />
          {t('ui.ImageColorPicker.volver')}
        </button>
      </header>

      {failed ? (
        <p role="alert" className="text-chrome-label text-muted">{t('ui.ImageColorPicker.error')}</p>
      ) : ready && aspect ? (
        <ImagePickerStage
          previewUrl={previewUrl}
          alt={alt}
          aspect={aspect}
          hexes={hexes}
          points={points}
          activeIndex={activeIndex}
          sample={sample}
          onSelect={setSelected}
          onCommit={handleCommit}
        />
      ) : (
        <div aria-hidden="true" className="min-h-[min(60vh,420px)] flex-1 animate-pulse rounded-lg bg-surface motion-reduce:animate-none lg:min-h-0" />
      )}

      <ImagePickerSwatches
        hexes={hexes}
        activeIndex={activeIndex}
        canAdd={ready && colors.length < MAX_PICKED_SOURCE_COLORS}
        onSelect={setSelected}
        onAdd={handleAdd}
        onRemove={handleRemove}
      />

      {rolePalette ? (
        <div className="flex items-center gap-3">
          <span className="text-chrome-caption font-semibold text-muted">{t('ui.ImageColorPicker.paleta-resultante')}</span>
          <ul className="flex h-6 min-w-0 flex-1 overflow-hidden rounded-md border border-line">
            {Object.values(rolePalette).map((slot) => (
              <li key={slot.role} title={`${slot.name} · ${slot.hex}`} className="h-full flex-1" style={{ backgroundColor: slot.hex }} />
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
