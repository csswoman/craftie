'use client';

import type { RefObject } from 'react';

import type { SelectableColor } from '@lib/color/selectableColors';
import type { SemanticTokenName, SemanticTokens } from '@lib/color/semanticTokens';
import type { UiStatusColor, UiStatusColorSet, UiStatusRole } from '@lib/color/uiStatusColors';

import { UiFocusedPanelHeader } from './UiFocusedPanelHeader';
import { UiFocusedRoleEditor } from './UiFocusedRoleEditor';
import { UiFocusedStatusEditor } from './UiFocusedStatusEditor';
import { UiSourceColorsSection } from './UiSourceColorsSection';
import {
  COMPACT_ROLE_GROUPS,
  type CompactRoleGroupId,
} from './uiColorPanelGroups';

export type FocusedView =
  | { kind: 'roles'; group: CompactRoleGroupId; token: SemanticTokenName | null }
  | { kind: 'status'; role: UiStatusRole | null }
  | { kind: 'sources' };

export function UiColorPanelFocused({
  focus,
  panelRef,
  sourcesScrollRef,
  colors,
  resolvedTokens,
  statusColors,
  paletteRevision,
  onBack,
  onActivateRole,
  onSelectRole,
  onSelectStatus,
  onAssignRole,
  onAssignData,
  onAssignStatus,
}: {
  focus: FocusedView;
  panelRef: RefObject<HTMLDivElement | null>;
  sourcesScrollRef: RefObject<HTMLDivElement | null>;
  colors: SelectableColor[];
  resolvedTokens: SemanticTokens;
  statusColors: UiStatusColorSet | null;
  paletteRevision: number;
  onBack: () => void;
  onActivateRole: (token: SemanticTokenName | null) => void;
  onSelectRole: (token: SemanticTokenName, hex: string) => void;
  onSelectStatus: (status: UiStatusColor) => void;
  onAssignRole: (token: SemanticTokenName, hex: string) => void;
  onAssignData: (hex: string) => string;
  onAssignStatus: (role: UiStatusRole, hex: string) => void;
}) {
  if (focus.kind === 'roles') {
    const group = COMPACT_ROLE_GROUPS[focus.group];
    return (
      <div ref={panelRef} className="pb-2">
        <UiFocusedPanelHeader
          title={group.title}
          subtitle={group.subtitle}
          onBack={onBack}
        />
        <UiFocusedRoleEditor
          key={`${paletteRevision}-${focus.group}`}
          roles={group.roles}
          activeToken={focus.token}
          tokens={resolvedTokens}
          colors={colors}
          onActivate={onActivateRole}
          onSelect={onSelectRole}
        />
      </div>
    );
  }

  if (focus.kind === 'status') {
    return (
      <div ref={panelRef} className="pb-2">
        <UiFocusedPanelHeader
          title="Colores de estado"
          subtitle="Ancla el hue, ajusta la textura · piso de chroma garantizado"
          onBack={onBack}
        />
        {statusColors ? (
          <UiFocusedStatusEditor
            key={paletteRevision}
            colors={colors}
            statusColors={statusColors}
            backgroundHex={resolvedTokens.background.hex}
            initialRole={focus.role}
            onSelect={onSelectStatus}
          />
        ) : (
          <p className="py-6 text-sm text-muted" role="status">Preparando los estados…</p>
        )}
      </div>
    );
  }

  return (
    <div ref={panelRef} className="flex h-full min-h-0 flex-col pb-2">
      <div className="shrink-0">
        <UiFocusedPanelHeader
          title="Colores fuente"
          subtitle="Elige una fuente y asígnala a un rol, estado o acento"
          onBack={onBack}
        />
      </div>
      <div
        ref={sourcesScrollRef}
        className="scrollbar-chrome min-h-0 flex-1 overflow-x-hidden overflow-y-auto pt-4"
      >
        <UiSourceColorsSection
          tokens={resolvedTokens}
          colors={colors}
          statusColors={statusColors}
          showHeader={false}
          onAssignRole={onAssignRole}
          onAssignData={onAssignData}
          onAssignStatus={onAssignStatus}
        />
      </div>
    </div>
  );
}
