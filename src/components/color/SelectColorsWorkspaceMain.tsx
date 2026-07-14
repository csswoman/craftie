import type { FontPair } from '@lib/typography/pairings';
import type { TypeScaleBase, TypeScaleRatio } from '@lib/typography/typeScale';
import type { ImageExtractionMode } from '@lib/color/imagePalette';
import type { SelectableColor } from '@lib/color/selectableColors';

import { PaletteCanvas } from '@/components/color/PaletteCanvas';
import { PaintPaletteCanvas } from '@/components/color/PaintPaletteCanvas';

export function SelectColorsWorkspaceMain({
  isImageExtracting,
  isImageRegenerating,
  recommendedPairings,
  selectedPairing,
  hoveredPairing,
  isTypePreviewing,
  typeScaleBase,
  typeScaleRatio,
  onAddColorByHex,
  imageMode,
  paletteCatalog,
}: {
  isImageExtracting: boolean;
  isImageRegenerating: boolean;
  recommendedPairings: FontPair[];
  selectedPairing: FontPair | null;
  hoveredPairing: FontPair | null;
  isTypePreviewing: boolean;
  typeScaleBase: TypeScaleBase;
  typeScaleRatio: TypeScaleRatio;
  onAddColorByHex: (hex: string, customName?: string) => string | null;
  imageMode: ImageExtractionMode;
  paletteCatalog: SelectableColor[];
}) {
  if (imageMode === 'paint' && paletteCatalog.length > 0) {
    return <PaintPaletteCanvas colors={paletteCatalog} />;
  }

  return (
    <PaletteCanvas
      isLoading={isImageExtracting}
      isUpdating={isImageRegenerating}
      editable
      recommendedPairings={recommendedPairings}
      selectedPairing={selectedPairing}
      hoveredPairing={hoveredPairing}
      isTypePreviewing={isTypePreviewing}
      typeScaleBase={typeScaleBase}
      typeScaleRatio={typeScaleRatio}
      onAddColorByHex={onAddColorByHex}
    />
  );
}
