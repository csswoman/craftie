import type { FontPair } from '@lib/typography/pairings';

import { ImageUploader } from '@/components/color-engine/ImageUploader';
import { RoleActiveSelector } from '@/components/color/RoleActiveSelector';
import { StudioToolsPanel } from '@/components/color/StudioToolsPanel';
import { Button } from '@/components/ui/Button';
import { PairingList } from '@/components/font-pairing/PairingList';
import { CollapsibleSection } from '@/components/layout/CollapsibleSection';

export function SelectColorsWorkspaceSidebar({
  catalogSource,
  fileName,
  hasPreview,
  isReviewPhase,
  isImageBusy,
  imagePreviewUrl,
  recommendedPairings,
  rolePaletteAvailable,
  selectedPairing,
  onImageFileSelected,
  onImageRegenerate,
  onOpenInspiration,
  onSelectPairing,
}: {
  catalogSource: 'none' | 'curated' | 'image';
  fileName: string | null;
  hasPreview: boolean;
  isReviewPhase: boolean;
  isImageBusy: boolean;
  imagePreviewUrl: string | null;
  recommendedPairings: FontPair[];
  rolePaletteAvailable: boolean;
  selectedPairing: FontPair | null;
  onImageFileSelected: (file: File) => void;
  onImageRegenerate: () => void;
  onOpenInspiration: () => void;
  onSelectPairing: (pairing: FontPair) => void;
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
            />
            {rolePaletteAvailable ? <RoleActiveSelector /> : null}
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
            />
            {rolePaletteAvailable ? <RoleActiveSelector /> : null}
            {catalogSource === 'none' ? (
              <Button
                type="button"
                variant="ghost"
                className="w-full border border-border/50 px-3 py-2 text-[0.8125rem]"
                onClick={onOpenInspiration}
              >
                Elegir inspiración
              </Button>
            ) : null}
          </>
        )}
      </StudioToolsPanel>
      {isReviewPhase ? (
        <div className="shrink-0 border-t border-border px-4 py-3">
          <CollapsibleSection title="Tipografía" defaultOpen={recommendedPairings.length > 0}>
            <PairingList
              pairings={recommendedPairings}
              selectedPairing={selectedPairing}
              onSelectPairing={onSelectPairing}
            />
          </CollapsibleSection>
        </div>
      ) : null}
    </div>
  );
}
