'use client';

import { useEffect, useMemo, useState } from 'react';

import { buildRolePaletteColumns } from '@lib/color/paletteDisplay';
import type { RolePalette } from '@lib/color/rolePalette';
import type { SelectableColor } from '@lib/color/selectableColors';
import { pickReadableTextColor } from '@lib/color/readableText';

import { ColorDetailsDrawer } from '@/components/color-engine/ColorDetailsDrawer';
import { RolePaletteProvider, useRolePalette } from '@/context/RolePaletteContext';

import { ColorGroupsPanel } from './ColorGroupsPanel';

export type SelectColorsPanelProps = {
  colors: SelectableColor[];
  rolePalette: RolePalette;
  onRolePaletteChange: (palette: RolePalette) => void;
  isLoading?: boolean;
  loadingMessage?: string;
  showPalettePreview?: boolean;
};

function PaletteBuilderSkeleton({ message }: { message: string }) {
  return (
    <div
      className="flex w-full min-w-0 flex-col gap-8 lg:grid lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-start"
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
          {Array.from({ length: 7 }).map((_, index) => (
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

function RolePaletteGrid() {
  const { rolePalette } = useRolePalette();
  const [selectedColorHex, setSelectedColorHex] = useState<string | null>(null);
  const columns = useMemo(
    () => (rolePalette ? buildRolePaletteColumns(rolePalette) : []),
    [rolePalette],
  );

  if (!rolePalette) {
    return null;
  }

  return (
    <section aria-label="Paleta actual" className="rounded-lg border border-border bg-surface p-5">
      <h2 className="text-base font-semibold text-ink">Paleta por roles</h2>
      <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {columns.map((column) => {
          const textColor = pickReadableTextColor(column.hex);

          return (
            <li key={column.id}>
              <button
                type="button"
                onClick={() => setSelectedColorHex(column.hex)}
                className="flex min-h-28 w-full cursor-pointer flex-col items-center justify-center rounded-lg px-4 py-5 text-center transition-transform hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
                style={{ backgroundColor: column.hex, color: textColor }}
              >
                <span className="text-[0.9375rem] font-semibold tracking-[0.01em]">{column.name}</span>
                <span className="mt-1 font-mono text-[0.8125rem] font-semibold opacity-95">
                  {column.hex.toUpperCase()}
                </span>
                {column.roleLabel ? (
                  <span className="mt-0.5 text-[0.75rem] font-medium opacity-85">{column.roleLabel}</span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>

      <ColorDetailsDrawer
        colorHex={selectedColorHex}
        open={selectedColorHex !== null}
        onClose={() => setSelectedColorHex(null)}
      />
    </section>
  );
}

function SelectColorsPanelContent({
  colors,
  isLoading = false,
  loadingMessage = 'Extrayendo colores de la imagen…',
  showPalettePreview = true,
}: Omit<SelectColorsPanelProps, 'rolePalette' | 'onRolePaletteChange'>) {
  if (isLoading) {
    return <PaletteBuilderSkeleton message={loadingMessage} />;
  }

  const groupsPanel = (
    <ColorGroupsPanel colors={colors} />
  );

  if (!showPalettePreview) {
    return groupsPanel;
  }

  return (
    <div className="flex w-full min-w-0 flex-col gap-8 lg:grid lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-start">
      <div className="min-w-0 space-y-8 rounded-lg border border-border bg-bg p-5">
        {groupsPanel}
      </div>
      <div className="min-w-0">
        <RolePaletteGrid />
      </div>
    </div>
  );
}

function RolePaletteSync({
  rolePalette,
  onRolePaletteChange,
  children,
}: {
  rolePalette: RolePalette;
  onRolePaletteChange: (palette: RolePalette) => void;
  children: React.ReactNode;
}) {
  const { setRolePalette, rolePalette: contextPalette } = useRolePalette();

  useEffect(() => {
    setRolePalette(rolePalette);
  }, [rolePalette, setRolePalette]);

  useEffect(() => {
    if (contextPalette) {
      onRolePaletteChange(contextPalette);
    }
  }, [contextPalette, onRolePaletteChange]);

  return children;
}

export function SelectColorsPanel({
  colors,
  rolePalette,
  onRolePaletteChange,
  isLoading = false,
  loadingMessage = 'Extrayendo colores de la imagen…',
  showPalettePreview = true,
}: SelectColorsPanelProps) {
  return (
    <RolePaletteProvider>
      <RolePaletteSync rolePalette={rolePalette} onRolePaletteChange={onRolePaletteChange}>
        <SelectColorsPanelContent
          colors={colors}
          isLoading={isLoading}
          loadingMessage={loadingMessage}
          showPalettePreview={showPalettePreview}
        />
      </RolePaletteSync>
    </RolePaletteProvider>
  );
}
