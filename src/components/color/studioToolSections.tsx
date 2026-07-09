import type { ReactNode } from 'react';

import type { SelectableColor } from '@lib/color/selectableColors';
import type { FontPair } from '@lib/typography/pairings';

import { ImageUploader } from '@/components/color-engine/ImageUploader';
import { PaletteAdjustmentsSection } from '@/components/color/PaletteAdjustmentsSection';
import { SidebarTypographySection } from '@/components/color/SidebarTypographySection';
import { SourceColorsSection } from '@/components/color/SourceColorsSection';
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
  selectedPairing: FontPair | null;
  onImageFileSelected: (file: File) => void;
  onImageRegenerate: () => void;
  onOpenInspiration: () => void;
  onSelectPairing: (pairing: FontPair) => void;
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
      <SourceColorsSection colors={input.paletteCatalog} embedded={target === 'mobile'} />
    ) },
    {
      id: 'adjustments',
      label: 'Ajustes',
      content: (
        <PaletteAdjustmentsSection
          defaultOpen={target === 'mobile'}
          embedded={target === 'mobile'}
        />
      ),
    },
    {
      id: 'typography',
      label: 'Tipografía',
      content: (
        <SidebarTypographySection
          fontPairings={input.fontPairings}
          recommendedPairings={input.recommendedPairings}
          selectedPairing={input.selectedPairing}
          onSelectPairing={input.onSelectPairing}
          embedded={target === 'mobile'}
        />
      ),
    },
  ];
}
