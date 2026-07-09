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

export type PaletteAdjustmentsSectionProps = {
  defaultOpen?: boolean;
  embedded?: boolean;
};

export function PaletteAdjustmentsSection({
  defaultOpen = false,
  embedded = false,
}: PaletteAdjustmentsSectionProps) {
  const { rolePalette, neutralStyle, setNeutralStyle } = useRolePalette();

  if (!rolePalette) {
    return null;
  }

  const content = (
    <div className="space-y-[var(--chrome-space-3)]">
      <NeutralStyleControl value={neutralStyle} onChange={setNeutralStyle} />
      <VibrancyCalibrator />
    </div>
  );

  if (embedded) {
    return content;
  }

  return (
    <CollapsibleSection
      title="Ajustes de paleta"
      defaultOpen={defaultOpen}
      variant="neutral"
      icon={<AdjustmentsIcon />}
    >
      {content}
    </CollapsibleSection>
  );
}

function AdjustmentsIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4">
      <path
        d="M3 5h10M3 11h10M6 3.5v3M10 9.5v3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
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
      className="rounded-[var(--chrome-radius-card)] border border-border bg-bg p-[var(--chrome-space-3)]"
    >
      <div>
        <h3 className="text-tools-section font-semibold text-ink">Neutros</h3>
        <p className="text-tools-meta font-normal text-muted">Define si las superficies quedan puras o teñidas.</p>
      </div>

      <div
        role="radiogroup"
        aria-label="Estilo de neutros"
        className="mt-[var(--chrome-space-3)] grid grid-cols-2 gap-[var(--chrome-space-1)] rounded-[var(--chrome-radius-card)] border border-border bg-surface p-[var(--chrome-space-1)]"
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
              className={`rounded-[var(--chrome-radius-control)] px-[var(--chrome-space-2)] py-[var(--chrome-space-2)] text-left transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 ${
                selected ? 'bg-bg text-ink' : 'text-muted hover:bg-surface-raised hover:text-ink'
              }`}
            >
              <span className="block font-sans text-tools-body font-medium">{option.label}</span>
              <span className="block font-sans text-tools-meta font-normal">{option.description}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
