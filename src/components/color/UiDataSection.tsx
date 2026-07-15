'use client';

import { useMemo, useState } from 'react';

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
  autoFillDataGaps,
  buildDataCandidates,
  type UiColorCandidate,
} from '@lib/color/uiColorCandidates';
import { DATA_TOKEN_NAMES, sourceHueCause } from '@lib/color/uiColorPanel';

import { ColorCandidateList } from './ColorCandidateList';
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
  const [acceptedIncomplete, setAcceptedIncomplete] = useState(false);
  const [autoMessage, setAutoMessage] = useState<string | null>(null);
  const seriesState = createDataSeriesState(slots, activeSlot);
  const activeToken = DATA_TOKEN_NAMES[seriesState.activeSlot];
  const gaps = DATA_TOKEN_NAMES.filter((_, index) => seriesState.slots[index] === null);
  const candidates = useMemo(
    () => buildDataCandidates(tokens, colors, activeToken),
    [activeToken, colors, tokens],
  );
  const completeCount = countDataSeriesColors(seriesState.slots);
  const hasDataCandidate = candidates.some((candidate) => candidate.fitness.asData.ok);
  const activeSeriesIndex = seriesState.activeSlot + 1;

  function selectSlot(slot: number) {
    setActiveSlot(selectDataSeriesSlot(seriesState, slot).activeSlot);
    setAcceptedIncomplete(false);
    setAutoMessage(null);
  }

  function selectCandidate(candidate: UiColorCandidate) {
    const nextState = assignDataSeriesColor(seriesState, candidate.hex);
    onReplace(activeToken, candidate.hex);
    setActiveSlot(nextState.activeSlot);
    setAcceptedIncomplete(false);
    setAutoMessage(nextState.slots.includes(null)
      ? `${candidate.name} asignado a la serie ${activeSeriesIndex}. Continúa con la siguiente serie vacía.`
      : `${candidate.name} asignado a la serie ${activeSeriesIndex}. Serie completa.`);
  }

  function clearActiveSlot() {
    const nextState = clearDataSeriesSlot(seriesState, seriesState.activeSlot);
    onClear(activeToken);
    setActiveSlot(nextState.activeSlot);
    setAcceptedIncomplete(false);
    setAutoMessage(`Serie ${activeSeriesIndex} vaciada.`);
  }

  function fillAutomatically() {
    const replacements = autoFillDataGaps(tokens, colors);
    const nextSlots = [...seriesState.slots];
    replacements.forEach(({ token, hex }) => onReplace(token, hex));
    replacements.forEach(({ token, hex }) => {
      nextSlots[DATA_TOKEN_NAMES.indexOf(token as typeof DATA_TOKEN_NAMES[number])] = hex;
    });
    const nextEmpty = firstEmptySlot(nextSlots);
    setActiveSlot(nextEmpty === -1 ? seriesState.activeSlot : nextEmpty);
    setAcceptedIncomplete(false);
    setAutoMessage(replacements.length === 0
      ? 'No hay candidatos aptos como dato. Revisa el eje Datos y elige de forma explícita si quieres forzar uno.'
      : `Se rellenaron ${replacements.length} huecos con candidatos aptos como dato.`);
  }

  function acceptIncomplete() {
    setAcceptedIncomplete(true);
    setAutoMessage(null);
  }

  return (
    <section aria-labelledby="ui-data-title">
      <UiColorSectionHeader title={`Datos · ${completeCount} de ${DATA_TOKEN_NAMES.length}`} />
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
              className={`relative h-11 min-w-0 flex-1 cursor-pointer rounded-md text-left ring-offset-2 ring-offset-bg focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 ${missing ? 'border border-dashed border-muted/60' : 'ring-1 ring-inset ring-ink/10'} ${selected ? 'ring-2 ring-[var(--chrome-green)]' : ''}`}
              style={missing ? {
                backgroundImage: 'repeating-linear-gradient(135deg, transparent 0 4px, color-mix(in oklch, var(--color-muted) 22%, transparent) 4px 6px)',
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
          <p className="text-tools-meta leading-relaxed text-ink">
            <span aria-hidden="true">⚠ </span>{sourceHueCause(colors)}
          </p>
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
          {!hasDataCandidate ? (
            <p className="text-tools-meta leading-relaxed text-muted">
              Ninguno encaja bien como dato. El eje Datos muestra la advertencia; aún puedes elegir uno de forma explícita.
            </p>
          ) : null}
          <ColorCandidateList
            candidates={candidates}
            activeUse="data"
            actionLabel={`Usar en serie ${activeSeriesIndex}`}
            onSelect={selectCandidate}
            showData
          />
        </div>

        {gaps.length > 0 ? (
          <div className="grid gap-2">
            <button
              type="button"
              onClick={fillAutomatically}
              className="min-h-10 rounded-md bg-[var(--chrome-green)] px-3 text-tools-meta font-semibold text-white hover:brightness-95 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
            >
              Rellenar {gaps.length} huecos automáticamente
            </button>
            <button
              type="button"
              onClick={acceptIncomplete}
              className="min-h-10 rounded-md border border-border bg-bg px-3 text-tools-meta font-semibold text-ink hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
            >
              Aceptar serie incompleta ({completeCount} categorías)
            </button>
          </div>
        ) : null}

        {acceptedIncomplete ? (
          <p role="status" className="text-tools-meta font-medium text-[var(--chrome-green)]">
            Serie incompleta aceptada. Puedes continuar con {completeCount} categorías.
          </p>
        ) : null}
      </div>
      {autoMessage ? <p role="status" className="mt-3 text-tools-meta text-muted">{autoMessage}</p> : null}
    </section>
  );
}
