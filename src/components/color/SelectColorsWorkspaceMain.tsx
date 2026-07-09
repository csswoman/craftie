import type { FontPair } from '@lib/typography/pairings';

import { PaletteCanvas } from '@/components/color/PaletteCanvas';

export function SelectColorsWorkspaceMain({
  isImageExtracting,
  isImageRegenerating,
  fontPairings,
  recommendedPairings,
  selectedPairing,
  onAddColorByHex,
  onSelectPairing,
}: {
  isImageExtracting: boolean;
  isImageRegenerating: boolean;
  fontPairings: FontPair[];
  recommendedPairings: FontPair[];
  selectedPairing: FontPair | null;
  onAddColorByHex: (hex: string, customName?: string) => string | null;
  onSelectPairing: (pairing: FontPair) => void;
}) {
  return (
    <PaletteCanvas
      isLoading={isImageExtracting}
      isUpdating={isImageRegenerating}
      editable
      fontPairings={fontPairings}
      recommendedPairings={recommendedPairings}
      selectedPairing={selectedPairing}
      onAddColorByHex={onAddColorByHex}
      onSelectPairing={onSelectPairing}
    />
  );
}
