import type { SelectableColor } from '@lib/color/selectableColors';

import { ColorSelectionPanel } from '@/components/color/ColorSelectionPanel';
import { RoleInspector } from '@/components/color/RoleInspector';
import { useRolePalette } from '@/context/RolePaletteContext';

export function SelectColorsWorkspaceRightPanel({
  catalogSource,
  isGenerating,
  isImageExtracting,
  isImageRegenerating,
  paletteCatalog,
  rightPanelCollapsed,
  onAddColorByHex,
  onGenerate,
  onRenameColor,
}: {
  catalogSource: 'none' | 'curated' | 'image';
  isGenerating: boolean;
  isImageExtracting: boolean;
  isImageRegenerating: boolean;
  paletteCatalog: SelectableColor[];
  rightPanelCollapsed: boolean;
  onAddColorByHex: (hex: string, customName?: string) => string | null;
  onGenerate: () => void;
  onRenameColor: (color: SelectableColor, newName: string) => boolean;
}) {
  const { rolePalette, activeRole } = useRolePalette();

  if (rolePalette && activeRole !== null) {
    return (
      <div className="h-full min-h-0 overflow-y-auto p-4">
        <RoleInspector />
      </div>
    );
  }

  if (rolePalette) {
    return (
      <div className="flex h-full min-h-0 flex-col justify-center p-6">
        <p className="text-chrome-label leading-relaxed text-muted">
          Elige un rol en el lienzo para revisar contraste, editar el color o ver las vistas previas.
        </p>
      </div>
    );
  }

  return (
    <ColorSelectionPanel
      catalogSource={catalogSource}
      isExtracting={isImageExtracting}
      isRegenerating={isImageRegenerating}
      colors={paletteCatalog}
      isGenerating={isGenerating}
      onGenerate={onGenerate}
      onAddColorByHex={onAddColorByHex}
      onRenameColor={onRenameColor}
      rightPanelCollapsed={rightPanelCollapsed}
    />
  );
}
