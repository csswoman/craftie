import { normalizeHex } from '@lib/color/normalizeHex';
import type { UiStatusCandidate, UiStatusColor, UiStatusColorOrigin } from '@lib/color/uiStatusColors';

const ORIGIN_LABELS: Record<UiStatusColorOrigin, { short: string; detail: string }> = {
  found: {
    short: 'Imagen',
    detail: 'Tomado de un color de tu imagen',
  },
  'found-adjusted': {
    short: 'Ajustado',
    detail: 'Partió de tu imagen y se afinó L o chroma',
  },
  synthetic: {
    short: 'Generado',
    detail: 'Creado por Craftie para cubrir el hue del estado',
  },
};

export function UiStatusColorCard({
  status,
  sourceName,
  candidates,
  nameByHex,
  onSelect,
}: {
  status: UiStatusColor;
  sourceName?: string;
  candidates: UiStatusCandidate[];
  nameByHex: Map<string, string>;
  onSelect: (status: UiStatusColor) => void;
}) {
  const anchorPosition = huePosition(status.anchorHue);
  const resultPosition = huePosition(status.resultHue);
  const excessiveDrift = status.hueDrift > 30;
  const origin = ORIGIN_LABELS[status.origin];

  return (
    <article className="rounded-lg border border-border bg-bg p-3">
      <div className="flex items-center gap-2">
        <span className="size-7 shrink-0 rounded-md ring-1 ring-inset ring-ink/10" style={{ backgroundColor: status.hex }} aria-hidden="true" />
        <span className="min-w-0 flex-1">
          <span className="block text-[0.78125rem] font-semibold capitalize text-ink">{status.role}</span>
          <span className="block font-mono text-[0.65625rem] tabular-nums text-muted">
            {status.hex.toUpperCase()} · hue {Math.round(status.resultHue)}°
          </span>
        </span>
        <span
          title={status.origin === 'found' && sourceName ? `${origin.detail} (${sourceName})` : origin.detail}
          className={`rounded-full px-2 py-0.5 text-tools-meta-scale font-semibold ${status.origin !== 'synthetic' ? 'text-[var(--chrome-green)]' : 'text-muted'}`}
        >
          {origin.short}
        </span>
      </div>

      <div className="mt-3">
        <p className="mb-1.5 text-[0.625rem] font-medium text-muted">Cambiar dentro del rango ±25°</p>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label={`Candidatos para ${status.role}`}>
          {candidates.map((candidate) => {
            const selected = normalizeHex(candidate.hex) === normalizeHex(status.hex)
              && candidate.origin === status.origin;
            const candidateName = candidate.sourceHex
              ? nameByHex.get(normalizeHex(candidate.sourceHex)) ?? candidate.label
              : candidate.label;
            const candidateOrigin = ORIGIN_LABELS[candidate.origin];
            return (
              <button
                key={candidate.id}
                type="button"
                aria-pressed={selected}
                aria-label={`Usar ${candidateName}, ${candidate.hex}, hue ${Math.round(candidate.resultHue)} grados`}
                title={`${candidateName} · ${candidateOrigin.short} · Δhue ${Math.round(candidate.hueDrift)}°`}
                onClick={() => onSelect(candidate)}
                className={`size-11 rounded-md ring-offset-2 ring-offset-bg transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 motion-reduce:transition-none ${selected ? 'ring-2 ring-ink' : 'ring-1 ring-inset ring-ink/15'}`}
                style={{ backgroundColor: candidate.hex }}
              />
            );
          })}
        </div>
      </div>

      <div className="mt-3">
        <div
          className="relative h-2 rounded-full ring-1 ring-inset ring-ink/10"
          style={{ background: 'linear-gradient(90deg, var(--status-hue-error), var(--status-hue-warning), var(--status-hue-success))' }}
          aria-label={`Ancla ${status.anchorHue} grados; resultado ${Math.round(status.resultHue)} grados`}
        >
          <span className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-bg bg-ink" style={{ left: `${anchorPosition}%` }} title={`Ancla ${status.anchorHue}°`} />
          <span className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-ink bg-bg" style={{ left: `${resultPosition}%` }} title={`Resultado ${Math.round(status.resultHue)}°`} />
        </div>
        <div className="mt-1 flex justify-between text-[0.5625rem] text-muted">
          <span>ancla {status.anchorHue}°</span>
          <span>resultado {Math.round(status.resultHue)}°</span>
        </div>
      </div>

      {excessiveDrift ? (
        <p className="mt-2 text-[0.65625rem] leading-relaxed text-fail">
          Este color se acerca a otro estado y puede confundirse semánticamente.
        </p>
      ) : null}

      <div
        className="mt-3 flex items-center justify-between gap-2 rounded-md px-2.5 py-2"
        style={{ backgroundColor: status.hex, color: status.onHex }}
      >
        <span className="text-[0.6875rem] font-semibold">{demoLabel(status.role)}</span>
        <span className="text-[0.625rem] opacity-85">{status.contrastWithOnColor.toFixed(1)}:1</span>
      </div>
    </article>
  );
}

function huePosition(hue: number): number {
  return Math.min(100, Math.max(0, hue / 160 * 100));
}

function demoLabel(role: UiStatusColor['role']): string {
  if (role === 'success') return 'Cambios guardados';
  if (role === 'warning') return 'Revisa este valor';
  return 'Eliminar definitivamente';
}
