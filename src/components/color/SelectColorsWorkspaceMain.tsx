import type { FontPair } from '@lib/typography/pairings';
import type { AppliedTypography } from '@lib/typography/typeState';
import type { TypeScaleBase, TypeScaleRatio } from '@lib/typography/typeScale';
import type { SelectableColor } from '@lib/color/selectableColors';

import { PaletteCanvas } from '@/components/color/PaletteCanvas';
export function SelectColorsWorkspaceMain({
  isImageExtracting,
  isImageRegenerating,
  recommendedPairings,
  selectedPairing,
  appliedTypography,
  hoveredPairing,
  isTypePreviewing,
  typeScaleBase,
  typeScaleRatio,
  onAddColorByHex,
  paletteCatalog,
}: {
  isImageExtracting: boolean;
  isImageRegenerating: boolean;
  recommendedPairings: FontPair[];
  selectedPairing: FontPair | null;
  appliedTypography: AppliedTypography;
  hoveredPairing: FontPair | null;
  isTypePreviewing: boolean;
  typeScaleBase: TypeScaleBase;
  typeScaleRatio: TypeScaleRatio;
  onAddColorByHex: (hex: string, customName?: string) => string | null;
  paletteCatalog: SelectableColor[];
}) {
  return (
    <PaletteCanvas
      isLoading={isImageExtracting}
      isUpdating={isImageRegenerating}
      editable
      recommendedPairings={recommendedPairings}
      selectedPairing={selectedPairing}
      appliedTypography={appliedTypography}
      hoveredPairing={hoveredPairing}
      isTypePreviewing={isTypePreviewing}
      typeScaleBase={typeScaleBase}
      typeScaleRatio={typeScaleRatio}
      paletteCatalog={paletteCatalog}
      onAddColorByHex={onAddColorByHex}
    />
  );
}
