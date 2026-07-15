'use client';

import type { ReactNode } from 'react';
import { Pin } from 'lucide-react';

import type { AppliedTypography } from '@lib/typography/typeState';
import { familyStackFromApplied } from '@lib/typography/typeState';
import {
  TYPE_SCALE_BASES,
  TYPE_SCALE_RATIOS,
  TYPE_SCALE_RATIO_OPTIONS,
  buildTypeScaleReadout,
  type TypeScaleBase,
  type TypeScaleRatio,
} from '@lib/typography/typeScale';

export type AppliedTypeZoneProps = {
  applied: AppliedTypography;
  pinHeading: boolean;
  pinBody: boolean;
  base: TypeScaleBase;
  ratio: TypeScaleRatio;
  onTogglePinHeading: () => void;
  onTogglePinBody: () => void;
  onBaseChange: (base: TypeScaleBase) => void;
  onRatioChange: (ratio: TypeScaleRatio) => void;
};

export function AppliedTypeZone({
  applied,
  pinHeading,
  pinBody,
  base,
  ratio,
  onTogglePinHeading,
  onTogglePinBody,
  onBaseChange,
  onRatioChange,
}: AppliedTypeZoneProps) {
  const readout = buildTypeScaleReadout(base, ratio);
  const bothPinned = pinHeading && pinBody;

  return (
    <div className="sticky top-0 z-10 min-w-0 shrink-0 overflow-x-hidden border-b border-border/70 bg-bg pb-3 pt-0.5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted">Aplicado</p>

      <div className="mt-2">
        <RoleRow
          label="Titular"
          family={applied.headingFamily}
          weight={applied.headingWeight}
          stack={familyStackFromApplied(applied.headingFamily, applied.headingClassification)}
          pinned={pinHeading}
          onTogglePin={onTogglePinHeading}
        />
        <div className="border-t border-border/70" />
        <RoleRow
          label="Cuerpo"
          family={applied.bodyFamily}
          weight={applied.bodyWeight}
          stack={familyStackFromApplied(applied.bodyFamily, applied.bodyClassification)}
          pinned={pinBody}
          onTogglePin={onTogglePinBody}
        />
        <div className="border-t border-border/70" />
      </div>

      {bothPinned ? (
        <p
          role="status"
          className="mt-2 rounded-md border border-border px-2.5 py-1.5 text-[11px] leading-snug text-ink"
        >
          Ambos roles fijados — desfijá uno para explorar la lista.
        </p>
      ) : null}

      <div className="mt-3 grid min-w-0 grid-cols-2 gap-3">
        <SegmentedField label="Base">
          {TYPE_SCALE_BASES.map((value) => (
            <SegmentButton
              key={value}
              active={base === value}
              onClick={() => onBaseChange(value)}
              label={`${value}`}
              ariaLabel={`Base ${value}px`}
            />
          ))}
        </SegmentedField>
        <SegmentedField label="Ratio">
          {TYPE_SCALE_RATIOS.map((value) => {
            const option = TYPE_SCALE_RATIO_OPTIONS.find((entry) => entry.value === value);
            return (
              <SegmentButton
                key={value}
                active={ratio === value}
                onClick={() => onRatioChange(value)}
                label={`${value}`}
                ariaLabel={`Ratio ${option?.label ?? value} (${value})`}
              />
            );
          })}
        </SegmentedField>
      </div>

      <p className="mt-2.5 flex min-w-0 flex-wrap gap-x-2 gap-y-0.5 text-[11px] leading-relaxed">
        <ScaleToken label="h1" value={readout.h1} />
        <ScaleToken label="h2" value={readout.h2} />
        <ScaleToken label="h3" value={readout.h3} />
        <ScaleToken label="body" value={readout.body} />
        <ScaleToken label="small" value={readout.small} />
      </p>
    </div>
  );
}

function ScaleToken({ label, value }: { label: string; value: number }) {
  return (
    <span className="whitespace-nowrap">
      <span className="font-medium text-ink/70">{label}</span>{' '}
      <span className="font-normal tabular-nums text-muted">{value}px</span>
    </span>
  );
}

function RoleRow({
  label,
  family,
  weight,
  stack,
  pinned,
  onTogglePin,
}: {
  label: string;
  family: string;
  weight: number;
  stack: string;
  pinned: boolean;
  onTogglePin: () => void;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2.5 py-2.5">
      <span className="w-[3.25rem] shrink-0 text-[12px] font-normal text-muted">{label}</span>
      <span
        className="min-w-0 flex-1 truncate text-[17px] leading-none text-ink"
        style={{ fontFamily: stack, fontWeight: weight }}
        title={family}
      >
        {family}
      </span>
      <span className="shrink-0 rounded-md bg-surface-raised px-1.5 py-0.5 text-[11px] tabular-nums text-muted">
        {weight}
      </span>
      <button
        type="button"
        onClick={onTogglePin}
        aria-pressed={pinned}
        aria-label={pinned ? `Desfijar ${label}` : `Fijar ${label}`}
        title={pinned ? `Desfijar ${label}` : `Fijar ${label}: se mantiene al elegir otro par`}
        className={`grid size-7 shrink-0 place-items-center rounded-md border transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 ${
          pinned
            ? 'border-ink/25 bg-bg text-ink'
            : 'border-border bg-bg text-muted hover:border-border hover:text-ink'
        }`}
      >
        <Pin
          size={13}
          strokeWidth={1.25}
          fill={pinned ? 'currentColor' : 'none'}
          aria-hidden="true"
        />
      </button>
    </div>
  );
}

function SegmentedField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted">{label}</p>
      <div className="mt-1.5 flex min-w-0 gap-0.5 rounded-lg bg-surface-raised p-0.5">{children}</div>
    </div>
  );
}

function SegmentButton({
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
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={ariaLabel}
      className={`min-h-7 min-w-0 flex-1 rounded-md px-0.5 text-[11px] tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 ${
        active
          ? 'bg-bg font-semibold text-ink shadow-sm'
          : 'bg-transparent font-normal text-muted hover:text-ink'
      }`}
    >
      {label}
    </button>
  );
}
