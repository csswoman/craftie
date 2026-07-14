'use client';

import { useMemo, useState } from 'react';

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
}: {
  tokens: SemanticTokens;
  colors: SelectableColor[];
  onReplace: (token: SemanticTokenName, hex: string) => void;
}) {
  const [selectedGap, setSelectedGap] = useState<SemanticTokenName | null>(null);
  const [acceptedIncomplete, setAcceptedIncomplete] = useState(false);
  const [autoMessage, setAutoMessage] = useState<string | null>(null);
  const gaps = DATA_TOKEN_NAMES.filter((name) => Boolean(tokens[name].gap));
  const activeGap = selectedGap && tokens[selectedGap].gap ? selectedGap : gaps[0] ?? null;
  const candidates = useMemo(
    () => activeGap ? buildDataCandidates(tokens, colors, activeGap) : [],
    [activeGap, colors, tokens],
  );
  const completeCount = DATA_TOKEN_NAMES.length - gaps.length;

  function selectGap(tokenName: SemanticTokenName) {
    setSelectedGap(tokenName);
    setAcceptedIncomplete(false);
    setAutoMessage(null);
  }

  function selectCandidate(candidate: UiColorCandidate) {
    if (!activeGap) return;
    onReplace(activeGap, candidate.hex);
    setSelectedGap(null);
    setAutoMessage(null);
  }

  function fillAutomatically() {
    const replacements = autoFillDataGaps(tokens, colors);
    replacements.forEach(({ token, hex }) => onReplace(token, hex));
    setSelectedGap(null);
    setAcceptedIncomplete(false);
    const weak = replacements.find(({ candidate }) => candidate.verdict.kind === 'weak');
    setAutoMessage(replacements.length === 0
      ? 'Todos los candidatos disponibles colisionan. Abre un hueco para revisar por qué.'
      : weak
        ? `Relleno con la mejor opción disponible: ${weak.candidate.name}, ${weak.candidate.verdict.label.toLocaleLowerCase('es')} (${weak.candidate.verdict.metric}).`
        : `Se rellenaron ${replacements.length} huecos con candidatos válidos.`);
  }

  function acceptIncomplete() {
    setAcceptedIncomplete(true);
    setSelectedGap(null);
    setAutoMessage(null);
  }

  return (
    <section aria-labelledby="ui-data-title">
      <UiColorSectionHeader title={`Datos · ${completeCount} de ${DATA_TOKEN_NAMES.length}`} />
      <h2 id="ui-data-title" className="sr-only">Colores de datos</h2>
      <div className="mt-2 flex gap-1.5" aria-label={`${gaps.length} categorías de datos pendientes`}>
        {DATA_TOKEN_NAMES.map((name, index) => {
          const missing = Boolean(tokens[name].gap);
          const selected = activeGap === name;
          return (
            <button
              key={name}
              type="button"
              disabled={!missing}
              aria-pressed={selected}
              aria-label={missing ? `Elegir candidato para serie ${index + 1}` : `Serie ${index + 1}, ${tokens[name].hex}`}
              onClick={() => selectGap(name)}
              className={`relative h-[38px] min-w-0 flex-1 rounded-md text-left ring-offset-2 ring-offset-bg focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 ${missing ? 'cursor-pointer border border-dashed border-muted/60' : 'cursor-default ring-1 ring-inset ring-ink/10'} ${selected ? 'ring-2 ring-[var(--chrome-green)]' : ''}`}
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

      {gaps.length > 0 ? (
        <div className="mt-3 space-y-3">
          <p className="text-tools-meta leading-relaxed text-ink">
            <span aria-hidden="true">⚠ </span>{sourceHueCause(colors)}
          </p>

          {activeGap ? (
            <div className="space-y-2">
              <p className="text-tools-meta font-semibold text-ink">Candidatos para serie {DATA_TOKEN_NAMES.indexOf(activeGap as typeof DATA_TOKEN_NAMES[number]) + 1}</p>
              <ColorCandidateList candidates={candidates} onSelect={selectCandidate} highlightBest />
            </div>
          ) : null}

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

          {acceptedIncomplete ? (
            <p role="status" className="text-tools-meta font-medium text-[var(--chrome-green)]">
              Serie incompleta aceptada. Puedes continuar con {completeCount} categorías.
            </p>
          ) : null}
        </div>
      ) : null}
      {autoMessage ? <p role="status" className="mt-3 text-tools-meta text-muted">{autoMessage}</p> : null}
    </section>
  );
}
