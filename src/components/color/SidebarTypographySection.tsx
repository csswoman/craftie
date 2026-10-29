'use client';

import { useState } from 'react';
import type { AppliedTypography } from '@lib/typography/typeState';
import type { TypeScaleBase, TypeScaleRatio } from '@lib/typography/typeScale';
import type { FontPair } from '@lib/typography/pairings';

import { AppliedTypeZone } from '@/components/font-pairing/AppliedTypeZone';
import type { CustomFontSubmitInput } from '@/components/font-pairing/CustomFontModal';
import { PairingList } from '@/components/font-pairing/PairingList';
import type { SizeOverrides } from '@/components/font-pairing/FineTuneSizes';
import type { TypographySpacing } from '@/components/font-pairing/SpacingControls';

export type SidebarTypographySectionProps = {
  fontPairings: FontPair[];
  recommendedPairings: FontPair[];
  applied: AppliedTypography;
  selectedCatalogPairId: string | null;
  pinHeading: boolean;
  pinBody: boolean;
  base: TypeScaleBase;
  ratio: TypeScaleRatio;
  onSelectPairing: (pairing: FontPair) => void;
  onPreviewPairing: (pairing: FontPair) => void;
  onClearPreview: () => void;
  onTogglePinHeading: () => void;
  onTogglePinBody: () => void;
  onBaseChange: (base: TypeScaleBase) => void;
  onRatioChange: (ratio: TypeScaleRatio) => void;
  onHeadingWeightChange: (weight: number) => void;
  onBodyWeightChange: (weight: number) => void;
  overrides: SizeOverrides;
  spacing: TypographySpacing;
  largerSteps: number;
  smallerSteps: number;
  onOverridesChange: (overrides: SizeOverrides) => void;
  onSpacingChange: (spacing: TypographySpacing) => void;
  onAddLargerStep: () => void;
  onAddSmallerStep: () => void;
  onApplyCustomFont: (input: CustomFontSubmitInput) => Promise<void>;
  embedded?: boolean;
};

export function SidebarTypographySection({
  fontPairings,
  recommendedPairings,
  applied,
  selectedCatalogPairId,
  pinHeading,
  pinBody,
  base,
  ratio,
  onSelectPairing,
  onPreviewPairing,
  onClearPreview,
  onTogglePinHeading,
  onTogglePinBody,
  onBaseChange,
  onRatioChange,
  onHeadingWeightChange,
  onBodyWeightChange,
  overrides,
  spacing,
  largerSteps,
  smallerSteps,
  onOverridesChange,
  onSpacingChange,
  onAddLargerStep,
  onAddSmallerStep,
  onApplyCustomFont,
  embedded = false,
}: SidebarTypographySectionProps) {
  const [configOpen, setConfigOpen] = useState(false);
  const listInert = pinHeading && pinBody;

  return (
    <div className="min-w-0 space-y-4">
      <AppliedTypeZone
        applied={applied}
        pinHeading={pinHeading}
        pinBody={pinBody}
        base={base}
        ratio={ratio}
        onTogglePinHeading={onTogglePinHeading}
        onTogglePinBody={onTogglePinBody}
        onBaseChange={onBaseChange}
        onRatioChange={onRatioChange}
        onHeadingWeightChange={onHeadingWeightChange}
        onBodyWeightChange={onBodyWeightChange}
        onApplyGoogleFont={(family, role) =>
          onApplyCustomFont({ family, source: 'google', role })
        }
        overrides={overrides}
        spacing={spacing}
        largerSteps={largerSteps}
        smallerSteps={smallerSteps}
        onOverridesChange={onOverridesChange}
        onSpacingChange={onSpacingChange}
        onAddLargerStep={onAddLargerStep}
        onAddSmallerStep={onAddSmallerStep}
        configOpen={configOpen}
        onConfigOpenChange={setConfigOpen}
        stickToPanelTop={embedded}
      />
      {!configOpen ? (
        <>
          <PairingList pairings={fontPairings} recommendedPairings={recommendedPairings} selectedCatalogPairId={selectedCatalogPairId} listInert={listInert} onSelectPairing={onSelectPairing} onPreviewPairing={onPreviewPairing} onClearPreview={onClearPreview} variant="tools" />
        </>
      ) : null}
    </div>
  );
}
