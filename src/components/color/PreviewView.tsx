'use client';

import { useState } from 'react';

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
  PREVIEW_FAMILIES,
  type PreviewFamilyId,
} from '@lib/color/previewFamilies';
import type { SemanticTokenName } from '@lib/color/semanticTokens';

import { useRolePalette } from '@/context/RolePaletteContext';
import { AnalyticsLayoutPreview } from '@/components/color/preview/AnalyticsLayoutPreview';
import { DashboardLayoutPreview } from '@/components/color/preview/DashboardLayoutPreview';
import { LandingLayoutPreview } from '@/components/color/preview/LandingLayoutPreview';
import { MediaLayoutPreview } from '@/components/color/preview/MediaLayoutPreview';
import { PreviewContrastWarnings } from '@/components/color/preview/PreviewChrome';
import {
  SemanticTokenColorPopover,
  type SemanticTokenPopoverAnchor,
} from '@/components/color/SemanticTokenColorPopover';

export type PreviewViewProps = {
  onEditRole?: (role: PaletteRoleId, element: HTMLElement) => void;
};

export function PreviewView({ onEditRole }: PreviewViewProps) {
  const { rolePalette, semanticTokens, previewRolePalette, previewSemanticTokens } =
    useRolePalette();
  const [activeFamily, setActiveFamily] = useState<PreviewFamilyId>(DEFAULT_PREVIEW_FAMILY_ID);
  const [activeMode, setActiveMode] = useState<UiLayoutModeId>('dashboard');
  const [tokenPopover, setTokenPopover] = useState<SemanticTokenPopoverAnchor | null>(null);

  const liveRolePalette = previewRolePalette ?? rolePalette;
  const liveSemanticTokens = previewSemanticTokens ?? semanticTokens;

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

  return (
    <div
      className="min-h-0 flex-1 overflow-y-auto"
      style={{ backgroundColor: colors.appBackground }}
    >
      <div className="mx-auto flex w-full max-w-lg flex-col gap-4 p-5 pb-8 sm:gap-5 sm:p-8">
        {tokens.warnings.length > 0 ? <PreviewContrastWarnings warnings={tokens.warnings} /> : null}
        <PreviewFamilySwitcher activeFamily={activeFamily} onChange={setActiveFamily} />
        {family.id === 'ui' ? (
          <LayoutModeSwitcher activeMode={activeMode} modes={family.modes} onChange={setActiveMode} />
        ) : null}
        <ActiveLayoutPreview mode={activeMode} colors={colors} onEditSlot={handleEditSlot} />
      </div>
      <SemanticTokenColorPopover anchor={tokenPopover} onClose={() => setTokenPopover(null)} />
    </div>
  );
}

function PreviewFamilySwitcher({
  activeFamily,
  onChange,
}: {
  activeFamily: PreviewFamilyId;
  onChange: (family: PreviewFamilyId) => void;
}) {
  const selectableFamilies = PREVIEW_FAMILIES.filter((family) => family.modes.length > 0);

  if (selectableFamilies.length <= 1) {
    return null;
  }

  return (
    <div
      role="tablist"
      aria-label="Familia de vista previa"
      className="flex flex-wrap gap-1 rounded-lg border p-1"
      style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}
    >
      {PREVIEW_FAMILIES.map((family) => {
        const selected = activeFamily === family.id;
        const disabled = family.modes.length === 0;

        return (
          <button
            key={family.id}
            type="button"
            role="tab"
            aria-selected={selected}
            disabled={disabled}
            onClick={() => onChange(family.id)}
            className="rounded-md px-2.5 py-1.5 text-[0.6875rem] font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
            style={{
              backgroundColor: selected ? 'var(--color-surface-raised)' : 'transparent',
              color: 'var(--color-ink)',
            }}
          >
            {family.label}
          </button>
        );
      })}
    </div>
  );
}

function LayoutModeSwitcher({
  activeMode,
  modes,
  onChange,
}: {
  activeMode: UiLayoutModeId;
  modes: Array<{ id: UiLayoutModeId; label: string }>;
  onChange: (mode: UiLayoutModeId) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Modo de vista previa"
      className="flex flex-wrap gap-1 rounded-lg border p-1"
      style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}
    >
      {modes.map((mode) => {
        const selected = activeMode === mode.id;

        return (
          <button
            key={mode.id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(mode.id)}
            className="rounded-md px-2.5 py-1.5 text-[0.6875rem] font-bold transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
            style={{
              backgroundColor: selected ? 'var(--color-surface-raised)' : 'transparent',
              color: 'var(--color-ink)',
            }}
          >
            {mode.label}
          </button>
        );
      })}
    </div>
  );
}

function ActiveLayoutPreview({
  mode,
  colors,
  onEditSlot,
}: {
  mode: UiLayoutModeId;
  colors: ResolvedLayoutColors;
  onEditSlot: (slot: UiLayoutSlot, element: HTMLElement) => void;
}) {
  switch (mode) {
    case 'landing':
      return <LandingLayoutPreview colors={colors} onEditSlot={onEditSlot} />;
    case 'media':
      return <MediaLayoutPreview colors={colors} onEditSlot={onEditSlot} />;
    case 'analytics':
      return <AnalyticsLayoutPreview colors={colors} onEditSlot={onEditSlot} />;
    case 'dashboard':
    default:
      return <DashboardLayoutPreview colors={colors} onEditSlot={onEditSlot} />;
  }
}
