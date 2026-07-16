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
  getPreviewFamily,
  type PreviewFamilyId,
} from '@lib/color/previewFamilies';
import type { SemanticTokenName } from '@lib/color/semanticTokens';
import { statusColorCssVariables } from '@lib/color/uiStatusColors';
import { resolveActiveFontPair } from '@lib/typography/activePairing';
import { buildFontFamilyStack } from '@lib/typography/googleFonts';
import type { FontPair } from '@lib/typography/pairings';
import {
  buildTypeScaleReadout,
  type TypeScaleBase,
  type TypeScaleRatio,
} from '@lib/typography/typeScale';

import { useRolePalette } from '@/context/RolePaletteContext';
import { AnalyticsLayoutPreview } from '@/components/color/preview/AnalyticsLayoutPreview';
import { DashboardLayoutPreview } from '@/components/color/preview/DashboardLayoutPreview';
import { IllustrationPreview } from '@/components/color/preview/IllustrationPreview';
import { LandingLayoutPreview } from '@/components/color/preview/LandingLayoutPreview';
import { MediaLayoutPreview } from '@/components/color/preview/MediaLayoutPreview';
import { PreviewContrastWarnings } from '@/components/color/preview/PreviewChrome';
import type { PreviewFonts } from '@/components/color/preview/previewTypography';
import {
  SemanticTokenColorPopover,
  type SemanticTokenPopoverAnchor,
} from '@/components/color/SemanticTokenColorPopover';
import { loadGoogleFonts } from '@/lib/browser/googleFonts';

export type PreviewViewProps = {
  recommendedPairings: FontPair[];
  selectedPairing: FontPair | null;
  hoveredPairing?: FontPair | null;
  isTypePreviewing?: boolean;
  typeScaleBase?: TypeScaleBase;
  typeScaleRatio?: TypeScaleRatio;
  onEditRole?: (role: PaletteRoleId, element: HTMLElement) => void;
  activeMode: UiLayoutModeId;
  activeFamily: PreviewFamilyId;
};

export function PreviewView({
  recommendedPairings,
  selectedPairing,
  hoveredPairing = null,
  isTypePreviewing = false,
  typeScaleBase = 16,
  typeScaleRatio = 1.25,
  activeMode,
  activeFamily,
  onEditRole,
}: PreviewViewProps) {
  const {
    rolePalette,
    semanticTokens,
    previewRolePalette,
    previewSemanticTokens,
    statusColors,
    illustrationSeed,
    regenerateIllustrationSeed,
  } = useRolePalette();
  const [tokenPopover, setTokenPopover] = useState<SemanticTokenPopoverAnchor | null>(null);

  const liveRolePalette = previewRolePalette ?? rolePalette;
  const liveSemanticTokens = previewSemanticTokens ?? semanticTokens;
  const activePairing = resolveActiveFontPair(selectedPairing, recommendedPairings);
  const previewPairing = hoveredPairing ?? activePairing;
  const sizes = useMemo(
    () => buildTypeScaleReadout(typeScaleBase, typeScaleRatio),
    [typeScaleBase, typeScaleRatio],
  );

  useEffect(() => {
    loadGoogleFonts([previewPairing]);
  }, [previewPairing]);

  const fonts = useMemo<PreviewFonts>(
    () => ({
      headingFamily: buildFontFamilyStack(previewPairing.heading),
      bodyFamily: buildFontFamilyStack(previewPairing.body),
      headingWeight: previewPairing.heading.defaultWeight ?? 700,
      bodyWeight: previewPairing.body.defaultWeight ?? 400,
    }),
    [previewPairing],
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

  const typeTokenStyle = {
    ['--font-heading' as string]: fonts.headingFamily,
    ['--font-body' as string]: fonts.bodyFamily,
    ['--weight-heading' as string]: String(fonts.headingWeight ?? 700),
    ['--weight-body' as string]: String(fonts.bodyWeight ?? 400),
    ['--weight-ui' as string]: '600',
    ['--size-h1' as string]: `${sizes.h1}px`,
    ['--size-h2' as string]: `${sizes.h2}px`,
    ['--size-h3' as string]: `${sizes.h3}px`,
    ['--size-body' as string]: `${sizes.body}px`,
    ['--size-small' as string]: `${sizes.small}px`,
  };
  const statusTokenStyle = statusColors ? statusColorCssVariables(statusColors) : {};

  return (
    <div
      className="canvas-dots relative min-h-0 flex-1 overflow-y-auto motion-reduce:transition-none"
      style={{ ...typeTokenStyle, ...statusTokenStyle }}
    >
      <div
        className="pointer-events-none sticky top-3 z-20 flex justify-center px-4"
        aria-hidden={!isTypePreviewing}
      >
        <p
          className={`rounded-full border border-border bg-bg/95 px-3 py-1 text-chrome-caption font-medium text-ink shadow-none backdrop-blur-sm transition-opacity ${
            isTypePreviewing ? 'opacity-100' : 'opacity-0'
          }`}
        >
          ● Vista previa — clic para aplicar
        </p>
      </div>
      <div className={`mx-auto flex w-full ${previewWidthClass} flex-col gap-4 p-5 pb-8 sm:gap-5 sm:p-8`}>
        {tokens.warnings.length > 0 ? <PreviewContrastWarnings warnings={tokens.warnings} /> : null}
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
