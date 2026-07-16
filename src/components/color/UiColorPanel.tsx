'use client';

import { useEffect, useRef, useState } from 'react';

import type { SelectableColor } from '@lib/color/selectableColors';
import type { SemanticTokenName } from '@lib/color/semanticTokens';
import { buildDataCandidates } from '@lib/color/uiColorCandidates';
import type { UiStatusRole } from '@lib/color/uiStatusColors';

import { useRolePalette } from '@/context/RolePaletteContext';
import { useTabListKeyboard } from '@/lib/browser/useTabListKeyboard';

import { UiCompactColorPanel } from './UiCompactColorPanel';
import { UiDataSection } from './UiDataSection';
import { UiFocusedPanelHeader } from './UiFocusedPanelHeader';
import { UiFocusedRoleEditor } from './UiFocusedRoleEditor';
import { UiFocusedStatusEditor } from './UiFocusedStatusEditor';
import { UiSourceColorsSection } from './UiSourceColorsSection';
import {
  COMPACT_ROLE_GROUPS,
  type CompactRoleGroupId,
} from './uiColorPanelGroups';

const UI_COLOR_VIEWS = ['system', 'data'] as const;
type UiColorView = (typeof UI_COLOR_VIEWS)[number];
type FocusedView =
  | { kind: 'roles'; group: CompactRoleGroupId; token: SemanticTokenName }
  | { kind: 'status'; role: UiStatusRole }
  | { kind: 'sources' };

export function UiColorPanel({
  colors,
  mobile = false,
  showCreateGuide = false,
  canCreateGuide = false,
  creatingGuide = false,
  onCreateGuide = () => undefined,
}: {
  colors: SelectableColor[];
  mobile?: boolean;
  showCreateGuide?: boolean;
  canCreateGuide?: boolean;
  creatingGuide?: boolean;
  onCreateGuide?: () => void;
}) {
  const {
    semanticTokens,
    statusColors,
    paletteRevision,
    replaceSemanticToken,
    clearSemanticToken,
    generateStatusColors,
    assignSourceToStatus,
    selectStatusColor,
    setActiveRole,
  } = useRolePalette();
  const [activeView, setActiveView] = useState<UiColorView>('system');
  const [focusedView, setFocusedView] = useState<{ revision: number; view: FocusedView | null }>({
    revision: paletteRevision,
    view: null,
  });
  const { getTabProps } = useTabListKeyboard({
    items: UI_COLOR_VIEWS,
    activeId: activeView,
    onActivate: changeView,
  });
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      panelRef.current?.scrollIntoView({ block: 'start' });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [activeView, focusedView.revision, focusedView.view?.kind]);

  if (!semanticTokens || colors.length === 0) return null;
  const resolvedTokens = semanticTokens;
  const focus = focusedView.revision === paletteRevision ? focusedView.view : null;

  function changeView(view: UiColorView) {
    setActiveView(view);
    setFocusedView({ revision: paletteRevision, view: null });
  }

  function openGroup(group: CompactRoleGroupId, token: SemanticTokenName) {
    setFocusedView({ revision: paletteRevision, view: { kind: 'roles', group, token } });
    setActiveRole(null);
  }

  function openStatus(role: UiStatusRole) {
    if (!statusColors) generateStatusColors();
    setFocusedView({ revision: paletteRevision, view: { kind: 'status', role } });
  }

  function assignSourceToData(hex: string): string {
    const gap = (['data-1', 'data-2', 'data-3', 'data-4', 'data-5', 'data-6'] as const)
      .find((name) => Boolean(resolvedTokens[name].gap));
    if (!gap) return 'La serie ya tiene seis categorías.';
    const candidate = buildDataCandidates(resolvedTokens, colors, gap)
      .find((entry) => entry.hex.toUpperCase() === hex.toUpperCase());
    if (!candidate) return 'Este color ya está usado en la serie.';
    replaceSemanticToken(gap, candidate.hex);
    return candidate.fitness.asData.ok
      ? `Añadido a ${gap.replace('data-', 'serie ')} · ${candidate.fitness.asData.ratio.toFixed(1)}:1.`
      : `Añadido a ${gap.replace('data-', 'serie ')} de forma explícita · débil como dato (${candidate.fitness.asData.ratio.toFixed(1)}:1).`;
  }

  if (focus?.kind === 'roles') {
    const group = COMPACT_ROLE_GROUPS[focus.group];
    return (
      <div ref={panelRef} className="pb-2">
        <UiFocusedPanelHeader
          title={group.title}
          subtitle={group.subtitle}
          onBack={() => setFocusedView({ revision: paletteRevision, view: null })}
        />
        <UiFocusedRoleEditor
          key={`${paletteRevision}-${focus.group}`}
          roles={group.roles}
          activeToken={focus.token}
          tokens={resolvedTokens}
          colors={colors}
          onActivate={(token) => setFocusedView({
            revision: paletteRevision,
            view: { ...focus, token },
          })}
          onSelect={replaceSemanticToken}
        />
      </div>
    );
  }

  if (focus?.kind === 'status') {
    return (
      <div ref={panelRef} className="pb-2">
        <UiFocusedPanelHeader
          title="Colores de estado"
          subtitle="Ancla el hue, ajusta la textura · piso de chroma garantizado"
          onBack={() => setFocusedView({ revision: paletteRevision, view: null })}
        />
        {statusColors ? (
          <UiFocusedStatusEditor
            key={paletteRevision}
            colors={colors}
            statusColors={statusColors}
            backgroundHex={resolvedTokens.background.hex}
            initialRole={focus.role}
            onSelect={selectStatusColor}
          />
        ) : (
          <p className="py-6 text-sm text-muted" role="status">Preparando los estados…</p>
        )}
      </div>
    );
  }

  if (focus?.kind === 'sources') {
    return (
      <div ref={panelRef} className="pb-2">
        <UiFocusedPanelHeader
          title="Colores fuente"
          subtitle="Elige una fuente y asígnala a un rol, estado o serie de datos"
          onBack={() => setFocusedView({ revision: paletteRevision, view: null })}
        />
        <div className="pt-4">
          <UiSourceColorsSection
            tokens={resolvedTokens}
            colors={colors}
            showHeader={false}
            onAssignRole={replaceSemanticToken}
            onAssignData={assignSourceToData}
            onAssignStatus={assignSourceToStatus}
          />
        </div>
      </div>
    );
  }

  return (
    <div ref={panelRef} className="pb-2">
      {mobile ? (
        <header className="mb-3 border-b border-line-soft pb-4">
          <h1 className="font-display text-[1.375rem] font-medium leading-none text-forest">Craftie</h1>
          <p className="mt-1 text-xs text-muted">Colores y tipografía</p>
        </header>
      ) : null}
      <ColorViewTabs activeView={activeView} getTabProps={getTabProps} onChange={changeView} />

      {activeView === 'system' ? (
        <div id="ui-color-panel-system" role="tabpanel" aria-labelledby="ui-color-tab-system">
          <UiCompactColorPanel
            tokens={resolvedTokens}
            colors={colors}
            statusColors={statusColors}
            showCreateGuide={showCreateGuide}
            canCreateGuide={canCreateGuide}
            creatingGuide={creatingGuide}
            onOpenGroup={openGroup}
            onOpenStatus={openStatus}
            onOpenSources={() => setFocusedView({ revision: paletteRevision, view: { kind: 'sources' } })}
            onCreateGuide={onCreateGuide}
          />
        </div>
      ) : (
        <div id="ui-color-panel-data" role="tabpanel" aria-labelledby="ui-color-tab-data" className="pt-4">
          <UiDataSection
            tokens={resolvedTokens}
            colors={colors}
            onReplace={replaceSemanticToken}
            onClear={clearSemanticToken}
          />
        </div>
      )}
    </div>
  );
}

function ColorViewTabs({
  activeView,
  getTabProps,
  onChange,
}: {
  activeView: UiColorView;
  getTabProps: (id: UiColorView) => React.ButtonHTMLAttributes<HTMLButtonElement>;
  onChange: (view: UiColorView) => void;
}) {
  return (
    <div className="flex items-center gap-5 border-b border-line-soft" role="tablist" aria-label="Vistas de color">
      {UI_COLOR_VIEWS.map((view) => {
        const selected = activeView === view;
        return (
          <button
            key={view}
            type="button"
            role="tab"
            id={`ui-color-tab-${view}`}
            aria-controls={`ui-color-panel-${view}`}
            aria-selected={selected}
            onClick={() => onChange(view)}
            {...getTabProps(view)}
            className={`relative min-h-10 px-0 pb-2.5 pt-0.5 text-tools-tab font-semibold transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-forest/25 ${selected ? 'text-ink after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:rounded-sm after:bg-forest after:content-[""]' : 'text-muted hover:text-ink'}`}
          >
            {view === 'system' ? 'Sistema' : 'Datos'}
          </button>
        );
      })}
    </div>
  );
}
