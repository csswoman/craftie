'use client';

import { useState } from 'react';
import type { AppliedTypography } from '@lib/typography/typeState';
import type { TypeScaleBase, TypeScaleRatio } from '@lib/typography/typeScale';
import type { FontPair } from '@lib/typography/pairings';
import type { CustomFont } from '@lib/typography/customFonts';

import { AppliedTypeZone } from '@/components/font-pairing/AppliedTypeZone';
import {
  CustomFontEntry,
  type CustomFontSubmitInput,
} from '@/components/font-pairing/CustomFontEntry';
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
  customFonts: CustomFont[];
  onSelectPairing: (pairing: FontPair) => void;
  onPreviewPairing: (pairing: FontPair) => void;
  onClearPreview: () => void;
  onTogglePinHeading: () => void;
  onTogglePinBody: () => void;
  onBaseChange: (base: TypeScaleBase) => void;
  onRatioChange: (ratio: TypeScaleRatio) => void;
  onHeadingWeightChange: (weight: number) => void;
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
  customFonts,
  onSelectPairing,
  onPreviewPairing,
  onClearPreview,
  onTogglePinHeading,
  onTogglePinBody,
  onBaseChange,
  onRatioChange,
  onHeadingWeightChange,
  overrides,
  spacing,
  largerSteps,
  smallerSteps,
  onOverridesChange,
  onSpacingChange,
  onAddLargerStep,
  onAddSmallerStep,
  onApplyCustomFont,
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
      />
      {!configOpen ? (
        <>
          <PairingList pairings={fontPairings} recommendedPairings={recommendedPairings} selectedCatalogPairId={selectedCatalogPairId} listInert={listInert} onSelectPairing={onSelectPairing} onPreviewPairing={onPreviewPairing} onClearPreview={onClearPreview} variant="tools" />
          <CustomFontEntry customFonts={customFonts} onApply={onApplyCustomFont} />
        </>
      ) : null}
    </div>
  );
}
