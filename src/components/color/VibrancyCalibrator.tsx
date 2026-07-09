'use client';

import { VIBRANCY_MAX, VIBRANCY_MID, VIBRANCY_MIN } from '@lib/color/vibrancy';

import { useRolePalette } from '@/context/RolePaletteContext';
import { Button } from '@/components/ui/Button';

const TICKS = [
  { value: VIBRANCY_MIN, label: 'Pastel' },
  { value: VIBRANCY_MID, label: 'Equilibrado' },
  { value: VIBRANCY_MAX, label: 'Brillante' },
] as const;

export function VibrancyCalibrator() {
  const {
    previewVibrancy,
    savedVibrancy,
    hasUnsavedVibrancy,
    setPreviewVibrancy,
    saveVibrancy,
  } = useRolePalette();

  return (
    <section
      aria-label="Calibrador de vibrancia"
      className="rounded-lg border border-border bg-bg p-3"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-tools-section font-semibold text-ink">Vibrancia</h3>
          <p className="text-tools-meta text-muted">
            Vista previa {previewVibrancy} · Guardado {savedVibrancy}
          </p>
        </div>
        <Button
          variant={hasUnsavedVibrancy ? 'primary' : 'ghost'}
          disabled={!hasUnsavedVibrancy}
          onClick={saveVibrancy}
          className="min-h-11 px-3 py-2 text-tools-body"
        >
          Guardar
        </Button>
      </div>

      <div className="mt-3">
        <input
          type="range"
          min={VIBRANCY_MIN}
          max={VIBRANCY_MAX}
          step={1}
          value={previewVibrancy}
          onChange={(event) => setPreviewVibrancy(Number(event.currentTarget.value))}
          aria-label="Vibrancia expresiva"
          aria-valuetext={`${previewVibrancy} de 100`}
          className="h-2 w-full cursor-pointer accent-primary"
        />
        <div className="mt-1 grid grid-cols-3 text-tools-meta font-semibold text-muted">
          {TICKS.map((tick, index) => (
            <span
              key={tick.value}
              className={index === 1 ? 'text-center' : index === 2 ? 'text-right' : ''}
            >
              {tick.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
