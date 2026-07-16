'use client';

import { useId, useState } from 'react';
import { ChevronDown } from 'lucide-react';

import type { AxisScore, DataSeries } from '@lib/color/dataSeriesProfile';

const AXES = [
  { key: 'text', label: 'Texto' },
  { key: 'fill', label: 'Fill' },
  { key: 'accent', label: 'Acento' },
  { key: 'surface', label: 'Superficie' },
  { key: 'data', label: 'Datos' },
] as const;

const SCORE_LABELS: Record<AxisScore, string> = {
  ok: 'fuerte',
  mid: 'límite',
  bad: 'falla',
};

export function DataSeriesRow({
  series,
  targetSeries,
  onUse,
  onLeaveUnassigned,
  onDerive,
}: {
  series: DataSeries;
  targetSeries: number;
  onUse?: () => void;
  onLeaveUnassigned?: () => void;
  onDerive?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const detailId = useId();
  const empty = !series.assigned;

  function toggleDetail() {
    setOpen((value) => !value);
  }

  function handlePrimaryAction() {
    if (empty) {
      toggleDetail();
      return;
    }

    onUse?.();
  }

  return (
    <div className="bg-bg">
      <div className={`group/row flex min-h-14 w-full items-stretch transition-colors duration-150 motion-reduce:transition-none ${empty ? 'bg-[#FCF8F0] hover:bg-[#F8F0E2] dark:bg-[#342B1E] dark:hover:bg-[#3D3222]' : open ? 'bg-surface' : 'hover:bg-surface-raised'}`}>
        <button
          type="button"
          aria-label={empty
            ? `Abrir opciones para la serie ${targetSeries} sin asignar`
            : `Añadir ${series.name} a la serie ${targetSeries}`}
          aria-expanded={empty ? open : undefined}
          aria-controls={empty ? detailId : undefined}
          onClick={handlePrimaryAction}
          className="grid min-w-0 flex-1 cursor-pointer grid-cols-[28px_minmax(0,1fr)_auto_auto] items-center gap-3 px-3.5 py-2.5 pr-1 text-left focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-primary/25"
        >
          <span
            aria-hidden="true"
            className={`size-6 shrink-0 rounded-md ring-1 ring-inset ring-ink/10 ${empty ? 'border border-dashed border-[#C08A2E]/70 bg-surface-raised [background-image:linear-gradient(135deg,transparent_40%,color-mix(in_oklch,var(--color-muted)_22%,transparent)_40%,color-mix(in_oklch,var(--color-muted)_22%,transparent)_55%,transparent_55%)] [background-size:8px_8px]' : ''}`}
            style={empty ? undefined : { backgroundColor: series.hex }}
          />

          <span className="flex min-w-0 flex-col">
            <span className={`truncate text-[0.92rem] font-semibold leading-[1.2] ${empty ? 'text-[#8A5F16] dark:text-[#F2C46D]' : 'text-ink'}`}>
              {empty ? 'Sin asignar' : series.name}
            </span>
            <span className="mt-px truncate text-[0.74rem] text-muted">
              {empty
                ? `serie ${targetSeries} vacía`
                : `${series.origin} · hue ${series.hue}° · ΔL ${series.deltaL.toFixed(2)}`}
            </span>
          </span>

          <AxisDots axes={series.axes} />

          <span className={`whitespace-nowrap rounded-full px-2 py-[3px] text-[0.7rem] font-semibold ${verdictClasses(series.verdict)}`}>
            {empty ? 'Elegir' : series.verdictLabel}
          </span>
        </button>
        <button
          type="button"
          aria-label={`${open ? 'Ocultar' : 'Ver'} detalles de ${empty ? `la serie ${targetSeries} sin asignar` : series.name}`}
          aria-expanded={open}
          aria-controls={detailId}
          onClick={toggleDetail}
          className="flex w-10 shrink-0 cursor-pointer items-center justify-center text-muted hover:text-ink focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-primary/25"
        >
          <ChevronDown
            aria-hidden="true"
            className={`size-3.5 shrink-0 text-muted transition-transform duration-150 motion-reduce:transition-none ${open ? 'rotate-180 motion-reduce:rotate-0' : ''}`}
          />
        </button>
      </div>

      {open ? (
        <div id={detailId} className="border-t border-dashed border-border bg-surface px-4 pb-4 pt-3.5">
          {empty ? (
            <UnassignedDetail onLeave={onLeaveUnassigned} onDerive={onDerive} />
          ) : (
            <AssignedDetail series={series} />
          )}
        </div>
      ) : null}
    </div>
  );
}

function AxisDots({ axes }: { axes: DataSeries['axes'] }) {
  const ariaLabel = AXES.map(({ key, label }) => `${label}: ${SCORE_LABELS[axes[key]]}`).join(', ');

  return (
    <span className="flex items-center gap-[5px]" role="img" aria-label={ariaLabel}>
      {AXES.map(({ key, label }) => (
        <span
          key={key}
          title={`${label}: ${SCORE_LABELS[axes[key]]}`}
          className={`size-[9px] rounded-full ${axisClasses(axes[key])}`}
        />
      ))}
    </span>
  );
}

function AssignedDetail({ series }: { series: DataSeries }) {
  return (
    <>
      <div className="mb-3 grid grid-cols-5 gap-1.5">
        {AXES.map(({ key, label }) => (
          <AptCell key={key} label={key === 'surface' ? 'Superf.' : label} value={series.ratios[key]} score={series.axes[key]} />
        ))}
      </div>
      <p className="mb-3 text-[0.74rem] leading-relaxed text-muted">
        Separación vs series: <strong className="font-semibold text-ink">Δhue {Math.round(series.separation.deltaHue)}°</strong>
        {' · '}<strong className="font-semibold text-ink">ΔL {series.separation.deltaL.toFixed(2)}</strong>. {series.separation.note}
      </p>
    </>
  );
}

function UnassignedDetail({ onLeave, onDerive }: { onLeave?: () => void; onDerive?: () => void }) {
  return (
    <>
      <p className="mb-3 text-[0.74rem] text-muted">Sin candidato asignado. Opciones honestas:</p>
      <div className="flex gap-2">
        <button type="button" onClick={onLeave} className="min-h-10 flex-1 rounded-lg border border-[var(--chrome-green)] bg-transparent px-2 text-[0.78rem] font-semibold text-[var(--chrome-green)] hover:bg-[var(--chrome-green-soft)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25">
          Dejar sin asignar
        </button>
        <button type="button" onClick={onDerive} className="min-h-10 flex-1 rounded-lg border border-[var(--chrome-green)] bg-[var(--chrome-green)] px-2 text-[0.78rem] font-semibold text-white hover:brightness-95 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25">
          Derivar del primario
        </button>
      </div>
    </>
  );
}

function AptCell({ label, value, score }: { label: string; value: string; score: AxisScore }) {
  return (
    <div className={`min-w-0 rounded-md border px-1 py-1.5 text-center leading-tight ${aptClasses(score)}`}>
      <span className="block truncate text-[0.6rem] text-muted">{label}</span>
      <span className="mt-0.5 block text-[0.78rem] font-semibold tabular-nums">{value}</span>
    </div>
  );
}

function axisClasses(score: AxisScore): string {
  if (score === 'ok') return 'bg-pass';
  if (score === 'mid') return 'bg-[#B7791F] dark:bg-[#E0A640]';
  return 'bg-transparent ring-[1.5px] ring-inset ring-border';
}

function verdictClasses(verdict: DataSeries['verdict']): string {
  if (verdict === 'data') return 'bg-[var(--chrome-green-soft)] text-[var(--chrome-green)]';
  if (verdict === 'fill') return 'bg-[#FBF1DF] text-[#80530D] dark:bg-[#44351D] dark:text-[#F2C46D]';
  return 'bg-[#F7E6E2] text-[#94371F] dark:bg-[#48271F] dark:text-[#F4A38D]';
}

function aptClasses(score: AxisScore): string {
  if (score === 'ok') return 'border-pass/25 bg-pass/5 text-pass';
  if (score === 'bad') return 'border-fail/20 bg-fail/5 text-fail';
  return 'border-[#B7791F]/30 bg-[#B7791F]/5 text-[#80530D] dark:text-[#F2C46D]';
}
