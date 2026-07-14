import type { ReactNode } from 'react';

import type { SelectableColor } from '@lib/color/selectableColors';
import type { FontPair } from '@lib/typography/pairings';
import type { AppliedTypography } from '@lib/typography/typeState';
import type { TypeScaleBase, TypeScaleRatio } from '@lib/typography/typeScale';
import type { CustomFont } from '@lib/typography/customFonts';
import type { ImageExtractionMode } from '@lib/color/imagePalette';
import type { PaletteType } from '@lib/color/paletteClassification';

import { ImageUploader } from '@/components/color-engine/ImageUploader';
import { PaletteAdjustmentsSection } from '@/components/color/PaletteAdjustmentsSection';
import { SidebarTypographySection } from '@/components/color/SidebarTypographySection';
import { SourceColorsSection } from '@/components/color/SourceColorsSection';
import { UiColorPanel } from '@/components/color/UiColorPanel';
import type { CustomFontSubmitInput } from '@/components/font-pairing/CustomFontEntry';
import { Button } from '@/components/ui/Button';

export type StudioToolSectionId = 'image' | 'source' | 'adjustments' | 'typography';

export type StudioToolSection = {
  id: StudioToolSectionId;
  label: string;
  content: ReactNode;
};

export type StudioToolsInput = {
  catalogSource: 'none' | 'curated' | 'image';
  fileName: string | null;
  hasPreview: boolean;
  isReviewPhase: boolean;
  isImageBusy: boolean;
  imagePreviewUrl: string | null;
  fontPairings: FontPair[];
  paletteCatalog: SelectableColor[];
  recommendedPairings: FontPair[];
  appliedTypography: AppliedTypography;
  selectedCatalogPairId: string | null;
  pinHeading: boolean;
  pinBody: boolean;
  typeScaleBase: TypeScaleBase;
  typeScaleRatio: TypeScaleRatio;
  customFonts: CustomFont[];
  imageMode: ImageExtractionMode;
  imagePaletteType: PaletteType | null;
  paletteTypeOverride: PaletteType | null;
  onImageFileSelected: (file: File) => void;
  onImageRegenerate: () => void;
  onImageModeChange: (mode: ImageExtractionMode) => void;
  onPaletteTypeChange: (type: PaletteType | null) => void;
  onOpenInspiration: () => void;
  onSelectPairing: (pairing: FontPair) => void;
  onPreviewPairing: (pairing: FontPair) => void;
  onClearPreview: () => void;
  onTogglePinHeading: () => void;
  onTogglePinBody: () => void;
  onTypeScaleBaseChange: (base: TypeScaleBase) => void;
  onTypeScaleRatioChange: (ratio: TypeScaleRatio) => void;
  onApplyCustomFont: (input: CustomFontSubmitInput) => Promise<void>;
};

export function buildStudioToolSections(
  input: StudioToolsInput,
  target: 'sidebar' | 'mobile' = 'sidebar',
): StudioToolSection[] {
  const imageSection = (
    <>
      <ImageUploader
        fileName={input.fileName}
        hasPreview={input.hasPreview}
        isLoading={input.isImageBusy}
        previewUrl={input.imagePreviewUrl}
        onFileSelected={input.onImageFileSelected}
        onRegenerate={input.onImageRegenerate}
        variant="embedded"
        previewVariant="compact"
        showHeader={false}
        showDropzone={!input.hasPreview}
        showChangeImageControl={input.hasPreview}
        mode={input.imageMode}
        paletteType={input.imagePaletteType}
        paletteTypeOverride={input.paletteTypeOverride}
        onModeChange={input.onImageModeChange}
        onPaletteTypeChange={input.onPaletteTypeChange}
      />
      {!input.isReviewPhase && !input.hasPreview && input.catalogSource === 'none' ? (
        <Button
          type="button"
          variant="ghost"
          className="w-full min-h-11 border border-border/50 px-3 py-2 text-tools-body"
          onClick={input.onOpenInspiration}
        >
          Elegir inspiración
        </Button>
      ) : null}
    </>
  );

  return [
    { id: 'image', label: 'Imagen', content: imageSection },
    { id: 'source', label: 'Colores', content: (
      input.imageMode === 'ui'
        ? <UiColorPanel colors={input.paletteCatalog} />
        : <SourceColorsSection colors={input.paletteCatalog} embedded={target === 'mobile'} />
    ) },
    {
      id: 'adjustments',
      label: 'Ajustes',
      content: (
        input.imageMode === 'paint' ? (
          <PaletteAdjustmentsSection
            defaultOpen={target === 'mobile'}
            embedded={target === 'mobile'}
          />
        ) : null
      ),
    },
    {
      id: 'typography',
      label: 'Tipografía',
      content: (
        <SidebarTypographySection
          fontPairings={input.fontPairings}
          recommendedPairings={input.recommendedPairings}
          applied={input.appliedTypography}
          selectedCatalogPairId={input.selectedCatalogPairId}
          pinHeading={input.pinHeading}
          pinBody={input.pinBody}
          base={input.typeScaleBase}
          ratio={input.typeScaleRatio}
          customFonts={input.customFonts}
          onSelectPairing={input.onSelectPairing}
          onPreviewPairing={input.onPreviewPairing}
          onClearPreview={input.onClearPreview}
          onTogglePinHeading={input.onTogglePinHeading}
          onTogglePinBody={input.onTogglePinBody}
          onBaseChange={input.onTypeScaleBaseChange}
          onRatioChange={input.onTypeScaleRatioChange}
          onApplyCustomFont={input.onApplyCustomFont}
          embedded
        />
      ),
    },
  ];
}
