'use client';

import { useState } from 'react';

import type { ColorUse } from '@lib/color/colorFitness';
import {
  groupCandidatesForUse,
  type CandidateOrigin,
  type UiColorCandidate,
} from '@lib/color/uiColorCandidates';

import { ColorCandidateRow } from './ColorCandidateRow';

const ORIGIN_SECTIONS: Array<{ origin: CandidateOrigin; label: string }> = [
  { origin: 'source', label: 'De tu imagen' },
  { origin: 'derived', label: 'Derivados' },
  { origin: 'synthetic', label: 'Sintéticos' },
];
const DEFAULT_FAMILY_LIMIT = 5;

export function ColorCandidateList({ candidates, activeUse, actionLabel, onSelect, showData = false }: {
  candidates: UiColorCandidate[];
  activeUse: ColorUse;
  actionLabel: string;
  onSelect: (candidate: UiColorCandidate) => void;
  showData?: boolean;
}) {
  const [showAll, setShowAll] = useState(false);
  const [expandedFamilies, setExpandedFamilies] = useState<Set<string>>(() => new Set());

  if (candidates.length === 0) {
    return <p className="py-2 text-tools-meta text-muted">No hay candidatos adicionales.</p>;
  }

  const families = groupCandidatesForUse(candidates, activeUse);
  const visibleFamilies = showAll ? families : families.slice(0, DEFAULT_FAMILY_LIMIT);

  function toggleFamily(id: string) {
    setExpandedFamilies((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-bg">
      {ORIGIN_SECTIONS.map((section) => {
        const sectionFamilies = visibleFamilies.filter((family) => family.representative.origin === section.origin);
        if (sectionFamilies.length === 0) return null;
        return (
          <section key={section.origin} aria-label={section.label}>
            <h4 className="border-b border-border bg-surface px-2.5 py-1.5 text-[0.625rem] font-semibold text-muted">
              {section.label}
            </h4>
            <ul className="divide-y divide-border">
              {sectionFamilies.flatMap((family) => {
                const expanded = expandedFamilies.has(family.id);
                const rows = [
                  <ColorCandidateRow
                    key={family.representative.id}
                    candidate={family.representative}
                    activeUse={activeUse}
                    actionLabel={actionLabel}
                    onSelect={onSelect}
                    showData={showData}
                    variantCount={family.variants.length}
                    variantsExpanded={expanded}
                    onToggleVariants={() => toggleFamily(family.id)}
                  />,
                ];
                if (expanded) {
                  rows.push(...family.variants.map((variant) => (
                    <ColorCandidateRow
                      key={variant.id}
                      candidate={variant}
                      activeUse={activeUse}
                      actionLabel={actionLabel}
                      onSelect={onSelect}
                      showData={showData}
                      variant
                    />
                  )));
                }
                return rows;
              })}
            </ul>
          </section>
        );
      })}
      {families.length > DEFAULT_FAMILY_LIMIT ? (
        <button
          type="button"
          onClick={() => setShowAll((value) => !value)}
          className="min-h-10 w-full border-t border-border bg-bg px-3 text-tools-meta font-semibold text-ink hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-primary/25"
        >
          {showAll ? 'Ver menos' : `Ver ${families.length - DEFAULT_FAMILY_LIMIT} familias más`}
        </button>
      ) : null}
    </div>
  );
}
