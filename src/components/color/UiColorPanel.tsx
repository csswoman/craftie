'use client';

import { useEffect, useRef, useState } from 'react';

import type { SelectableColor } from '@lib/color/selectableColors';
import type { SemanticTokenName } from '@lib/color/semanticTokens';
import { buildDataCandidates } from '@lib/color/uiColorCandidates';
import type { UiStatusRole } from '@lib/color/uiStatusColors';

import { useRolePalette } from '@/context/RolePaletteContext';
import { useAutoHideScrollbar } from '@/lib/browser/useAutoHideScrollbar';
import { useTabListKeyboard } from '@/lib/browser/useTabListKeyboard';

import { CreateBrandGuideFooter } from './CreateBrandGuideFooter';
import { UiCompactColorPanel } from './UiCompactColorPanel';
import { UiDataSection } from './UiDataSection';
import {
  UiColorPanelFocused,
  type FocusedView,
} from './UiColorPanelFocused';
import { UI_COLOR_VIEWS, UiColorViewTabs, type UiColorView } from './UiColorViewTabs';
import {
  type CompactRoleGroupId,
} from './uiColorPanelGroups';

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
    clearTokenEditPreview,
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
  const sourcesScrollRef = useAutoHideScrollbar<HTMLDivElement>();

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
    clearTokenEditPreview();
    setActiveView(view);
    setFocusedView({ revision: paletteRevision, view: null });
  }

  function openGroup(group: CompactRoleGroupId, token: SemanticTokenName) {
    clearTokenEditPreview();
    setFocusedView({ revision: paletteRevision, view: { kind: 'roles', group, token } });
    setActiveRole(null);
  }

  function openStatus(role: UiStatusRole) {
    clearTokenEditPreview();
    if (!statusColors) generateStatusColors();
    setFocusedView({ revision: paletteRevision, view: { kind: 'status', role } });
  }

  function leaveFocusedView() {
    clearTokenEditPreview();
    setFocusedView({ revision: paletteRevision, view: null });
  }

  function assignSourceToData(hex: string): string {
    const gap = (['data-1', 'data-2', 'data-3', 'data-4', 'data-5', 'data-6'] as const)
      .find((name) => Boolean(resolvedTokens[name].gap));
    if (!gap) return 'La familia ya tiene seis acentos.';
    const candidate = buildDataCandidates(resolvedTokens, colors, gap)
      .find((entry) => entry.hex.toUpperCase() === hex.toUpperCase());
    if (!candidate) return 'Este color ya está usado en los acentos.';
    replaceSemanticToken(gap, candidate.hex);
    const label = gap.replace('data-', 'Acento ');
    return candidate.fitness.asData.ok
      ? `Añadido a ${label} · ${candidate.fitness.asData.ratio.toFixed(1)}:1.`
      : `Añadido a ${label} de forma explícita · débil como dato (${candidate.fitness.asData.ratio.toFixed(1)}:1).`;
  }

  if (focus) {
    return (
      <UiColorPanelFocused
        focus={focus}
        panelRef={panelRef}
        sourcesScrollRef={sourcesScrollRef}
        colors={colors}
        resolvedTokens={resolvedTokens}
        statusColors={statusColors}
        paletteRevision={paletteRevision}
        onBack={leaveFocusedView}
        onActivateRole={(token) => {
          if (focus.kind !== 'roles') return;
          setFocusedView({
            revision: paletteRevision,
            view: { kind: 'roles', group: focus.group, token },
          });
        }}
        onSelectRole={replaceSemanticToken}
        onSelectStatus={selectStatusColor}
        onAssignRole={replaceSemanticToken}
        onAssignData={assignSourceToData}
        onAssignStatus={assignSourceToStatus}
      />
    );
  }

  return (
    <div ref={panelRef} className="flex h-full min-h-0 flex-col pb-2">
      {mobile ? (
        <header className="mb-3 shrink-0 border-b border-line-soft pb-4">
          <h1 className="font-display text-[1.375rem] font-medium leading-none text-forest">Craftie</h1>
          <p className="mt-1 text-xs text-muted">Colores y tipografía</p>
        </header>
      ) : null}
      <div className="shrink-0">
        <UiColorViewTabs activeView={activeView} getTabProps={getTabProps} onChange={changeView} />
      </div>

      {activeView === 'system' ? (
        <div
          id="ui-color-panel-system"
          role="tabpanel"
          aria-labelledby="ui-color-tab-system"
          className="flex min-h-0 flex-1 flex-col"
        >
          <UiCompactColorPanel
            tokens={resolvedTokens}
            colors={colors}
            statusColors={statusColors}
            showCreateGuide={showCreateGuide}
            canCreateGuide={canCreateGuide}
            creatingGuide={creatingGuide}
            fillHeight={!mobile}
            onOpenGroup={openGroup}
            onOpenStatus={openStatus}
            onOpenSources={() => setFocusedView({ revision: paletteRevision, view: { kind: 'sources' } })}
            onCreateGuide={onCreateGuide}
          />
        </div>
      ) : (
        <div
          id="ui-color-panel-data"
          role="tabpanel"
          aria-labelledby="ui-color-tab-data"
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="min-h-0 flex-1 overflow-y-auto pt-4">
            <UiDataSection
              tokens={resolvedTokens}
              colors={colors}
              onReplace={replaceSemanticToken}
              onClear={clearSemanticToken}
            />
          </div>
          {showCreateGuide ? (
            <CreateBrandGuideFooter
              tokens={resolvedTokens}
              canCreateGuide={canCreateGuide}
              creatingGuide={creatingGuide}
              pinned={!mobile}
              onCreateGuide={onCreateGuide}
            />
          ) : null}
        </div>
      )}
    </div>
  );
}
