'use client';

import { useMemo, useState } from 'react';
import { TriangleAlert } from 'lucide-react';

import {
  assignDataSeriesColor,
  clearDataSeriesSlot,
  countDataSeriesColors,
  createDataSeriesState,
  firstEmptySlot,
  selectDataSeriesSlot,
} from '@lib/color/dataSeriesState';
import type { SelectableColor } from '@lib/color/selectableColors';
import type { SemanticTokenName, SemanticTokens } from '@lib/color/semanticTokens';
import {
  buildDataCandidates,
  deriveFromPrimary,
  type UiColorCandidate,
} from '@lib/color/uiColorCandidates';
import { DATA_TOKEN_NAMES, sourceHueCause } from '@lib/color/uiColorPanel';

import { DataSeriesList } from './DataSeriesList';
import { UiColorSectionHeader } from './UiColorSectionHeader';

export function UiDataSection({
  tokens,
  colors,
  onReplace,
  onClear,
}: {
  tokens: SemanticTokens;
  colors: SelectableColor[];
  onReplace: (token: SemanticTokenName, hex: string) => void;
  onClear: (token: SemanticTokenName) => void;
}) {
  const slots = DATA_TOKEN_NAMES.map((name) => tokens[name].gap ? null : tokens[name].hex);
  const [activeSlot, setActiveSlot] = useState(() => {
    const firstEmpty = firstEmptySlot(slots);
    return firstEmpty === -1 ? 0 : firstEmpty;
  });
  const [autoMessage, setAutoMessage] = useState<string | null>(null);
  const seriesState = createDataSeriesState(slots, activeSlot);
  const activeToken = DATA_TOKEN_NAMES[seriesState.activeSlot];
  const gaps = DATA_TOKEN_NAMES.filter((_, index) => seriesState.slots[index] === null);
  const candidates = useMemo(
    () => buildDataCandidates(tokens, colors, activeToken),
    [activeToken, colors, tokens],
  );
  const completeCount = countDataSeriesColors(seriesState.slots);
  const activeSeriesIndex = seriesState.activeSlot + 1;

  function selectSlot(slot: number) {
    setActiveSlot(selectDataSeriesSlot(seriesState, slot).activeSlot);
    setAutoMessage(null);
  }

  function selectCandidate(candidate: UiColorCandidate) {
    const nextState = assignDataSeriesColor(seriesState, candidate.hex);
    onReplace(activeToken, candidate.hex);
    setActiveSlot(nextState.activeSlot);
    setAutoMessage(nextState.slots.includes(null)
      ? `${candidate.name} asignado a la serie ${activeSeriesIndex}. Continúa con la siguiente serie vacía.`
      : `${candidate.name} asignado a la serie ${activeSeriesIndex}. Serie completa.`);
  }

  function clearActiveSlot() {
    const nextState = clearDataSeriesSlot(seriesState, seriesState.activeSlot);
    onClear(activeToken);
    setActiveSlot(nextState.activeSlot);
    setAutoMessage(`Serie ${activeSeriesIndex} vaciada.`);
  }

  function leaveUnassigned() {
    setAutoMessage(`La serie ${activeSeriesIndex} queda sin asignar.`);
  }

  function deriveActiveFromPrimary() {
    const hex = deriveFromPrimary(tokens.primary.hex);
    const nextState = assignDataSeriesColor(seriesState, hex);
    onReplace(activeToken, hex);
    setActiveSlot(nextState.activeSlot);
    setAutoMessage(`Se derivó la serie ${activeSeriesIndex} del primario.`);
  }

  return (
    <section aria-labelledby="ui-data-title">
      <UiColorSectionHeader
        title={(
          <>
            Datos · {completeCount} de {DATA_TOKEN_NAMES.length}
            {gaps.length > 0 ? (
              <span className="ml-1 text-[#8A5F16] dark:text-[#F2C46D]">· {gaps.length} sin asignar</span>
            ) : null}
          </>
        )}
      />
      <h2 id="ui-data-title" className="sr-only">Colores de datos</h2>
      <div className="mt-2 flex gap-1.5" aria-label={`${completeCount} de ${DATA_TOKEN_NAMES.length} categorías de datos asignadas`}>
        {DATA_TOKEN_NAMES.map((name, index) => {
          const missing = seriesState.slots[index] === null;
          const selected = seriesState.activeSlot === index;
          return (
            <button
              key={name}
              type="button"
              aria-pressed={selected}
              aria-label={missing ? `Elegir candidato para serie ${index + 1}` : `Seleccionar serie ${index + 1} para reemplazar ${tokens[name].hex}`}
              onClick={() => selectSlot(index)}
              className={`relative h-11 min-w-0 flex-1 cursor-pointer rounded-md text-left ring-offset-2 ring-offset-bg focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 ${missing ? 'border border-dashed border-muted/60 bg-surface-raised [background-image:linear-gradient(135deg,transparent_40%,color-mix(in_oklch,var(--color-muted)_22%,transparent)_40%,color-mix(in_oklch,var(--color-muted)_22%,transparent)_55%,transparent_55%)] [background-size:8px_8px]' : 'ring-1 ring-inset ring-ink/10'} ${selected ? 'ring-2 ring-[var(--chrome-green)]' : ''}`}
              style={missing ? {
                backgroundColor: 'var(--color-surface-raised)',
              } : { backgroundColor: tokens[name].hex }}
            >
              <span className={`absolute left-1 top-0.5 font-mono text-[0.5625rem] font-semibold ${missing ? 'text-muted' : 'text-white mix-blend-difference'}`}>
                {index + 1}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-3 space-y-3">
        {gaps.length > 0 ? (
          <div role="status" className="flex items-start gap-2.5 rounded-lg border border-[#EAD9B8] bg-[#FBF4E9] px-3 py-2.5 text-[0.82rem] leading-relaxed text-[#654817] dark:border-[#66532D] dark:bg-[#352C1C] dark:text-[#F0D59B]">
            <TriangleAlert aria-hidden="true" className="mt-px size-[15px] shrink-0 text-[#A97620] dark:text-[#E0A640]" />
            <span>{sourceHueCause(colors)}</span>
          </div>
        ) : null}

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-tools-name font-semibold text-ink">Serie {activeSeriesIndex} de {DATA_TOKEN_NAMES.length}</h3>
            {seriesState.slots[seriesState.activeSlot] ? (
              <button
                type="button"
                onClick={clearActiveSlot}
                className="min-h-9 rounded-md border border-border bg-bg px-2.5 text-tools-meta font-semibold text-ink hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
              >
                Vaciar serie {activeSeriesIndex}
              </button>
            ) : null}
          </div>
          <DataSeriesList
            key={activeToken}
            candidates={candidates}
            targetSeries={activeSeriesIndex}
            unassigned={seriesState.slots[seriesState.activeSlot] === null}
            onSelect={selectCandidate}
            onLeaveUnassigned={leaveUnassigned}
            onDerive={deriveActiveFromPrimary}
          />
        </div>
      </div>
      {autoMessage ? <p role="status" className="mt-3 text-tools-meta text-muted">{autoMessage}</p> : null}
    </section>
  );
}
