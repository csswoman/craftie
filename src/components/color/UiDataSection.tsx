'use client';

import { useId, useMemo, useState } from 'react';
import { Info, TriangleAlert, X } from 'lucide-react';

import {
  accentFamilyHelpText,
  accentFamilyLabel,
  varyAccentSlotHex,
} from '@lib/color/accentFamily';
import {
  assignDataSeriesColor,
  clearDataSeriesSlot,
  countDataSeriesColors,
  createDataSeriesState,
  firstEmptySlot,
  selectDataSeriesSlot,
} from '@lib/color/dataSeriesState';
import { pickReadableTextColor } from '@lib/color/readableText';
import type { SelectableColor } from '@lib/color/selectableColors';
import type { SemanticTokenName, SemanticTokens } from '@lib/color/semanticTokens';
import {
  buildDataCandidates,
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
  const deuteranopiaHelpId = useId();
  const slots = DATA_TOKEN_NAMES.map((name) => tokens[name].gap ? null : tokens[name].hex);
  const [activeSlot, setActiveSlot] = useState(() => {
    const firstEmpty = firstEmptySlot(slots);
    return firstEmpty === -1 ? 0 : firstEmpty;
  });
  const [warningDismissed, setWarningDismissed] = useState(false);
  const seriesState = createDataSeriesState(slots, activeSlot);
  const activeToken = DATA_TOKEN_NAMES[seriesState.activeSlot];
  const gaps = DATA_TOKEN_NAMES.filter((_, index) => seriesState.slots[index] === null);
  const candidates = useMemo(
    () => buildDataCandidates(tokens, colors, activeToken),
    [activeToken, colors, tokens],
  );
  const completeCount = countDataSeriesColors(seriesState.slots);
  const activeAccentIndex = seriesState.activeSlot;
  const activeAccentLabel = accentFamilyLabel(activeAccentIndex);

  function selectSlot(slot: number) {
    setActiveSlot(selectDataSeriesSlot(seriesState, slot).activeSlot);
  }

  function selectCandidate(candidate: UiColorCandidate) {
    const nextState = assignDataSeriesColor(seriesState, candidate.hex);
    onReplace(activeToken, candidate.hex);
    setActiveSlot(nextState.activeSlot);
  }

  function clearActiveSlot() {
    const nextState = clearDataSeriesSlot(seriesState, seriesState.activeSlot);
    onClear(activeToken);
    setActiveSlot(nextState.activeSlot);
  }

  function deriveActiveFromPrimary() {
    const hex = varyAccentSlotHex(tokens, activeAccentIndex);
    const nextState = assignDataSeriesColor(seriesState, hex);
    onReplace(activeToken, hex);
    setActiveSlot(nextState.activeSlot);
  }

  return (
    <section aria-labelledby="ui-accents-title">
      <UiColorSectionHeader
        title={(
          <>
            Acentos · {completeCount} de {DATA_TOKEN_NAMES.length}
            {gaps.length > 0 ? (
              <span className="ml-1 text-[#8A5F16] dark:text-[#F2C46D]">· {gaps.length} sin asignar</span>
            ) : null}
          </>
        )}
      />
      <h2 id="ui-accents-title" className="sr-only">Familia de acentos</h2>
      <p className="mt-1 text-[0.88rem] text-muted">{accentFamilyHelpText()}</p>
      <div className="mt-3 flex flex-wrap gap-2" aria-label={`${completeCount} de ${DATA_TOKEN_NAMES.length} acentos asignados`}>
        {DATA_TOKEN_NAMES.map((name, index) => {
          const missing = seriesState.slots[index] === null;
          const selected = seriesState.activeSlot === index;
          const label = accentFamilyLabel(index);
          return (
            <button
              key={name}
              type="button"
              aria-pressed={selected}
              aria-label={missing ? `Elegir candidato para ${label}` : `Seleccionar ${label} para reemplazar ${tokens[name].hex}`}
              onClick={() => selectSlot(index)}
              className={`relative h-16 min-w-[4.25rem] flex-1 basis-[4.25rem] cursor-pointer rounded-xl text-left ring-offset-2 ring-offset-bg focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 sm:basis-[4.5rem] ${missing ? 'border border-dashed border-muted/60 bg-surface-raised [background-image:linear-gradient(135deg,transparent_40%,color-mix(in_oklch,var(--color-muted)_22%,transparent)_40%,color-mix(in_oklch,var(--color-muted)_22%,transparent)_55%,transparent_55%)] [background-size:10px_10px]' : 'ring-1 ring-inset ring-ink/10'} ${selected ? 'ring-2 ring-[var(--chrome-green)]' : ''}`}
              style={missing ? {
                backgroundColor: 'var(--color-surface-raised)',
              } : { backgroundColor: tokens[name].hex }}
            >
              <span
                className={`absolute left-2 top-1.5 rounded-full px-1.5 py-0.5 font-mono text-[0.8rem] font-semibold leading-none ${missing ? 'bg-bg/80 text-muted' : ''}`}
                style={missing ? undefined : { color: pickReadableTextColor(tokens[name].hex) }}
              >
                {index + 1}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-3 space-y-3">
        {gaps.length > 0 && !warningDismissed ? (
          <div role="status" className="rounded-xl border border-[#EAD9B8] bg-[#FBF4E9] px-3.5 py-3 text-[0.95rem] leading-relaxed text-[#654817] dark:border-[#66532D] dark:bg-[#352C1C] dark:text-[#F0D59B]">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-2.5">
              <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[#A97620] dark:text-[#E0A640]" />
              <div className="min-w-0">
                <p>{sourceHueCause(colors)}</p>
                <div className="mt-2 flex items-center gap-2 text-[0.86rem] text-[#7A5A1E] dark:text-[#E6C982]">
                  <span>Compatibilidad visual</span>
                  <span className="group/info relative inline-flex">
                    <button
                      type="button"
                      aria-label="Explicación de deuteranopía"
                      aria-describedby={deuteranopiaHelpId}
                      className="inline-flex size-5 items-center justify-center rounded-full border border-current/25 bg-white/50 text-current transition-colors hover:bg-white/80 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 dark:bg-black/10 dark:hover:bg-black/20"
                    >
                      <Info aria-hidden="true" className="size-3.5" />
                    </button>
                    <span
                      id={deuteranopiaHelpId}
                      role="tooltip"
                      className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 w-56 -translate-x-1/2 rounded-lg bg-[#2C2418] px-3 py-2 text-[0.78rem] font-medium leading-relaxed text-[#FFF3D6] opacity-0 shadow-lg transition-opacity group-hover/info:opacity-100 group-focus-within/info:opacity-100 dark:bg-[#18130B]"
                    >
                      Deuteranopía: una forma común de daltonismo en la que algunos verdes y azul-violetas pueden verse demasiado parecidos.
                    </span>
                  </span>
                </div>
              </div>
              </div>
              <button
                type="button"
                aria-label="Cerrar advertencia"
                onClick={() => setWarningDismissed(true)}
                className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-[#7A5A1E] transition-colors hover:bg-[#EFDDBB] hover:text-[#5E4312] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 dark:text-[#E6C982] dark:hover:bg-[#4B3B22] dark:hover:text-[#FFF3D6]"
              >
                <X aria-hidden="true" className="size-4" />
              </button>
            </div>
          </div>
        ) : null}

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-[1.05rem] font-semibold text-ink">{activeAccentLabel} de {DATA_TOKEN_NAMES.length}</h3>
            {seriesState.slots[seriesState.activeSlot] ? (
              <button
                type="button"
                onClick={clearActiveSlot}
                className="min-h-10 rounded-lg border border-border bg-bg px-3 text-[0.88rem] font-semibold text-ink hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
              >
                Vaciar {activeAccentLabel}
              </button>
            ) : null}
          </div>
          <DataSeriesList
            key={activeToken}
            candidates={candidates}
            targetSeries={activeAccentIndex + 1}
            unassigned={seriesState.slots[seriesState.activeSlot] === null}
            onSelect={selectCandidate}
            onLeaveUnassigned={() => undefined}
            onDerive={deriveActiveFromPrimary}
          />
        </div>
      </div>
    </section>
  );
}
