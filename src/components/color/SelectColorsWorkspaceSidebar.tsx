import type { SelectableColor } from '@lib/color/selectableColors';

import { ImageUploader } from '@/components/color-engine/ImageUploader';
import { PaletteAdjustmentsSection } from '@/components/color/PaletteAdjustmentsSection';
import { SourceColorsSection } from '@/components/color/SourceColorsSection';
import { StudioToolsPanel } from '@/components/color/StudioToolsPanel';
import { Button } from '@/components/ui/Button';

export function SelectColorsWorkspaceSidebar({
  catalogSource,
  fileName,
  hasPreview,
  isReviewPhase,
  isImageBusy,
  imagePreviewUrl,
  paletteCatalog,
  onImageFileSelected,
  onImageRegenerate,
  onOpenInspiration,
}: {
  catalogSource: 'none' | 'curated' | 'image';
  fileName: string | null;
  hasPreview: boolean;
  isReviewPhase: boolean;
  isImageBusy: boolean;
  imagePreviewUrl: string | null;
  paletteCatalog: SelectableColor[];
  onImageFileSelected: (file: File) => void;
  onImageRegenerate: () => void;
  onOpenInspiration: () => void;
}) {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <StudioToolsPanel>
        {isReviewPhase ? (
          <>
            <ImageUploader
              fileName={fileName}
              hasPreview={hasPreview}
              isLoading={isImageBusy}
              previewUrl={imagePreviewUrl}
              onFileSelected={onImageFileSelected}
              onRegenerate={onImageRegenerate}
              variant="embedded"
              showHeader={false}
              showDropzone={!hasPreview}
              showChangeImageControl={hasPreview}
            />
            <SourceColorsSection colors={paletteCatalog} />
            <PaletteAdjustmentsSection />
          </>
        ) : (
          <>
            <ImageUploader
              fileName={fileName}
              hasPreview={hasPreview}
              isLoading={isImageBusy}
              previewUrl={imagePreviewUrl}
              onFileSelected={onImageFileSelected}
              onRegenerate={onImageRegenerate}
              variant="embedded"
              showHeader={false}
              showDropzone={!hasPreview}
              showChangeImageControl={hasPreview}
            />
            {!hasPreview && catalogSource === 'none' ? (
              <Button
                type="button"
                variant="ghost"
                className="w-full border border-border/50 px-3 py-2 text-[0.8125rem]"
                onClick={onOpenInspiration}
              >
                Elegir inspiración
              </Button>
            ) : null}
            <SourceColorsSection colors={paletteCatalog} />
            <PaletteAdjustmentsSection />
          </>
        )}
      </StudioToolsPanel>
    </div>
  );
}
