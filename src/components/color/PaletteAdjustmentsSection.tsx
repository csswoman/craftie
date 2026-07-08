'use client';

import type { NeutralStyle } from '@lib/color/semanticTokens';

import { VibrancyCalibrator } from '@/components/color/VibrancyCalibrator';
import { CollapsibleSection } from '@/components/layout/CollapsibleSection';
import { useRolePalette } from '@/context/RolePaletteContext';

const NEUTRAL_STYLE_OPTIONS: Array<{ value: NeutralStyle; label: string; description: string }> = [
  {
    value: 'pure',
    label: 'Puro',
    description: 'Neutros sin tinte',
  },
  {
    value: 'tinted',
    label: 'Teñido',
    description: 'Neutros con tinte de marca',
  },
];

export function PaletteAdjustmentsSection() {
  const { rolePalette, neutralStyle, setNeutralStyle } = useRolePalette();

  if (!rolePalette) {
    return null;
  }

  return (
    <CollapsibleSection title="Ajustes de paleta" defaultOpen>
      <div className="space-y-3">
        <NeutralStyleControl value={neutralStyle} onChange={setNeutralStyle} />
        <VibrancyCalibrator />
      </div>
    </CollapsibleSection>
  );
}

function NeutralStyleControl({
  value,
  onChange,
}: {
  value: NeutralStyle;
  onChange: (style: NeutralStyle) => void;
}) {
  return (
    <section
      aria-label="Estilo de neutros"
      className="rounded-lg border border-border bg-bg p-3"
    >
      <div>
        <h3 className="text-[0.8125rem] font-bold text-ink">Neutros</h3>
        <p className="text-[0.75rem] text-muted">Define si las superficies quedan puras o teñidas.</p>
      </div>

      <div
        role="radiogroup"
        aria-label="Estilo de neutros"
        className="mt-3 grid grid-cols-2 gap-1 rounded-lg border border-border bg-surface p-1"
      >
        {NEUTRAL_STYLE_OPTIONS.map((option) => {
          const selected = value === option.value;

          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(option.value)}
              className={`rounded-md px-2.5 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 ${
                selected ? 'bg-bg text-ink' : 'text-muted hover:bg-surface-raised hover:text-ink'
              }`}
            >
              <span className="block text-[0.75rem] font-bold">{option.label}</span>
              <span className="block text-[0.6875rem] font-medium">{option.description}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
