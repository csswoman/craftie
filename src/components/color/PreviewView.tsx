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
  isTypeRoleId,
  TYPE_ROLE_IDS,
  typeRoleCssVariables,
  withRoleWeights,
  type ResolvedTypeRole,
  type TypeRoleId,
} from '@lib/typography/typeRoles';
import {
  buildTypeScaleReadout,
  type TypeScaleBase,
  type TypeScaleRatio,
} from '@lib/typography/typeScale';

import { useRolePalette } from '@/context/RolePaletteContext';
import { ActiveLayoutPreview } from '@/components/color/ActiveLayoutPreview';
import { IllustrationPreview } from '@/components/color/preview/IllustrationPreview';
import { PreviewContrastWarnings } from '@/components/color/preview/PreviewChrome';
import type { PreviewFonts } from '@/components/color/preview/previewTypography';
import {
  SemanticTokenColorPopover,
  type SemanticTokenPopoverAnchor,
} from '@/components/color/SemanticTokenColorPopover';
import { loadGoogleFonts } from '@/lib/browser/googleFonts';
import { PreviewEditModeToggle, type PreviewEditMode } from '@/components/color/PreviewEditModeToggle';
import { TypeRolePopover, type TypeRolePopoverAnchor } from '@/components/color/TypeRolePopover';
import { useTypeRoles } from '@/context/TypeRolesContext';

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

export const PREVIEW_LAYOUT_WIDTH_CLASS = 'max-w-[1300px]';

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
  const [rolePopover, setRolePopover] = useState<TypeRolePopoverAnchor | null>(null);
  const [editMode, setEditMode] = useState<PreviewEditMode>('color');
  const typeRoles = useTypeRoles();

  const liveRolePalette = previewRolePalette ?? rolePalette;
  const liveSemanticTokens = previewSemanticTokens ?? semanticTokens;
  const activePairing = resolveActiveFontPair(selectedPairing, recommendedPairings);
  const previewPairing = hoveredPairing ?? activePairing;
  const sizes = useMemo(
    () => buildTypeScaleReadout(typeScaleBase, typeScaleRatio),
    [typeScaleBase, typeScaleRatio],
  );

  const loadablePairing = useMemo(
    () => withRoleWeights(previewPairing, typeRoles.weights),
    [previewPairing, typeRoles.weights],
  );

  useEffect(() => {
    loadGoogleFonts([loadablePairing]);
  }, [loadablePairing]);

  // While hovering a pairing, roles without their own weight follow its weights.
  const effectiveRoles = useMemo(() => {
    if (!hoveredPairing) {
      return typeRoles.roles;
    }
    const weights = {
      heading: hoveredPairing.heading.defaultWeight ?? 700,
      body: hoveredPairing.body.defaultWeight ?? 400,
    };

    return Object.fromEntries(
      TYPE_ROLE_IDS.map((id) => {
        const role = typeRoles.roles[id];
        return [id, role.overridden.weight ? role : { ...role, weight: weights[role.family] }];
      }),
    ) as Record<TypeRoleId, ResolvedTypeRole>;
  }, [hoveredPairing, typeRoles.roles]);

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
  const slotToToken = new Map<UiLayoutSlot, SemanticTokenName>(
    layoutModeTokenEntries(mode, liveSemanticTokens),
  );

  function handleEditSlot(slot: UiLayoutSlot, element: HTMLElement) {
    const tokenName = slotToToken.get(slot);

    if (!tokenName) {
      return;
    }

    setTokenPopover({ tokenName, rect: element.getBoundingClientRect() });
  }

  function handleTextEditClick(event: React.MouseEvent<HTMLElement>) {
    if (editMode !== 'text') {
      return;
    }
    const target = event.target as Element;
    const roleId = getComputedStyle(target).getPropertyValue('--type-role').trim();

    if (!isTypeRoleId(roleId)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    setRolePopover({ roleId, rect: target.getBoundingClientRect() });
  }

  const previewWidthClass = family.id === 'illustration'
    ? 'max-w-5xl'
    : PREVIEW_LAYOUT_WIDTH_CLASS;

  const typeTokenStyle = {
    ['--font-heading' as string]: fonts.headingFamily,
    ['--font-body' as string]: fonts.bodyFamily,
    ['--weight-heading' as string]: String(fonts.headingWeight ?? 700),
    ['--weight-body' as string]: String(fonts.bodyWeight ?? 400),
    ['--size-h1' as string]: `${sizes.h1}px`,
    ['--size-h2' as string]: `${sizes.h2}px`,
    ['--size-h3' as string]: `${sizes.h3}px`,
    ['--size-body' as string]: `${sizes.body}px`,
    ['--size-small' as string]: `${sizes.small}px`,
    ...typeRoleCssVariables(effectiveRoles),
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
          className={`rounded-full border border-border bg-bg/95 px-3 py-1 text-chrome-caption font-medium text-ink shadow-none backdrop-blur-sm transition-opacity ${isTypePreviewing ? 'opacity-100' : 'opacity-0'
            }`}
        >
          ● Vista previa — clic para aplicar
        </p>
      </div>
      {family.id !== 'illustration' ? (
        <div className="pointer-events-none sticky top-14 z-20 flex justify-end px-4 sm:px-8">
          <PreviewEditModeToggle value={editMode} onChange={setEditMode} />
        </div>
      ) : null}
      <div
        data-edit-mode={editMode}
        onClickCapture={handleTextEditClick}
        className={`mx-auto flex w-full ${previewWidthClass} flex-col gap-4 p-5 pb-8 sm:gap-5 sm:p-8`}
      >
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
      <TypeRolePopover
        anchor={rolePopover}
        defaultWeights={{ heading: fonts.headingWeight ?? 700, body: fonts.bodyWeight ?? 400 }}
        onClose={() => setRolePopover(null)}
      />
    </div>
  );
}
