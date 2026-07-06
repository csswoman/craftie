import type { GeneratedPalette } from '@lib/color/formulas';
import type { ImagePaletteBuildResult } from '@lib/color/imagePalette';
import type { FontPair } from '@lib/typography/pairings';

import { ImageUploader } from '@/components/color-engine/ImageUploader';
import { PalettePreview } from '@/components/color-engine/PalettePreview';
import { RoleActiveSelector } from '@/components/color/RoleActiveSelector';
import { RoleInspector } from '@/components/color/RoleInspector';
import { ReviewPhaseControls } from '@/components/color/ReviewPhaseControls';
import { StudioToolsPanel } from '@/components/color/StudioToolsPanel';
import { Button } from '@/components/ui/Button';
import { PairingList } from '@/components/font-pairing/PairingList';
import { CollapsibleSection } from '@/components/layout/CollapsibleSection';

export function SelectColorsWorkspaceSidebar({
  generatedPalette,
  isReviewPhase,
  recommendedPairings,
  rolePaletteAvailable,
  selectedPairing,
  onAddColorByHex,
  onEditSelection,
  onImageExtractionError,
  onImageExtractionStart,
  onImagePaletteExtracted,
  onImageRegenerateStart,
  onOpenInspiration,
  onReplacePreviewColor,
  onSelectPairing,
}: {
  generatedPalette: GeneratedPalette | null;
  isReviewPhase: boolean;
  recommendedPairings: FontPair[];
  rolePaletteAvailable: boolean;
  selectedPairing: FontPair | null;
  onAddColorByHex: (hex: string, customName?: string) => string | null;
  onEditSelection: () => void;
  onImageExtractionError: (message: string) => void;
  onImageExtractionStart: () => void;
  onImagePaletteExtracted: (palette: ImagePaletteBuildResult) => void;
  onImageRegenerateStart: () => void;
  onOpenInspiration: () => void;
  onReplacePreviewColor: (columnId: string, newHex: string) => string | null;
  onSelectPairing: (pairing: FontPair) => void;
}) {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <StudioToolsPanel>
        {isReviewPhase ? (
          <>
            <ReviewPhaseControls onEditSelection={onEditSelection} />
            {generatedPalette ? (
              <PalettePreview
                palette={generatedPalette}
                variant="embedded"
                onReplaceColor={onReplacePreviewColor}
              />
            ) : null}
          </>
        ) : (
          <>
            {rolePaletteAvailable ? <RoleActiveSelector /> : null}
            <RoleInspector />
            <ImageUploader
              onExtractionStart={onImageExtractionStart}
              onRegenerateStart={onImageRegenerateStart}
              onPaletteExtracted={onImagePaletteExtracted}
              onExtractionError={onImageExtractionError}
              variant="embedded"
              showHeader={false}
            />
            <Button
              type="button"
              variant="ghost"
              className="w-full border border-border/50 px-3 py-2 text-[0.8125rem]"
              onClick={onOpenInspiration}
            >
              Elegir inspiración
            </Button>
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
