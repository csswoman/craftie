import type { GeneratedPalette } from '@lib/color/formulas';
import type { SelectableColor } from '@lib/color/selectableColors';
import type { FontPair } from '@lib/typography/pairings';

import { ColorSelectionPanel } from '@/components/color/ColorSelectionPanel';
import { InspectorPanel, type InspectorSection } from '@/components/color/InspectorPanel';
import { ContrastPanel } from '@/components/color-engine/ContrastPanel';
import { MockupPreviewGrid } from '@/components/brand-preview/MockupPreviewGrid';

export function SelectColorsWorkspaceRightPanel({
  catalogSource,
  generatedPalette,
  inspectorSection,
  isGenerating,
  isImageExtracting,
  isImageRegenerating,
  isReviewPhase,
  paletteCatalog,
  rightPanelCollapsed,
  selectedPairing,
  onAddColorByHex,
  onGenerate,
  onRenameColor,
  onReplacePreviewColor,
  onSectionChange,
}: {
  catalogSource: 'none' | 'curated' | 'image';
  generatedPalette: GeneratedPalette | null;
  inspectorSection: InspectorSection;
  isGenerating: boolean;
  isImageExtracting: boolean;
  isImageRegenerating: boolean;
  isReviewPhase: boolean;
  paletteCatalog: SelectableColor[];
  rightPanelCollapsed: boolean;
  selectedPairing: FontPair | null;
  onAddColorByHex: (hex: string, customName?: string) => string | null;
  onGenerate: () => void;
  onRenameColor: (color: SelectableColor, newName: string) => boolean;
  onReplacePreviewColor: (columnId: string, newHex: string) => string | null;
  onSectionChange: (section: InspectorSection) => void;
}) {
  if (isReviewPhase) {
    return (
      <InspectorPanel
        activeSection={inspectorSection}
        onSectionChange={onSectionChange}
        accessibilityPanel={
          <ContrastPanel
            palette={generatedPalette}
            variant="embedded"
            onApplyForeground={(role, hex) => {
              void onReplacePreviewColor(role, hex);
            }}
          />
        }
        layoutsPanel={
          <MockupPreviewGrid palette={generatedPalette} pairing={selectedPairing} variant="compact" />
        }
      />
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
