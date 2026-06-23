'use client';

import { useMemo } from 'react';

import {
  sortSelectedColors,
  type SelectableColor,
} from '@lib/color/selectableColors';

import { ColorGroupsPanel } from './ColorGroupsPanel';
import { CurrentPaletteGrid } from './CurrentPaletteGrid';

export type SelectColorsPanelProps = {
  colors: SelectableColor[];
  selectedColors: SelectableColor[];
  onSelectedColorsChange: (colors: SelectableColor[]) => void;
  isLoading?: boolean;
  loadingMessage?: string;
  showPalettePreview?: boolean;
};

function PaletteBuilderSkeleton({ message }: { message: string }) {
  return (
    <div
      className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-start"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="space-y-8 rounded-lg border border-border bg-bg p-5">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={`group-skeleton-${index}`} className="animate-pulse">
            <div className="h-5 w-40 rounded bg-surface-raised" />
            <div className="mt-2 h-4 w-56 rounded bg-surface-raised" />
            <div className="mt-3 flex flex-wrap gap-2">
              {Array.from({ length: 6 }).map((__, swatchIndex) => (
                <div
                  key={`skeleton-swatch-${index}-${swatchIndex}`}
                  className="h-10 w-10 rounded-md bg-surface-raised"
                />
              ))}
            </div>
          </div>
        ))}
        <p className="text-[0.8125rem] text-muted">{message}</p>
      </div>

      <section className="rounded-lg border border-border bg-surface p-5">
        <div className="h-5 w-32 animate-pulse rounded bg-surface-raised" />
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={`palette-skeleton-${index}`}
              className="min-h-28 animate-pulse rounded-lg bg-surface-raised"
            />
          ))}
        </div>
      </section>
    </div>
  );
}

export function SelectColorsPanel({
  colors,
  selectedColors,
  onSelectedColorsChange,
  isLoading = false,
  loadingMessage = 'Extrayendo colores de la imagen…',
  showPalettePreview = true,
}: SelectColorsPanelProps) {
  const sortedSelection = useMemo(
    () => sortSelectedColors(selectedColors),
    [selectedColors],
  );

  if (isLoading) {
    return <PaletteBuilderSkeleton message={loadingMessage} />;
  }

  if (!showPalettePreview) {
    return (
      <ColorGroupsPanel
        colors={colors}
        selectedColors={selectedColors}
        onSelectedColorsChange={onSelectedColorsChange}
      />
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-start">
      <div className="space-y-8 rounded-lg border border-border bg-bg p-5">
        <ColorGroupsPanel
          colors={colors}
          selectedColors={selectedColors}
          onSelectedColorsChange={onSelectedColorsChange}
        />
      </div>

      <CurrentPaletteGrid colors={sortedSelection} />
    </div>
  );
}
