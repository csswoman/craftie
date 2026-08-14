import type { FontPair } from '@lib/typography/pairings';
import type { AppliedTypography } from '@lib/typography/typeState';
import type { TypeScaleBase, TypeScaleRatio } from '@lib/typography/typeScale';
import type { SelectableColor } from '@lib/color/selectableColors';
import type { SizeOverrides } from '@/components/font-pairing/FineTuneSizes';
import type { TypographySpacing } from '@/components/font-pairing/SpacingControls';

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
  typeScaleOverrides,
  typographySpacing,
  largerTypeScaleSteps,
  smallerTypeScaleSteps,
  onAddColorByHex,
  paletteCatalog,
  imagePreviewUrl,
  imageFileName,
  imageFingerprint,
  onImageFileSelected,
  onImageRegenerate,
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
  typeScaleOverrides: SizeOverrides;
  typographySpacing: TypographySpacing;
  largerTypeScaleSteps: number;
  smallerTypeScaleSteps: number;
  onAddColorByHex: (hex: string, customName?: string) => string | null;
  paletteCatalog: SelectableColor[];
  imagePreviewUrl: string | null;
  imageFileName: string | null;
  imageFingerprint: string | null;
  onImageFileSelected: (file: File) => void;
  onImageRegenerate: () => void;
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
      typeScaleOverrides={typeScaleOverrides}
      typographySpacing={typographySpacing}
      largerTypeScaleSteps={largerTypeScaleSteps}
      smallerTypeScaleSteps={smallerTypeScaleSteps}
      paletteCatalog={paletteCatalog}
      onAddColorByHex={onAddColorByHex}
      imagePreviewUrl={imagePreviewUrl}
      imageFileName={imageFileName}
      imageFingerprint={imageFingerprint}
      onImageFileSelected={onImageFileSelected}
      onImageRegenerate={onImageRegenerate}
    />
  );
}
