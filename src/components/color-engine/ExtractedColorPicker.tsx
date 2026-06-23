'use client';

import { useEffect, useState } from 'react';

import type { ExtractedColor } from '@lib/color/imageExtractor';
import { MAX_SEED_COUNT } from '@lib/color/seeds';

import { Button } from '@/components/ui/Button';

export type ExtractedColorPickerProps = {
  colors: ExtractedColor[];
  onConfirmSeeds: (seeds: string[]) => void;
};

function formatProminence(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function ExtractedColorPicker({ colors, onConfirmSeeds }: ExtractedColorPickerProps) {
  const [selectedHexes, setSelectedHexes] = useState<string[]>(() => colors.map((color) => color.hex));

  useEffect(() => {
    setSelectedHexes(colors.map((color) => color.hex));
  }, [colors]);

  function toggleColor(hex: string) {
    setSelectedHexes((current) => {
      if (current.includes(hex)) {
        return current.filter((value) => value !== hex);
      }

      if (current.length >= MAX_SEED_COUNT) {
        return current;
      }

      return [...current, hex];
    });
  }

  function handleConfirm() {
    onConfirmSeeds(selectedHexes);
  }

  const selectionFull = selectedHexes.length >= MAX_SEED_COUNT;

  return (
    <section
      aria-label="Colores extraídos"
      className="mt-4 rounded-md border border-border bg-bg p-4"
    >
      <h3 className="text-[0.9375rem] font-semibold text-ink">Colores extraídos</h3>
      <p className="mt-1 text-[0.8125rem] text-muted">
        Elige hasta {MAX_SEED_COUNT} colores para usarlos como semillas. Todos vienen seleccionados
        por defecto.
      </p>

      <ul className="mt-4 flex flex-col gap-3">
        {colors.map((color) => {
          const isSelected = selectedHexes.includes(color.hex);
          const isDisabled = !isSelected && selectionFull;

          return (
            <li key={color.hex}>
              <button
                type="button"
                onClick={() => toggleColor(color.hex)}
                disabled={isDisabled}
                aria-pressed={isSelected}
                className={`flex w-full items-center gap-4 rounded-md border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-50 ${
                  isSelected
                    ? 'border-primary bg-surface ring-1 ring-primary/20'
                    : 'border-border bg-surface hover:bg-surface-raised'
                }`}
              >
                <span
                  className="h-12 w-12 shrink-0 rounded-md border border-border"
                  style={{ backgroundColor: color.hex }}
                  aria-hidden="true"
                />
                <span className="min-w-0 flex-1">
                  <span className="block font-mono text-[0.9375rem] font-semibold text-ink">
                    {color.hex}
                  </span>
                  <span className="mt-0.5 block text-[0.8125rem] text-muted">
                    Prominencia {formatProminence(color.prominence)}
                  </span>
                </span>
                <span className="text-[0.8125rem] font-medium text-muted">
                  {isSelected ? 'Seleccionado' : 'Sin seleccionar'}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button type="button" onClick={handleConfirm} disabled={selectedHexes.length === 0}>
          Usar colores seleccionados
        </Button>
        <p className="text-[0.8125rem] text-muted">
          {selectedHexes.length} de {Math.min(colors.length, MAX_SEED_COUNT)} semillas
        </p>
      </div>
    </section>
  );
}
