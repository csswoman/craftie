'use client';

import { useMemo, useState } from 'react';

import type { SelectableColor } from '@lib/color/selectableColors';
import type { SemanticTokenName } from '@lib/color/semanticTokens';
import { assessUiColorLoad, chromaLoadPercent } from '@lib/color/uiColorComposition';
import { buildDataCandidates } from '@lib/color/uiColorCandidates';
import { buildTintedNeutralRamp } from '@lib/color/uiColorPanel';

import { useRolePalette } from '@/context/RolePaletteContext';

import { TintedNeutralsSection } from './TintedNeutralsSection';
import { UiDataSection } from './UiDataSection';
import { UiSourceColorsSection } from './UiSourceColorsSection';
import { UiStatusColorsSection } from './UiStatusColorsSection';
import { UiSystemSection } from './UiSystemSection';

export function UiColorPanel({ colors }: { colors: SelectableColor[] }) {
  const {
    semanticTokens,
    statusColors,
    replaceSemanticToken,
    generateStatusColors,
    assignSourceToStatus,
    setActiveRole,
  } = useRolePalette();
  const [openToken, setOpenToken] = useState<SemanticTokenName | null>(null);
  const ramp = useMemo(() => buildTintedNeutralRamp(colors), [colors]);
  const colorLoad = useMemo(
    () => semanticTokens ? assessUiColorLoad(semanticTokens) : null,
    [semanticTokens],
  );

  if (!semanticTokens || colors.length === 0 || colorLoad === null) return null;
  const resolvedTokens = semanticTokens;
  const loadPercent = chromaLoadPercent(colorLoad);

  function toggleToken(token: SemanticTokenName) {
    setOpenToken((current) => current === token ? null : token);
    setActiveRole(null);
  }

  function selectForToken(token: SemanticTokenName, hex: string) {
    replaceSemanticToken(token, hex);
  }

  return (
    <div className="space-y-5 pb-2">
      <UiSystemSection
        tokens={resolvedTokens}
        colors={colors}
        neutralSteps={ramp.steps}
        openToken={openToken}
        loadPercent={loadPercent}
        onToggle={toggleToken}
        onSelect={selectForToken}
      />
      <UiDataSection tokens={resolvedTokens} colors={colors} onReplace={replaceSemanticToken} />
      <UiStatusColorsSection colors={colors} statusColors={statusColors} onGenerate={generateStatusColors} />
      <UiSourceColorsSection
        tokens={resolvedTokens}
        colors={colors}
        onAssignRole={replaceSemanticToken}
        onAssignData={assignSourceToData}
        onAssignStatus={assignSourceToStatus}
      />
      <TintedNeutralsSection
        hue={ramp.hue}
        steps={ramp.steps}
        openToken={openToken}
        onSelect={(hex) => {
          if (openToken) selectForToken(openToken, hex);
        }}
      />
    </div>
  );

  function assignSourceToData(hex: string): string {
    const gap = (['data-1', 'data-2', 'data-3', 'data-4', 'data-5', 'data-6'] as const)
      .find((name) => Boolean(resolvedTokens[name].gap));
    if (!gap) return 'La serie ya tiene seis categorías.';
    const candidate = buildDataCandidates(resolvedTokens, colors, gap)
      .find((entry) => entry.hex.toUpperCase() === hex.toUpperCase());
    if (!candidate) return 'Este color ya está usado en la serie.';
    if (candidate.verdict.disabled) return `No se añadió: ${candidate.verdict.metric}.`;
    replaceSemanticToken(gap, candidate.hex);
    return `Añadido a ${gap.replace('data-', 'serie ')} · ${candidate.verdict.label}.`;
  }
}
