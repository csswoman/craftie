import type { FontPair } from '@lib/typography/pairings';

import { PaletteCanvas } from '@/components/color/PaletteCanvas';

export function SelectColorsWorkspaceMain({
  isImageExtracting,
  isImageRegenerating,
  recommendedPairings,
  selectedPairing,
  onAddColorByHex,
}: {
  isImageExtracting: boolean;
  isImageRegenerating: boolean;
  recommendedPairings: FontPair[];
  selectedPairing: FontPair | null;
  onAddColorByHex: (hex: string, customName?: string) => string | null;
}) {
  return (
    <PaletteCanvas
      isLoading={isImageExtracting}
      isUpdating={isImageRegenerating}
      editable
      recommendedPairings={recommendedPairings}
      selectedPairing={selectedPairing}
      onAddColorByHex={onAddColorByHex}
    />
  );
}
