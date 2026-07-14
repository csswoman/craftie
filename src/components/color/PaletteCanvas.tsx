'use client';

import { useMemo, useState } from 'react';

import { buildRolePaletteColumnsWithContrast, hasRolePaletteContrastFailure } from '@lib/color/rolePaletteContrast';
import { normalizeHex } from '@lib/color/normalizeHex';
import { isPaletteRoleId, type PaletteRoleId } from '@lib/color/rolePalette';
import type { FontPair } from '@lib/typography/pairings';

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

export type PaletteCanvasProps = {
  isLoading?: boolean;
  isUpdating?: boolean;
  editable?: boolean;
  onAddColorByHex?: (hex: string, customName?: string) => string | null;
  recommendedPairings?: FontPair[];
  selectedPairing?: FontPair | null;
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
        {contrastFailure && hasPalette ? (
          <p
            role="alert"
            className="absolute left-4 top-4 z-30 max-w-sm rounded-lg border border-fail/30 bg-bg/95 px-3 py-2 text-[0.75rem] font-semibold text-fail"
          >
            Hay pares de contraste que no alcanzan AA. Ábrelos en Contraste dentro del Inspector.
          </p>
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

function EmptyCanvas() {
  return (
    <div className="flex h-full min-h-0 items-center justify-center bg-surface-raised/40 px-6 py-8">
      <p className="prose-measure max-w-xs text-center text-chrome-label leading-relaxed text-muted">
        Elige un rol en el lienzo para editarlo en el Inspector.
      </p>
    </div>
  );
}

function PaletteCanvasSkeleton() {
  return (
    <div className="flex min-h-0 flex-1 flex-col" aria-busy="true" aria-label="Generando paleta">
      <p className="sr-only">Generando paleta a partir de los roles asignados…</p>
      <div className="flex-1 animate-pulse bg-surface-raised" />
    </div>
  );
}
