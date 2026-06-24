'use client';

import {
  formatExtractedColorCount,
  getSelectionPanelStatus,
} from '@lib/color/selectionPanel';
import type { SelectableColor } from '@lib/color/selectableColors';

import { ColorGroupsPanel } from '@/components/color-engine/ColorGroupsPanel';

export type ColorSelectionPanelProps = {
  catalogSource: 'none' | 'curated' | 'image';
  isExtracting: boolean;
  colors: SelectableColor[];
  selectedColors: SelectableColor[];
  onSelectedColorsChange: (colors: SelectableColor[]) => void;
};

export function ColorSelectionPanel({
  catalogSource,
  isExtracting,
  colors,
  selectedColors,
  onSelectedColorsChange,
}: ColorSelectionPanelProps) {
  if (isExtracting) {
    return (
      <div className="flex min-h-0 flex-1 flex-col p-4">
        <p className="text-[0.8125rem] leading-relaxed text-muted">
          Analizando la imagen y organizando colores por grupo…
        </p>
      </div>
    );
  }

  if (colors.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 flex-col p-4">
        <p className="text-[0.8125rem] leading-relaxed text-muted">
          Sube una imagen o elige un estilo de inspiración para ajustar los colores aquí.
        </p>
      </div>
    );
  }

  const status = getSelectionPanelStatus(selectedColors);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 border-b border-border px-4 py-3">
        <h2 className="text-[0.9375rem] font-semibold text-ink">Ajustar selección</h2>
        <p className="mt-1 text-[0.8125rem] leading-relaxed text-muted">
          {catalogSource === 'image'
            ? 'Colores extraídos de tu imagen, organizados por grupo.'
            : 'Colores del estilo elegido. Ajusta la selección en cada grupo.'}
        </p>
        <p className="mt-2 text-[0.75rem] font-medium text-muted">
          {formatExtractedColorCount(colors.length)}
        </p>
        <p
          className={`mt-2 rounded-md px-3 py-2 text-[0.8125rem] font-medium ${
            status.ready
              ? 'bg-pass/10 text-pass'
              : 'bg-fail/10 text-fail'
          }`}
          role="status"
        >
          {status.message}
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        <ColorGroupsPanel
          colors={colors}
          selectedColors={selectedColors}
          onSelectedColorsChange={onSelectedColorsChange}
        />
      </div>
    </div>
  );
}
