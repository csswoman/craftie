'use client';

import {
  PAIRING_CATEGORY_FILTERS,
  type PairingCategoryValue,
} from '@lib/typography/pairingFilters';
import { useT, useTx } from '@/context/I18nContext';

export type PairingFilterChipsProps = {
  value: PairingCategoryValue;
  onChange: (value: PairingCategoryValue) => void;
  isTools?: boolean;
};

export function PairingFilterChips({
  value,
  onChange,
  isTools = false,
}: PairingFilterChipsProps) {
  const tx = useTx();
  const t = useT();
  const chipClass = isTools ? 'text-tools-chip' : 'text-chrome-caption';

  return (
    <div
      className="flex flex-wrap gap-1"
      role="group"
      aria-label={t('ui.PairingFilterChips.filtrar-pares-por-caracter')}
    >
      {PAIRING_CATEGORY_FILTERS.map((filter) => {
        const active = value === filter.value;

        return (
          <button
            key={filter.value}
            type="button"
            onClick={() => onChange(filter.value)}
            aria-pressed={active}
            className={`min-h-8 shrink-0 rounded-full px-2 py-1 ${chipClass} font-medium transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 ${
              active
                ? 'bg-ink text-bg'
                : 'bg-surface-raised text-muted hover:bg-border/60 hover:text-ink'
            }`}
          >
            {tx(filter.label)}
          </button>
        );
      })}
    </div>
  );
}
