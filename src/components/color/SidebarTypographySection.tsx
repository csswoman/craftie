'use client';

import { resolveActiveFontPair } from '@lib/typography/activePairing';
import type { FontPair } from '@lib/typography/pairings';

import { PairingList } from '@/components/font-pairing/PairingList';
import { CollapsibleSection } from '@/components/layout/CollapsibleSection';

export type SidebarTypographySectionProps = {
  fontPairings: FontPair[];
  recommendedPairings: FontPair[];
  selectedPairing: FontPair | null;
  onSelectPairing: (pairing: FontPair) => void;
  embedded?: boolean;
};

export function SidebarTypographySection({
  fontPairings,
  recommendedPairings,
  selectedPairing,
  onSelectPairing,
  embedded = false,
}: SidebarTypographySectionProps) {
  const activePairing = resolveActiveFontPair(selectedPairing, recommendedPairings);

  const content = (
    <PairingList
      pairings={fontPairings}
      selectedPairing={activePairing}
      onSelectPairing={onSelectPairing}
      variant="tools"
    />
  );

  if (embedded) {
    return content;
  }

  return (
    <CollapsibleSection
      title="Tipografía"
      defaultOpen
      collapsible={false}
      variant="neutral"
      className="flex min-h-0 flex-1 flex-col"
      contentClassName="flex min-h-0 flex-1 flex-col"
      icon={<TypeIcon />}
    >
      {content}
    </CollapsibleSection>
  );
}

function TypeIcon() {
  return (
    <span aria-hidden="true" className="text-tools-section font-medium leading-none">
      Aa
    </span>
  );
}
