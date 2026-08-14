'use client';

import { ChevronDown, LineChart } from 'lucide-react';
import { useState } from 'react';

export type TypographySpacing = {
  headingLineHeight: number;
  headingLetterSpacing: number;
  bodyLineHeight: number;
  bodyLetterSpacing: number;
};

type SpacingControlsProps = {
  value: TypographySpacing;
  onChange: (value: TypographySpacing) => void;
};

type SliderFieldProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  suffix: string;
  onChange: (value: number) => void;
};

function SliderField({ label, value, min, max, suffix, onChange }: SliderFieldProps) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center justify-between gap-4 text-chrome-label font-medium text-ink">
        <span>{label}</span>
        <output className="font-mono text-xs tabular-nums text-muted">{value.toFixed(2)}{suffix}</output>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step="0.01"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-2 w-full cursor-pointer accent-primary"
      />
    </label>
  );
}

export function SpacingControls({ value, onChange }: SpacingControlsProps) {
  const [open, setOpen] = useState(true);

  return (
    <section className="rounded-xl border border-border bg-surface-raised/70" aria-labelledby="spacing-controls-title">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="flex items-center gap-2 text-chrome-label font-semibold text-ink">
          <LineChart size={15} aria-hidden="true" />
          <span id="spacing-controls-title">Espaciado</span>
        </span>
        <ChevronDown size={16} className={`shrink-0 text-muted transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>

      {open ? (
        <div className="space-y-5 border-t border-border px-4 py-4">
          <fieldset className="space-y-4">
            <legend className="text-chrome-caption font-semibold uppercase tracking-[0.08em] text-muted">Titulares</legend>
            <SliderField label="Heading Leading" value={value.headingLineHeight} min={1} max={1.4} suffix="" onChange={(headingLineHeight) => onChange({ ...value, headingLineHeight })} />
            <SliderField label="Heading Tracking" value={value.headingLetterSpacing} min={-0.05} max={0.02} suffix="em" onChange={(headingLetterSpacing) => onChange({ ...value, headingLetterSpacing })} />
          </fieldset>
          <fieldset className="space-y-4 border-t border-border pt-5">
            <legend className="text-chrome-caption font-semibold uppercase tracking-[0.08em] text-muted">Cuerpo</legend>
            <SliderField label="Body Leading" value={value.bodyLineHeight} min={1.2} max={1.8} suffix="" onChange={(bodyLineHeight) => onChange({ ...value, bodyLineHeight })} />
            <SliderField label="Body Tracking" value={value.bodyLetterSpacing} min={-0.02} max={0.04} suffix="em" onChange={(bodyLetterSpacing) => onChange({ ...value, bodyLetterSpacing })} />
          </fieldset>
        </div>
      ) : null}
    </section>
  );
}
