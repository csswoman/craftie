import type { GeneratedPalette } from '@lib/color/formulas';
import { isLayoutView, type StudioView } from '@lib/export/studioViews';
import type { FontPair } from '@lib/typography/pairings';

import { PaletteCanvas } from '@/components/color/PaletteCanvas';
import { ColorsView, LayoutPreview, TypeScaleView } from '@/components/style-guide/StudioViews';
import { StyleGuideView } from '@/components/style-guide/StyleGuideView';

export function SelectColorsWorkspaceMain({
  generatedPalette,
  studioView,
  isImageExtracting,
  isImageRegenerating,
  selectedPairing,
  onAddColorByHex,
}: {
  generatedPalette: GeneratedPalette | null;
  studioView: StudioView;
  isImageExtracting: boolean;
  isImageRegenerating: boolean;
  selectedPairing: FontPair | null;
  onAddColorByHex: (hex: string, customName?: string) => string | null;
}) {
  if (!generatedPalette) {
    return (
      <PaletteCanvas
        isLoading={isImageExtracting}
        isUpdating={isImageRegenerating}
        editable
        onAddColorByHex={onAddColorByHex}
      />
    );
  }

  if (studioView === 'style-guide') {
    return <StyleGuideView palette={generatedPalette} pairing={selectedPairing} />;
  }

  if (studioView === 'type-scale') {
    return <TypeScaleView palette={generatedPalette} pairing={selectedPairing} />;
  }

  if (studioView === 'colors') {
    return <ColorsView palette={generatedPalette} />;
  }

  if (isLayoutView(studioView)) {
    return <LayoutPreview layout={studioView} palette={generatedPalette} pairing={selectedPairing} />;
  }

  return null;
}
