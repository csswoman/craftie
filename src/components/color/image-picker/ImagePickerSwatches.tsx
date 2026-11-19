'use client';

import { Plus, X } from 'lucide-react';

import { useT } from '@/context/I18nContext';

export type ImagePickerSwatchesProps = {
  hexes: string[];
  activeIndex: number | null;
  canAdd: boolean;
  onSelect: (index: number) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
};

/** Source colors picked from the image: select one to move its marker, add or remove. */
export function ImagePickerSwatches({ hexes, activeIndex, canAdd, onSelect, onAdd, onRemove }: ImagePickerSwatchesProps) {
  const t = useT();
  const canRemove = hexes.length > 1;

  return (
    <ul
      aria-label={t('ui.ImageColorPicker.colores-de-la-imagen')}
      className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:thin] lg:flex-wrap lg:overflow-visible"
    >
      {hexes.map((hex, index) => {
        const active = activeIndex === index;

        return (
          <li key={index} className="flex shrink-0">
            <button
              type="button"
              aria-pressed={active}
              onClick={() => onSelect(index)}
              className={`flex h-11 items-center gap-2 rounded-l-lg border py-1 pl-1.5 pr-2.5 font-mono text-chrome-label font-semibold text-ink transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 ${
                active ? 'border-primary bg-surface-raised' : 'border-line bg-surface hover:bg-surface-raised'
              } ${canRemove ? '' : 'rounded-r-lg'}`}
            >
              <span aria-hidden="true" className="size-8 rounded-md border border-line" style={{ backgroundColor: hex }} />
              {hex}
            </button>
            {canRemove ? (
              <button
                type="button"
                aria-label={t('ui.ImageColorPicker.quitar', { hex })}
                title={t('ui.ImageColorPicker.quitar', { hex })}
                onClick={() => onRemove(index)}
                className={`flex h-11 w-9 items-center justify-center rounded-r-lg border border-l-0 text-muted transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 ${
                  active ? 'border-primary bg-surface-raised' : 'border-line bg-surface hover:bg-surface-raised'
                }`}
              >
                <X aria-hidden="true" className="size-4" strokeWidth={2} />
              </button>
            ) : null}
          </li>
        );
      })}
      <li className="flex shrink-0">
        <button
          type="button"
          onClick={onAdd}
          disabled={!canAdd}
          className="inline-flex h-11 items-center gap-1.5 rounded-lg border border-dashed border-line px-3 text-chrome-label font-semibold text-ink transition-colors hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus aria-hidden="true" className="size-4" strokeWidth={2} />
          {t('ui.ImageColorPicker.anadir-color')}
        </button>
      </li>
    </ul>
  );
}
