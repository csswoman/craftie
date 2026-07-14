'use client';

import { useEffect, useRef, useState } from 'react';

import {
  formatExtractedColorCount,
  getRolePalettePanelStatus,
} from '@lib/color/selectionPanel';
import type { SelectableColor } from '@lib/color/selectableColors';

import { AddColorMenu } from '@/components/color-engine/AddColorMenu';
import { ColorGroupsPanel } from '@/components/color-engine/ColorGroupsPanel';
import { GenerateButton } from '@/components/color-engine/GenerateButton';
import { CollapsibleSection } from '@/components/layout/CollapsibleSection';
import { useRolePalette } from '@/context/RolePaletteContext';

export type ColorSelectionPanelProps = {
  catalogSource: 'none' | 'curated' | 'image';
  isExtracting: boolean;
  isRegenerating?: boolean;
  colors: SelectableColor[];
  isGenerating: boolean;
  onGenerate: () => void;
  onAddColorByHex: (hex: string, customName?: string) => string | null;
  onRenameColor?: (color: SelectableColor, newName: string) => boolean;
  rightPanelCollapsed?: boolean;
};

export function ColorSelectionPanel({
  catalogSource,
  isExtracting,
  isRegenerating = false,
  colors,
  isGenerating,
  onGenerate,
  onAddColorByHex,
  onRenameColor,
  rightPanelCollapsed = false,
}: ColorSelectionPanelProps) {
  const { rolePalette, activeRole, selectionReady } = useRolePalette();
  const [catalogOpen, setCatalogOpen] = useState(activeRole === null);
  const previousPanelCollapsed = useRef(rightPanelCollapsed);

  useEffect(() => {
    // Switching roles should collapse the catalog into assignment mode.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCatalogOpen(activeRole === null);
  }, [activeRole]);

  useEffect(() => {
    if (previousPanelCollapsed.current && !rightPanelCollapsed) {
      setCatalogOpen(true);
    }

    previousPanelCollapsed.current = rightPanelCollapsed;
  }, [rightPanelCollapsed]);

  if (isExtracting && colors.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <SelectionPanelStatus extractedCount={0} />
        <div className="flex flex-1 items-center px-4 py-6">
          <p className="text-chrome-label text-muted">Extrayendo colores de la imagen…</p>
        </div>
      </div>
    );
  }

  if (colors.length === 0 || !rolePalette) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <SelectionPanelStatus extractedCount={0} />
        <div className="flex flex-1 items-center px-4 py-6">
          <p className="text-chrome-label leading-relaxed text-muted">
            Sube una imagen o elige un estilo para empezar a asignar colores a cada rol.
          </p>
        </div>
      </div>
    );
  }

  const status = getRolePalettePanelStatus(rolePalette);

  return (
    <div className={`flex min-h-0 flex-1 flex-col ${isRegenerating ? 'opacity-80' : ''}`}>
      <div className="shrink-0 border-b border-border px-4 py-2.5">
        <SelectionPanelStatus
          extractedCount={colors.length}
          isRegenerating={isRegenerating}
          status={status}
          catalogSource={catalogSource}
          catalogOpen={catalogOpen}
          activeRole={activeRole}
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        <CollapsibleSection
          title="Colores fuente"
          open={catalogOpen}
          onOpenChange={setCatalogOpen}
          trailing={
            <>
              {isRegenerating ? (
                <p className="text-chrome-caption font-medium text-muted">Regenerando…</p>
              ) : null}
              {colors.length > 0 ? (
                <p className="text-chrome-caption font-medium text-muted">
                  {formatExtractedColorCount(colors.length)}
                </p>
              ) : null}
              <AddColorMenu onSubmit={onAddColorByHex} />
            </>
          }
        >
          <ColorGroupsPanel colors={colors} onRenameColor={onRenameColor} />
        </CollapsibleSection>
      </div>

      <div className="shrink-0 border-t border-border bg-bg px-4 py-3">
        <GenerateButton onClick={onGenerate} disabled={!selectionReady} busy={isGenerating} />
      </div>
    </div>
  );
}

function SelectionPanelStatus({
  extractedCount,
  isRegenerating = false,
  status,
  catalogSource,
  catalogOpen,
  activeRole,
}: {
  extractedCount: number;
  isRegenerating?: boolean;
  status?: ReturnType<typeof getRolePalettePanelStatus>;
  catalogSource?: 'none' | 'curated' | 'image';
  catalogOpen?: boolean;
  activeRole?: string | null;
}) {
  return (
    <>
      {status ? (
        <div className="space-y-1">
          <p
            className={`rounded-md px-2.5 py-1.5 text-chrome-caption font-medium ${
              status.ready ? 'bg-pass/10 text-pass' : 'bg-fail/10 text-fail'
            }`}
            role="status"
          >
            {status.message}
          </p>
          {status.suggestions.length > 0 ? (
            <ul className="space-y-0.5 px-1 text-chrome-caption text-muted">
              {status.suggestions.map((suggestion) => (
                <li key={suggestion}>{suggestion}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : extractedCount === 0 && !isRegenerating ? (
        <p className="text-chrome-label font-semibold text-ink">Colores fuente</p>
      ) : null}
      {catalogSource === 'image' ? (
        <p className="mt-1 text-chrome-caption text-muted">
          {activeRole
            ? catalogOpen
              ? 'Elige un color fuente para asignarlo al rol activo.'
              : 'Abre Colores fuente para asignar un color al rol activo.'
            : 'Elige un rol en el lienzo y luego un color fuente.'}
        </p>
      ) : null}
    </>
  );
}
