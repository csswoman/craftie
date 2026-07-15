'use client';

import { useMemo, useState } from 'react';

import type { SelectableColor } from '@lib/color/selectableColors';
import type { SemanticTokenName } from '@lib/color/semanticTokens';
import { assessUiColorLoad, chromaLoadPercent } from '@lib/color/uiColorComposition';
import { buildDataCandidates } from '@lib/color/uiColorCandidates';
import { buildTintedNeutralRamp } from '@lib/color/uiColorPanel';

import { useRolePalette } from '@/context/RolePaletteContext';
import { useTabListKeyboard } from '@/lib/browser/useTabListKeyboard';

import { UiDataSection } from './UiDataSection';
import { UiSourceColorsSection } from './UiSourceColorsSection';
import { UiStatusColorsSection } from './UiStatusColorsSection';
import { UiSystemSection } from './UiSystemSection';

const UI_COLOR_VIEWS = ['system', 'data'] as const;
type UiColorView = (typeof UI_COLOR_VIEWS)[number];

export function UiColorPanel({
  colors,
  mobile = false,
}: {
  colors: SelectableColor[];
  mobile?: boolean;
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
  const [openRole, setOpenRole] = useState<{ revision: number; token: SemanticTokenName | null }>({
    revision: paletteRevision,
    token: null,
  });
  const [activeView, setActiveView] = useState<UiColorView>('system');
  const { getTabProps } = useTabListKeyboard({
    items: UI_COLOR_VIEWS,
    activeId: activeView,
    onActivate: setActiveView,
  });
  const ramp = useMemo(() => buildTintedNeutralRamp(colors), [colors]);
  const colorLoad = useMemo(
    () => semanticTokens ? assessUiColorLoad(semanticTokens) : null,
    [semanticTokens],
  );

  if (!semanticTokens || colors.length === 0 || colorLoad === null) return null;
  const resolvedTokens = semanticTokens;
  const loadPercent = chromaLoadPercent(colorLoad);
  const openToken = openRole.revision === paletteRevision ? openRole.token : null;

  function toggleToken(token: SemanticTokenName) {
    setOpenRole((current) => ({
      revision: paletteRevision,
      token: current.revision === paletteRevision && current.token === token ? null : token,
    }));
    setActiveRole(null);
  }

  function selectForToken(token: SemanticTokenName, hex: string) {
    replaceSemanticToken(token, hex);
    setOpenRole({ revision: paletteRevision, token: null });
  }

  return (
    <div className="space-y-4 pb-2">
      <div className="grid grid-cols-2 gap-1 rounded-lg bg-surface-raised p-1" role="tablist" aria-label="Vistas de color">
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
              onClick={() => setActiveView(view)}
              {...getTabProps(view)}
              className={`min-h-11 rounded-md px-3 text-tools-meta font-semibold transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 ${selected ? 'bg-bg text-ink ring-1 ring-border' : 'text-muted hover:text-ink'}`}
            >
              {view === 'system' ? 'Sistema' : 'Datos'}
            </button>
          );
        })}
      </div>

      {activeView === 'system' ? (
        <div
          id="ui-color-panel-system"
          role="tabpanel"
          aria-labelledby="ui-color-tab-system"
          className="space-y-5"
        >
          <UiSystemSection
            tokens={resolvedTokens}
            colors={colors}
            neutralSteps={ramp.steps}
            openToken={openToken}
            loadPercent={loadPercent}
            mobile={mobile}
            onToggle={toggleToken}
            onSelect={selectForToken}
          />
          <UiStatusColorsSection
            colors={colors}
            statusColors={statusColors}
            backgroundHex={resolvedTokens.background.hex}
            onGenerate={generateStatusColors}
            onSelect={selectStatusColor}
          />
          <UiSourceColorsSection
            tokens={resolvedTokens}
            colors={colors}
            onAssignRole={replaceSemanticToken}
            onAssignData={assignSourceToData}
            onAssignStatus={assignSourceToStatus}
          />
        </div>
      ) : (
        <div
          id="ui-color-panel-data"
          role="tabpanel"
          aria-labelledby="ui-color-tab-data"
        >
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
}
