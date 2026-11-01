'use client';

import { VibrancyCalibrator } from '@/components/color/VibrancyCalibrator';
import { CollapsibleSection } from '@/components/layout/CollapsibleSection';
import { useRolePalette } from '@/context/RolePaletteContext';
import { useT } from '@/context/I18nContext';

export type PaletteAdjustmentsSectionProps = {
  defaultOpen?: boolean;
  embedded?: boolean;
};

export function PaletteAdjustmentsSection({
  defaultOpen = false,
  embedded = false,
}: PaletteAdjustmentsSectionProps) {
  const t = useT();
  const { rolePalette } = useRolePalette();

  if (!rolePalette) {
    return null;
  }

  const content = (
    <div className="space-y-[var(--chrome-space-3)]">
      <p className="rounded-[var(--chrome-radius-card)] border border-border bg-bg p-[var(--chrome-space-3)] font-sans text-tools-meta leading-relaxed text-muted">{t('ui.PaletteAdjustmentsSection.las-superficies-usan-siempre-una')}</p>
      <VibrancyCalibrator />
    </div>
  );

  if (embedded) {
    return content;
  }

  return (
    <CollapsibleSection
      title={t('ui.PaletteAdjustmentsSection.ajustes-de-paleta')}
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
