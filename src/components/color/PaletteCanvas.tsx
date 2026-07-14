'use client';

import { useMemo, useState } from 'react';

import { buildRolePaletteColumnsWithContrast, hasRolePaletteContrastFailure } from '@lib/color/rolePaletteContrast';
import { normalizeHex } from '@lib/color/normalizeHex';
import { isPaletteRoleId, type PaletteRoleId } from '@lib/color/rolePalette';
import type { FontPair } from '@lib/typography/pairings';
import type { TypeScaleBase, TypeScaleRatio } from '@lib/typography/typeScale';

import { ColorDetailsDrawer } from '@/components/color-engine/ColorDetailsDrawer';
import { useTabListKeyboard } from '@/lib/browser/useTabListKeyboard';
import { useRolePalette } from '@/context/RolePaletteContext';

import { PaletteView } from './PaletteView';
import { PaletteThemeToggle } from './PaletteThemeToggle';
import { PreviewView } from './PreviewView';
import {
  openRoleColorPopover,
  RoleColorPopover,
  type RoleColorPopoverAnchor,
} from './RoleColorPopover';
import { EmptyCanvas, PaletteCanvasSkeleton } from './PaletteCanvasEmptyStates';
import { PaletteCanvasNotices } from './PaletteCanvasNotices';

export type PaletteCanvasProps = {
  isLoading?: boolean;
  isUpdating?: boolean;
  editable?: boolean;
  onAddColorByHex?: (hex: string, customName?: string) => string | null;
  recommendedPairings?: FontPair[];
  selectedPairing?: FontPair | null;
  hoveredPairing?: FontPair | null;
  isTypePreviewing?: boolean;
  typeScaleBase?: TypeScaleBase;
  typeScaleRatio?: TypeScaleRatio;
};

type CanvasTab = 'palette' | 'preview';

const CANVAS_TABS: Array<{ id: CanvasTab; label: string; shortLabel: string }> = [
  { id: 'palette', label: 'Colores', shortLabel: 'Colores' },
  { id: 'preview', label: 'Vista previa', shortLabel: 'Vista' },
];
const CANVAS_TAB_IDS = CANVAS_TABS.map((tab) => tab.id);

export function PaletteCanvas({
  isLoading = false,
  isUpdating = false,
  editable = false,
  onAddColorByHex,
  recommendedPairings = [],
  selectedPairing = null,
  hoveredPairing = null,
  isTypePreviewing = false,
  typeScaleBase = 16,
  typeScaleRatio = 1.25,
}: PaletteCanvasProps) {
  const {
    rolePalette,
    previewRolePalette,
    activeTheme,
    lockedRoles,
    replaceRole,
    setActiveRole,
    setActiveTheme,
  } = useRolePalette();

  const [activeTab, setActiveTab] = useState<CanvasTab>('palette');
  const [selectedColorHex, setSelectedColorHex] = useState<string | null>(null);
  const [colorPopover, setColorPopover] = useState<RoleColorPopoverAnchor | null>(null);
  const liveRolePalette = previewRolePalette ?? rolePalette;
  const { getTabProps } = useTabListKeyboard({
    items: CANVAS_TAB_IDS,
    activeId: activeTab,
    onActivate: setActiveTab,
  });

  const columns = useMemo(
    () => (liveRolePalette ? buildRolePaletteColumnsWithContrast(liveRolePalette) : []),
    [liveRolePalette],
  );

  const contrastFailure = liveRolePalette ? hasRolePaletteContrastFailure(liveRolePalette) : false;
  const lockedSet = useMemo(() => new Set(lockedRoles), [lockedRoles]);
  const canReplace = editable && rolePalette !== null;
  const hasPalette = columns.length > 0 && liveRolePalette !== null;

  function handleReplaceFromDrawer(newHex: string): string | null {
    if (!selectedColorHex || !rolePalette) {
      return 'No se puede sustituir este color.';
    }

    let normalized: string;

    try {
      normalized = normalizeHex(newHex);
    } catch {
      return 'Introduce un código HEX válido.';
    }

    if (normalizeHex(selectedColorHex) === normalized) {
      return null;
    }

    const role = columns.find((column) => {
      try {
        return normalizeHex(column.hex) === normalizeHex(selectedColorHex);
      } catch {
        return false;
      }
    })?.id;

    if (!role || !isPaletteRoleId(role)) {
      return 'No se puede sustituir este color.';
    }

    if (lockedSet.has(role)) {
      return 'Desbloquea el color para sustituirlo.';
    }

    replaceRole(role, normalized);
    setSelectedColorHex(normalized);
    return null;
  }

  function handleEditRole(role: PaletteRoleId, element: HTMLElement) {
    openRoleColorPopover(role, element, setActiveRole, setColorPopover);
  }

  function handleCloseColorPopover() {
    setColorPopover(null);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {hasPalette ? (
        <div
          role="tablist"
          aria-label="Vista del lienzo"
          className="flex h-11 shrink-0 items-center justify-between gap-2 border-b border-border px-3 sm:h-13 sm:gap-4 sm:px-6"
        >
          <div className="flex h-full min-w-0 items-end gap-1 sm:gap-2">
            {CANVAS_TABS.map((tab) => {
              const selected = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  id={`canvas-tab-${tab.id}`}
                  aria-selected={selected}
                  aria-controls={`canvas-panel-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  {...getTabProps(tab.id)}
                  className={`border-b px-2 pb-2 pt-1.5 text-[0.875rem] transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 sm:px-3 sm:pb-3 sm:pt-2 sm:text-chrome-body ${
                    selected
                      ? 'border-primary font-semibold text-ink'
                      : 'border-transparent font-medium text-muted hover:text-ink'
                  }`}
                >
                  <span className="sm:hidden">{tab.shortLabel}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
          <PaletteThemeToggle activeTheme={activeTheme} onChange={setActiveTheme} />
        </div>
      ) : null}

      <div className="relative flex min-h-0 flex-1 flex-col">
        {hasPalette ? (
          <PaletteCanvasNotices contrastFailure={contrastFailure} />
        ) : null}
        {isLoading && !hasPalette ? (
          <PaletteCanvasSkeleton />
        ) : !hasPalette ? (
          <EmptyCanvas />
        ) : (
          <>
              <div
                id={`canvas-panel-${activeTab}`}
                role="tabpanel"
                aria-labelledby={`canvas-tab-${activeTab}`}
                tabIndex={0}
                className={`relative flex min-h-0 flex-1 flex-col transition-opacity duration-150 motion-reduce:transition-none ${
                  isUpdating ? 'opacity-60' : 'opacity-100'
                }`}
            >
              {activeTab === 'palette' ? (
                <PaletteView
                  editable={editable}
                  onOpenDetails={setSelectedColorHex}
                  onEditRole={handleEditRole}
                />
              ) : (
                <PreviewView
                  recommendedPairings={recommendedPairings}
                  selectedPairing={selectedPairing}
                  hoveredPairing={hoveredPairing}
                  isTypePreviewing={isTypePreviewing}
                  typeScaleBase={typeScaleBase}
                  typeScaleRatio={typeScaleRatio}
                  onEditRole={handleEditRole}
                />
              )}
            </div>
            {isUpdating ? (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-bg/20"
              />
            ) : null}
          </>
        )}
      </div>

      <ColorDetailsDrawer
        colorHex={selectedColorHex}
        open={selectedColorHex !== null}
        onClose={() => setSelectedColorHex(null)}
        onAddColor={!canReplace ? onAddColorByHex : undefined}
        onReplaceColor={canReplace ? handleReplaceFromDrawer : undefined}
      />

      <RoleColorPopover anchor={colorPopover} onClose={handleCloseColorPopover} />
    </div>
  );
}
