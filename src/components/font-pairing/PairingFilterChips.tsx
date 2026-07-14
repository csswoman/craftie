'use client';

import {
  PAIRING_CATEGORY_FILTERS,
  type PairingCategoryValue,
} from '@lib/typography/pairingFilters';

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
  const chipClass = isTools ? 'text-tools-chip' : 'text-[0.75rem]';

  return (
    <div
      className="flex flex-wrap gap-1.5"
      role="group"
      aria-label="Filtrar pares por carácter"
    >
      {PAIRING_CATEGORY_FILTERS.map((filter) => {
        const active = value === filter.value;

        return (
          <button
            key={filter.value}
            type="button"
            onClick={() => onChange(filter.value)}
            aria-pressed={active}
            className={`rounded-full px-2.5 py-1 ${chipClass} font-medium transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 ${
              active
                ? 'bg-ink text-bg'
                : 'bg-surface-raised text-muted hover:bg-border/60 hover:text-ink'
            }`}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}
