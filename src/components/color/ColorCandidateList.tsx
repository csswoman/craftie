import type { UiColorCandidate } from '@lib/color/uiColorCandidates';

export function ColorCandidateList({
  candidates,
  onSelect,
  highlightBest = false,
}: {
  candidates: UiColorCandidate[];
  onSelect: (candidate: UiColorCandidate) => void;
  highlightBest?: boolean;
}) {
  if (candidates.length === 0) {
    return <p className="py-2 text-tools-meta text-muted">No hay candidatos adicionales.</p>;
  }

  return (
    <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-bg">
      {candidates.map((candidate, index) => (
        <li key={candidate.id}>
          <button
            type="button"
            disabled={candidate.verdict.disabled}
            onClick={() => onSelect(candidate)}
            className={`flex min-h-[52px] w-full items-center gap-2 px-2.5 py-2 text-left transition-colors hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-55 ${highlightBest && index === 0 ? 'bg-[var(--chrome-green-soft)]/55' : 'disabled:hover:bg-bg'}`}
          >
            <span className="size-6 shrink-0 rounded-md ring-1 ring-inset ring-ink/10" style={{ backgroundColor: candidate.hex }} aria-hidden="true" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[0.75rem] font-semibold text-ink">{candidate.name}</span>
              <span className="block truncate text-[0.625rem] text-muted">{candidate.detail}</span>
              {highlightBest && index === 0 ? <span className="mt-0.5 block text-[0.5625rem] font-semibold text-[var(--chrome-green)]">Mejor disponible</span> : null}
            </span>
            <span className="max-w-[42%] shrink-0 text-right">
              <span className={`inline-block rounded-full px-1.5 py-0.5 text-[0.625rem] font-semibold ${verdictClass(candidate.verdict.kind)}`}>
                {candidate.verdict.label}
              </span>
              <span className="mt-0.5 block text-[0.5625rem] leading-tight text-muted">{candidate.verdict.metric}</span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

function verdictClass(kind: UiColorCandidate['verdict']['kind']): string {
  if (kind === 'serve') return 'bg-[var(--chrome-green-soft)] text-[var(--chrome-green)]';
  if (kind === 'weak') return 'bg-[#F6E7B0] text-[#664700] dark:bg-[#5A481A] dark:text-[#F3D77B]';
  return 'bg-fail/10 text-fail';
}
