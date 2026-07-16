'use client';

import { useState } from 'react';

import type { DataSeries } from '@lib/color/dataSeriesProfile';
import { groupCandidatesForUse, type UiColorCandidate } from '@lib/color/uiColorCandidates';

import { DataSeriesRow } from './DataSeriesRow';

const DEFAULT_LIMIT = 5;

export function DataSeriesList({
  candidates,
  targetSeries,
  unassigned,
  onSelect,
  onLeaveUnassigned,
  onDerive,
}: {
  candidates: UiColorCandidate[];
  targetSeries: number;
  unassigned: boolean;
  onSelect: (candidate: UiColorCandidate) => void;
  onLeaveUnassigned: () => void;
  onDerive: () => void;
}) {
  const [showAll, setShowAll] = useState(false);
  const representatives = groupCandidatesForUse(candidates, 'data').map((family) => family.representative);
  const visible = showAll ? representatives : representatives.slice(0, DEFAULT_LIMIT);

  if (representatives.length === 0 && !unassigned) {
    return <p className="py-2 text-tools-meta text-muted">No hay candidatos adicionales.</p>;
  }

  const emptySeries = unassigned ? buildEmptySeries(targetSeries) : null;

  return (
    <>
      <div className="flex flex-col gap-px overflow-hidden rounded-xl border border-border bg-border">
        {emptySeries ? (
          <DataSeriesRow
            series={emptySeries}
            targetSeries={targetSeries}
            onLeaveUnassigned={onLeaveUnassigned}
            onDerive={onDerive}
          />
        ) : null}
        {visible.map((candidate) => (
          <DataSeriesRow
            key={candidate.id}
            series={toDataSeries(candidate)}
            targetSeries={targetSeries}
            onUse={() => onSelect(candidate)}
          />
        ))}
      </div>

      {representatives.length > DEFAULT_LIMIT ? (
        <button
          type="button"
          onClick={() => setShowAll((value) => !value)}
          className="mt-2 min-h-10 w-full rounded-lg px-3 text-[0.88rem] font-semibold text-muted hover:bg-surface-raised hover:text-ink focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
        >
          {showAll ? 'Ver menos' : `Ver ${representatives.length - DEFAULT_LIMIT} candidatos más`}
        </button>
      ) : null}
    </>
  );
}

function toDataSeries(candidate: UiColorCandidate): DataSeries {
  return {
    id: candidate.id,
    name: candidate.name,
    hex: candidate.hex,
    assigned: true,
    ...candidate.dataProfile,
  };
}

function buildEmptySeries(targetSeries: number): DataSeries {
  return {
    id: String(targetSeries),
    name: 'Sin asignar',
    hex: 'transparent',
    assigned: false,
    origin: 'sintético',
    hue: 0,
    deltaL: 0,
    axes: { text: 'bad', fill: 'bad', accent: 'bad', surface: 'bad', data: 'bad' },
    ratios: { text: '—', fill: '—', accent: '—', surface: '—', data: '—' },
    verdict: 'weak',
    verdictLabel: 'Elegir',
    separation: { deltaHue: 0, deltaL: 0, note: '' },
  };
}
