'use client';

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
  onApplyCustomFont,
}: SidebarTypographySectionProps) {
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
      />
      <PairingList
        pairings={fontPairings}
        recommendedPairings={recommendedPairings}
        selectedCatalogPairId={selectedCatalogPairId}
        listInert={listInert}
        onSelectPairing={onSelectPairing}
        onPreviewPairing={onPreviewPairing}
        onClearPreview={onClearPreview}
        variant="tools"
      />
      <CustomFontEntry customFonts={customFonts} onApply={onApplyCustomFont} />
    </div>
  );
}
