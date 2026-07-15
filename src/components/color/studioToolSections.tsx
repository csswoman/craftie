import type { ReactNode } from 'react';

import type { SelectableColor } from '@lib/color/selectableColors';
import type { FontPair } from '@lib/typography/pairings';
import type { AppliedTypography } from '@lib/typography/typeState';
import type { TypeScaleBase, TypeScaleRatio } from '@lib/typography/typeScale';
import type { CustomFont } from '@lib/typography/customFonts';
import type { PaletteType } from '@lib/color/paletteClassification';

import { ImageUploader } from '@/components/color-engine/ImageUploader';
import { GenerateButton } from '@/components/color-engine/GenerateButton';
import { SidebarTypographySection } from '@/components/color/SidebarTypographySection';
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
  imagePaletteType: PaletteType | null;
  paletteTypeOverride: PaletteType | null;
  onImageFileSelected: (file: File) => void;
  onImageRegenerate: () => void;
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
  isGenerating: boolean;
  selectionReady: boolean;
  onGenerate: () => void;
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
        paletteType={input.imagePaletteType}
        paletteTypeOverride={input.paletteTypeOverride}
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

  const sections: StudioToolSection[] = [
    { id: 'image', label: 'Imagen', content: imageSection },
    { id: 'source', label: 'Colores', content: (
      <div className="space-y-[var(--chrome-space-4)]">
        <UiColorPanel colors={input.paletteCatalog} mobile={target === 'mobile'} />
        {!input.isReviewPhase ? (
          <div
            className={`sticky bottom-0 z-sticky border-t border-border bg-bg pt-[var(--chrome-space-3)] ${
              target === 'mobile'
                ? '-mx-[var(--chrome-space-3)] -mb-[var(--chrome-space-3)] px-[var(--chrome-space-3)] pb-[var(--chrome-space-3)]'
                : ''
            }`}
          >
            <GenerateButton
              onClick={input.onGenerate}
              disabled={!input.selectionReady}
              busy={input.isGenerating}
            />
          </div>
        ) : null}
      </div>
    ) },
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

  return sections;
}
