'use client';

import { useEffect, useMemo, useState } from 'react';

import type { PaletteRoleId } from '@lib/color/rolePalette';
import { buildPreviewTokens } from '@lib/color/previewTokens';
import {
  layoutModeTokenEntries,
  resolveLayoutColors,
  type ResolvedLayoutColors,
  type UiLayoutModeId,
  type UiLayoutSlot,
} from '@lib/color/layoutModes';
import {
  DEFAULT_PREVIEW_FAMILY_ID,
  getPreviewFamily,
  type PreviewFamilyId,
} from '@lib/color/previewFamilies';
import type { SemanticTokenName } from '@lib/color/semanticTokens';
import { resolveActiveFontPair } from '@lib/typography/activePairing';
import { buildFontFamilyStack } from '@lib/typography/googleFonts';
import type { FontPair } from '@lib/typography/pairings';

import { useRolePalette } from '@/context/RolePaletteContext';
import { AnalyticsLayoutPreview } from '@/components/color/preview/AnalyticsLayoutPreview';
import { DashboardLayoutPreview } from '@/components/color/preview/DashboardLayoutPreview';
import { IllustrationPreview } from '@/components/color/preview/IllustrationPreview';
import { LandingLayoutPreview } from '@/components/color/preview/LandingLayoutPreview';
import { MediaLayoutPreview } from '@/components/color/preview/MediaLayoutPreview';
import { PreviewContrastWarnings } from '@/components/color/preview/PreviewChrome';
import { PreviewNavigator } from '@/components/color/preview/PreviewNavigator';
import type { PreviewFonts } from '@/components/color/preview/previewTypography';
import {
  SemanticTokenColorPopover,
  type SemanticTokenPopoverAnchor,
} from '@/components/color/SemanticTokenColorPopover';
import { loadGoogleFonts } from '@/lib/browser/googleFonts';

export type PreviewViewProps = {
  recommendedPairings: FontPair[];
  selectedPairing: FontPair | null;
  onEditRole?: (role: PaletteRoleId, element: HTMLElement) => void;
};

export function PreviewView({ recommendedPairings, selectedPairing, onEditRole }: PreviewViewProps) {
  const {
    rolePalette,
    semanticTokens,
    previewRolePalette,
    previewSemanticTokens,
    illustrationSeed,
    regenerateIllustrationSeed,
  } = useRolePalette();
  const [activeFamily, setActiveFamily] = useState<PreviewFamilyId>(DEFAULT_PREVIEW_FAMILY_ID);
  const [activeMode, setActiveMode] = useState<UiLayoutModeId>('dashboard');
  const [tokenPopover, setTokenPopover] = useState<SemanticTokenPopoverAnchor | null>(null);

  const liveRolePalette = previewRolePalette ?? rolePalette;
  const liveSemanticTokens = previewSemanticTokens ?? semanticTokens;
  const activePairing = resolveActiveFontPair(selectedPairing, recommendedPairings);

  useEffect(() => {
    loadGoogleFonts([activePairing]);
  }, [activePairing]);

  const fonts = useMemo<PreviewFonts>(
    () => ({
      headingFamily: buildFontFamilyStack(activePairing.heading),
      bodyFamily: buildFontFamilyStack(activePairing.body),
    }),
    [activePairing],
  );

  if (!liveRolePalette || !liveSemanticTokens) {
    return null;
  }

  const tokens = buildPreviewTokens(liveRolePalette);
  const family = getPreviewFamily(activeFamily);
  const mode = family.id === 'ui'
    ? family.modes.find((entry) => entry.id === activeMode) ?? family.modes[0]!
    : getPreviewFamily('ui').modes[0]!;
  const colors = resolveLayoutColors(mode, liveSemanticTokens);
  const slotToToken = new Map<UiLayoutSlot, SemanticTokenName>(layoutModeTokenEntries(mode));

  function handleEditSlot(slot: UiLayoutSlot, element: HTMLElement) {
    const tokenName = slotToToken.get(slot);

    if (!tokenName) {
      return;
    }

    setTokenPopover({ tokenName, rect: element.getBoundingClientRect() });
  }

  const previewWidthClass = family.id === 'illustration'
    ? 'max-w-5xl'
    : activeMode === 'dashboard' || activeMode === 'landing' || activeMode === 'analytics' || activeMode === 'media'
      ? 'max-w-6xl'
      : 'max-w-lg';

  return (
    <div
      className="min-h-0 flex-1 overflow-y-auto"
      style={{ backgroundColor: colors.appBackground }}
    >
      <div className={`mx-auto flex w-full ${previewWidthClass} flex-col gap-4 p-5 pb-8 sm:gap-5 sm:p-8`}>
        {tokens.warnings.length > 0 ? <PreviewContrastWarnings warnings={tokens.warnings} /> : null}
        <PreviewNavigator
          activeFamily={activeFamily}
          activeMode={activeMode}
          onSelectUi={(mode) => {
            setActiveFamily('ui');
            setActiveMode(mode);
          }}
          onSelectIllustration={() => setActiveFamily('illustration')}
        />
        {family.id === 'illustration' ? (
          <IllustrationPreview
            tokens={liveSemanticTokens}
            paletteInput={family.contract.rendererInput}
            seed={illustrationSeed}
            onRegenerate={regenerateIllustrationSeed}
          />
        ) : (
          <ActiveLayoutPreview
            mode={activeMode}
            colors={colors}
            fonts={fonts}
            onEditSlot={handleEditSlot}
          />
        )}
      </div>
      <SemanticTokenColorPopover anchor={tokenPopover} onClose={() => setTokenPopover(null)} />
    </div>
  );
}

function ActiveLayoutPreview({
  mode,
  colors,
  fonts,
  onEditSlot,
}: {
  mode: UiLayoutModeId;
  colors: ResolvedLayoutColors;
  fonts: PreviewFonts;
  onEditSlot: (slot: UiLayoutSlot, element: HTMLElement) => void;
}) {
  switch (mode) {
    case 'landing':
      return <LandingLayoutPreview colors={colors} fonts={fonts} onEditSlot={onEditSlot} />;
    case 'media':
      return <MediaLayoutPreview colors={colors} fonts={fonts} onEditSlot={onEditSlot} />;
    case 'analytics':
      return <AnalyticsLayoutPreview colors={colors} fonts={fonts} onEditSlot={onEditSlot} />;
    case 'dashboard':
    default:
      return <DashboardLayoutPreview colors={colors} fonts={fonts} onEditSlot={onEditSlot} />;
  }
}
