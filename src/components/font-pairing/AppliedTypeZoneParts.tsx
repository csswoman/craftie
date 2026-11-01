import type { ReactNode } from 'react';
import { ChevronDown, Pin } from 'lucide-react';
import type { CustomFontRole } from '@lib/typography/customFonts';

import { GoogleFontAutocomplete } from './GoogleFontAutocomplete';
import { useT, useTx } from '@/context/I18nContext';

export function ScaleToken({ label, value }: { label: string; value: number }) {
  const tx = useTx();
  return (
    <span className="whitespace-nowrap">
      <span className="font-semibold text-primary">{tx(label)}</span>{' '}
      <span className="font-normal tabular-nums text-muted">{value}px</span>
    </span>
  );
}

export function TypeWeightBadge({
  weight,
  tone = 'muted',
}: {
  weight: number;
  tone?: 'muted' | 'ink';
}) {
  return (
    <span
      className={`inline-flex min-w-7 shrink-0 items-center justify-center rounded-md border border-border bg-surface-raised px-1.5 py-0.5 text-chrome-caption tabular-nums ${tone === 'ink' ? 'font-medium text-ink' : 'font-medium text-muted'
        }`}
    >
      {weight}
    </span>
  );
}

export function TypeWeightSelect({
  weight,
  options,
  onChange,
  ariaLabel,
}: {
  weight: number;
  options: readonly number[];
  onChange: (weight: number) => void;
  ariaLabel: string;
}) {
  const tx = useTx();
  const choices = options.includes(weight) ? options : [...options, weight].sort((a, b) => a - b);

  return (
    <label className="relative inline-flex shrink-0">
      <span className="sr-only">{tx(ariaLabel)}</span>
      <select
        value={weight}
        onChange={(event) => onChange(Number(event.target.value))}
        aria-label={tx(ariaLabel)}
        className="h-7 min-w-[3.25rem] shrink-0 cursor-pointer appearance-none rounded-md border border-border bg-surface-raised py-0.5 pl-2 pr-5 text-chrome-caption font-medium tabular-nums text-ink transition-colors hover:border-primary/45 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
      >
        {choices.map((value) => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
      </select>
      <ChevronDown
        size={12}
        strokeWidth={1.5}
        aria-hidden="true"
        className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-muted"
      />
    </label>
  );
}

export function RoleRow({
  label,
  family,
  weight,
  weightOptions,
  onWeightChange,
  stack,
  pinned,
  onTogglePin,
  role,
  onApplyFamily,
}: {
  label: string;
  family: string;
  weight: number;
  weightOptions?: readonly number[];
  onWeightChange?: (weight: number) => void;
  stack: string;
  pinned: boolean;
  onTogglePin: () => void;
  role?: CustomFontRole;
  onApplyFamily?: (family: string, role: CustomFontRole) => Promise<void>;
}) {
  const tx = useTx();
  const t = useT();
  const pinHint = t(pinned ? 'typeZone.unpin' : 'typeZone.pin', { label: tx(label) });

  return (
    <div className="flex min-w-0 items-center gap-2 py-2.5">
      <span className="w-[3.25rem] shrink-0 text-chrome-label font-medium text-muted">{tx(label)}</span>
      {role && onApplyFamily ? (
        <GoogleFontAutocomplete
          key={`${role}:${family}`}
          label={tx(label)}
          role={role}
          initialFamily={family}
          onApply={onApplyFamily}
          hideLabel
        />
      ) : (
        <span
          className="min-w-0 flex-1 truncate text-chrome-title font-medium leading-[1.25] text-ink"
          style={{ fontFamily: stack, fontWeight: weight }}
          title={tx(family)}
        >
          {tx(family)}
        </span>
      )}
      {weightOptions && onWeightChange ? (
        <TypeWeightSelect
          weight={weight}
          options={weightOptions}
          onChange={onWeightChange}
          ariaLabel={t('ui.AppliedTypeZoneParts.peso-de', { label: tx(label) })}
        />
      ) : (
        <TypeWeightBadge weight={weight} />
      )}
      <button
        type="button"
        onClick={onTogglePin}
        aria-pressed={pinned}
        aria-label={tx(pinHint)}
        title={tx(pinHint)}
        className={`inline-flex h-7 shrink-0 items-center gap-1 whitespace-nowrap rounded-md border px-1.5 transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 ${pinned
          ? 'border-primary/45 bg-primary/10 text-primary'
          : 'border-border bg-bg text-muted hover:border-primary/45 hover:text-primary'
          }`}
      >
        <Pin
          size={13}
          strokeWidth={1.25}
          fill={pinned ? 'currentColor' : 'none'}
          aria-hidden="true"
        />
        <span className="text-chrome-caption font-medium">{pinned ? t('ui.AppliedTypeZoneParts.fijado') : t('ui.AppliedTypeZoneParts.fijar')}</span>
      </button>
    </div>
  );
}

export function SegmentedField({ label, children }: { label: string; children: ReactNode }) {
  const tx = useTx();
  return (
    <div className="min-w-0">
      <p className="text-chrome-caption font-semibold uppercase tracking-[0.08em] text-primary">{tx(label)}</p>
      <div className="mt-1.5 flex min-w-0 gap-0.5 rounded-lg bg-surface-raised p-0.5">{children}</div>
    </div>
  );
}

export function SegmentButton({
  active,
  onClick,
  label,
  ariaLabel,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  ariaLabel: string;
}) {
  const tx = useTx();
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={tx(ariaLabel)}
      className={`min-h-7 min-w-0 flex-1 rounded-md px-0.5 text-chrome-caption tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 ${active
        ? 'bg-primary font-semibold text-bg'
        : 'bg-transparent font-normal text-muted hover:bg-primary/10 hover:text-primary'
        }`}
    >
      {tx(label)}
    </button>
  );
}
