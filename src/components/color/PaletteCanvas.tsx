'use client';

import { useMemo, useState } from 'react';

import { buildRolePaletteColumnsWithContrast, hasRolePaletteContrastFailure } from '@lib/color/rolePaletteContrast';
import { normalizeHex } from '@lib/color/normalizeHex';
import { isPaletteRoleId, type PaletteRoleId } from '@lib/color/rolePalette';

import { ColorDetailsDrawer } from '@/components/color-engine/ColorDetailsDrawer';
import { useRolePalette } from '@/context/RolePaletteContext';

import { PaletteView } from './PaletteView';
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
};

type CanvasTab = 'palette' | 'preview';

const CANVAS_TABS: Array<{ id: CanvasTab; label: string }> = [
  { id: 'palette', label: 'Paleta' },
  { id: 'preview', label: 'Vista previa' },
];

export function PaletteCanvas({
  isLoading = false,
  isUpdating = false,
  editable = false,
  onAddColorByHex,
}: PaletteCanvasProps) {
  const { rolePalette, activeRole, lockedRoles, replaceRole, setActiveRole } = useRolePalette();

  const [activeTab, setActiveTab] = useState<CanvasTab>('palette');
  const [selectedColorHex, setSelectedColorHex] = useState<string | null>(null);
  const [colorPopover, setColorPopover] = useState<RoleColorPopoverAnchor | null>(null);

  const columns = useMemo(
    () => (rolePalette ? buildRolePaletteColumnsWithContrast(rolePalette) : []),
    [rolePalette],
  );

  const contrastFailure = rolePalette ? hasRolePaletteContrastFailure(rolePalette) : false;
  const lockedSet = useMemo(() => new Set(lockedRoles), [lockedRoles]);
  const canReplace = editable && rolePalette !== null;
  const hasPalette = columns.length > 0 && rolePalette !== null;

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
      <div className="flex shrink-0 flex-col gap-2 border-b border-border px-4 py-2.5">
        <p className="text-[0.8125rem] font-medium text-muted">
          {isUpdating
            ? 'Regenerando colores…'
            : isLoading
              ? 'Extrayendo colores…'
              : !hasPalette
                ? 'Sube una imagen para armar tu paleta por roles'
                : activeRole
                  ? `Rol activo: ${activeRole} · toca un color fuente para asignarlo`
                  : 'Haz clic en una banda para elegir el rol activo'}
        </p>
        {contrastFailure ? (
          <p
            role="alert"
            className="rounded-md border border-fail/30 bg-fail/10 px-2.5 py-1.5 text-[0.75rem] font-medium text-fail"
          >
            Hay pares de contraste que no alcanzan AA. Revisa texto sobre fondos y acentos.
          </p>
        ) : null}
      </div>

      {hasPalette ? (
        <div
          role="tablist"
          aria-label="Vista del lienzo"
          className="flex shrink-0 gap-1 border-b border-border px-4 py-2"
        >
          {CANVAS_TABS.map((tab) => {
            const selected = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-md px-3 py-1.5 text-[0.8125rem] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 ${
                  selected
                    ? 'bg-primary text-white'
                    : 'text-muted hover:bg-surface-raised hover:text-ink'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      ) : null}

      <div className="relative flex min-h-0 flex-1 flex-col">
        {isLoading && !hasPalette ? (
          <PaletteCanvasSkeleton />
        ) : !hasPalette ? (
          <EmptyCanvas />
        ) : (
          <>
            <div
              role="tabpanel"
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
                <PreviewView onEditRole={handleEditRole} />
              )}
            </div>
            {isUpdating ? (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-bg/10 backdrop-blur-[1px]"
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
      <p className="max-w-xs text-center text-[0.8125rem] leading-relaxed text-muted">
        Sube una imagen y la paleta se armará automáticamente por roles. Haz clic en una banda del
        centro para elegir el rol activo.
      </p>
    </div>
  );
}

function PaletteCanvasSkeleton() {
  return (
    <div className="flex min-h-0 flex-1 flex-col" aria-busy="true" aria-label="Cargando paleta">
      <div className="flex-1 animate-pulse bg-surface-raised" />
    </div>
  );
}
