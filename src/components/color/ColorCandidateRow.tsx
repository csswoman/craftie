import {
  colorFitnessRecommendation,
  fitnessForUse,
  type ColorUse,
} from '@lib/color/colorFitness';
import type { UiColorCandidate } from '@lib/color/uiColorCandidates';

const USES = [
  { use: 'text', label: 'Texto' },
  { use: 'fill', label: 'Fill' },
  { use: 'accent', label: 'Acento' },
  { use: 'surface', label: 'Superficie' },
  { use: 'data', label: 'Datos' },
] as const;
const USE_LABELS: Record<ColorUse, string> = {
  text: 'texto', fill: 'fill', accent: 'acento', surface: 'superficie', data: 'datos',
};

export function ColorCandidateRow({
  candidate,
  activeUse,
  actionLabel,
  onSelect,
  showData = false,
  variant = false,
  variantCount = 0,
  variantsExpanded = false,
  onToggleVariants,
}: {
  candidate: UiColorCandidate;
  activeUse: ColorUse;
  actionLabel: string;
  onSelect: (candidate: UiColorCandidate) => void;
  showData?: boolean;
  variant?: boolean;
  variantCount?: number;
  variantsExpanded?: boolean;
  onToggleVariants?: () => void;
}) {
  const visibleUses = showData ? USES : USES.slice(0, 4);
  const relevant = fitnessForUse(candidate.fitness, activeUse);
  const weakNote = relevant.ok ? null : weakFitnessNote(candidate, activeUse);

  return (
    <li className={variant ? 'bg-surface/55 pl-3' : ''}>
      <div className="px-2.5 py-2.5">
        <div className="flex items-start gap-2">
          <span className="mt-0.5 size-7 shrink-0 rounded-md ring-1 ring-inset ring-ink/10" style={{ backgroundColor: candidate.hex }} aria-hidden="true" />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[0.75rem] font-semibold text-ink">{variant ? `Variante · ${candidate.name}` : candidate.name}</span>
            <span className="block truncate text-[0.625rem] text-muted">{candidate.detail}</span>
            <span className="mt-0.5 block text-[0.625rem] font-medium text-ink">{colorFitnessRecommendation(candidate.fitness)}</span>
          </span>
          {variantCount > 0 && onToggleVariants ? (
            <button
              type="button"
              aria-expanded={variantsExpanded}
              onClick={onToggleVariants}
              className="min-h-8 shrink-0 rounded-md bg-surface-raised px-2 text-[0.625rem] font-semibold text-muted hover:text-ink focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
            >
              {variantsExpanded ? 'Ocultar' : `+${variantCount} variantes`}
            </button>
          ) : null}
        </div>

        {showData && candidate.dataSeparation ? (
          <p className="mt-2 text-[0.625rem] text-muted">Separación mínima vs series: {formatSeparation(candidate.dataSeparation)}</p>
        ) : null}

        <div role="list" className={`mt-2 grid gap-1 ${showData ? 'grid-cols-5' : 'grid-cols-4'}`} aria-label={`Perfil informativo de ${candidate.name}`}>
          {visibleUses.map(({ use, label }) => {
            const result = fitnessForUse(candidate.fitness, use);
            const ratio = result.ratio === undefined ? 'decorativo' : `${result.ratio.toFixed(1)}:1`;
            const relevantCell = use === activeUse;
            return (
              <div
                key={use}
                role="listitem"
                aria-label={`${label}: ${result.ok ? 'apto' : 'no apto'}, ${ratio}${relevantCell ? ', relevante para este rol' : ''}`}
                className={`min-w-0 rounded-md px-1 py-1.5 text-center text-[0.5625rem] leading-tight ${relevantCell ? 'bg-[var(--chrome-green-soft)] font-semibold text-[var(--chrome-green)] ring-1 ring-inset ring-[var(--chrome-green)]/25' : 'bg-surface-raised text-muted opacity-70'}`}
              >
                <span className="block" aria-hidden="true">{result.ok ? '✓' : '✕'} {label}</span>
                <span className="mt-0.5 block font-mono tabular-nums">{ratio}</span>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => onSelect(candidate)}
          className="mt-2 min-h-11 w-full rounded-md bg-[var(--chrome-green)] px-3 py-1.5 text-tools-meta font-semibold text-white transition-colors hover:brightness-95 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
        >
          <span className="block">{actionLabel}</span>
          {weakNote ? <span className="mt-0.5 block text-[0.5625rem] font-medium text-white/90">{weakNote}</span> : null}
        </button>
      </div>
    </li>
  );
}

function weakFitnessNote(candidate: UiColorCandidate, activeUse: ColorUse): string {
  const result = fitnessForUse(candidate.fitness, activeUse);
  const ratio = result.ratio === undefined ? '' : ` (${result.ratio.toFixed(1)}:1)`;
  return `Débil como ${USE_LABELS[activeUse]}${ratio} — mejor para ${USE_LABELS[candidate.fitness.bestUse]}`;
}

function formatSeparation(separation: NonNullable<UiColorCandidate['dataSeparation']>): string {
  if (separation.minHue === null || separation.minLightness === null) return 'primera serie';
  return `Δhue ${Math.round(separation.minHue)}° · ΔL ${separation.minLightness.toFixed(2)}`;
}
