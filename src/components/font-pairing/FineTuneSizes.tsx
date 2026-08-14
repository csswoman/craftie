'use client';

import { ChevronDown, Plus, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';

export type FineTuneLevel = {
  id: string;
  label: string;
  computedSize: number;
};

export type SizeOverrides = Record<string, number | null>;

type FineTuneSizesProps = {
  levels: FineTuneLevel[];
  overrides: SizeOverrides;
  onOverridesChange: (overrides: SizeOverrides) => void;
  onAddLargerStep: () => void;
  onAddSmallerStep: () => void;
};

export function FineTuneSizes({
  levels,
  overrides,
  onOverridesChange,
  onAddLargerStep,
  onAddSmallerStep,
}: FineTuneSizesProps) {
  const [open, setOpen] = useState(true);

  function handleSizeChange(levelId: string, value: string) {
    const parsed = Number(value);
    const nextValue = value === '' || !Number.isFinite(parsed) || parsed <= 0 ? null : parsed;

    onOverridesChange({ ...overrides, [levelId]: nextValue });
  }

  return (
    <section className="rounded-xl border border-border bg-surface-raised/70" aria-labelledby="fine-tune-title">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="flex items-center gap-2 text-chrome-label font-semibold text-ink">
          <SlidersHorizontal size={15} aria-hidden="true" />
          <span id="fine-tune-title">Ajustar tamaños</span>
        </span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-muted transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {open ? (
        <div className="border-t border-border px-4 py-4">
          <p className="max-w-prose text-chrome-caption leading-relaxed text-muted">
            Values match the mathematical scale by default. Type to override specific levels.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {levels.map((level) => (
              <label key={level.id} className="flex items-center justify-between gap-3 text-chrome-label font-medium text-ink">
                <span>{level.label}</span>
                <span className="relative">
                  <input
                    type="number"
                    min="1"
                    step="1"
                    inputMode="numeric"
                    value={overrides[level.id] ?? ''}
                    placeholder={String(level.computedSize)}
                    aria-label={`${level.label} en píxeles`}
                    onChange={(event) => handleSizeChange(level.id, event.target.value)}
                    className="h-9 w-20 rounded-md border border-border bg-bg px-2 pr-6 text-right font-mono text-xs tabular-nums text-ink outline-none placeholder:text-muted focus:border-primary focus:ring-[3px] focus:ring-primary/25"
                  />
                  <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[0.625rem] text-muted">px</span>
                </span>
              </label>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={onAddLargerStep} className="inline-flex min-h-9 items-center gap-1 rounded-md border border-border bg-bg px-3 text-chrome-caption font-semibold text-ink hover:bg-surface focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25">
              <Plus size={14} aria-hidden="true" /> Add larger step
            </button>
            <button type="button" onClick={onAddSmallerStep} className="inline-flex min-h-9 items-center gap-1 rounded-md border border-border bg-bg px-3 text-chrome-caption font-semibold text-ink hover:bg-surface focus-visible:outline-none focus-visible:ring-[3px] focus:ring-primary/25">
              <Plus size={14} aria-hidden="true" /> Add smaller step
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
