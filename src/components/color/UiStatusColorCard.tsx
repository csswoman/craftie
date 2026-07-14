import type { UiStatusColor } from '@lib/color/uiStatusColors';

export function UiStatusColorCard({
  status,
  sourceName,
}: {
  status: UiStatusColor;
  sourceName?: string;
}) {
  const anchorPosition = huePosition(status.anchorHue);
  const resultPosition = huePosition(status.resultHue);
  const excessiveDrift = status.hueDrift > 30;

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
        <span className={`rounded-full px-1.5 py-0.5 text-[0.625rem] font-medium ${status.origin === 'found' ? 'bg-[var(--chrome-green-soft)] text-[var(--chrome-green)]' : 'bg-surface-raised text-muted'}`}>
          {status.origin === 'found' ? `encontrado · ${sourceName ?? 'fuente'}` : 'sintético'}
        </span>
      </div>

      <div className="mt-3">
        <div
          className="relative h-2 rounded-full ring-1 ring-inset ring-ink/10"
          style={{ background: 'linear-gradient(90deg, oklch(0.58 0.16 25), oklch(0.7 0.14 70), oklch(0.58 0.13 140))' }}
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
        <span className="text-[0.625rem] opacity-85">{status.contrastOnBackground.toFixed(1)}:1</span>
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
