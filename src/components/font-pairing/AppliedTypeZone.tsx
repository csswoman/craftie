'use client';

import { useState } from 'react';
import { Settings } from 'lucide-react';

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

import {
  RoleRow,
  ScaleToken,
  SegmentButton,
  SegmentedField,
} from './AppliedTypeZoneParts';

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
  onHeadingWeightChange: (weight: number) => void;
};

const HEADING_WEIGHT_OPTIONS = [500, 600, 700] as const;

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
  onHeadingWeightChange,
}: AppliedTypeZoneProps) {
  const [showConfig, setShowConfig] = useState(false);
  const readout = buildTypeScaleReadout(base, ratio);
  const bothPinned = pinHeading && pinBody;

  return (
    <div className="sticky top-0 z-10 min-w-0 shrink-0 overflow-x-hidden border-b border-border/70 bg-bg pb-4 pt-1">
      <div className="flex min-h-8 items-center justify-between">
        <p className="text-chrome-caption font-semibold uppercase tracking-[0.08em] text-primary">
          Aplicado
        </p>
        <button
          type="button"
          onClick={() => setShowConfig((current) => !current)}
          aria-pressed={showConfig}
          aria-expanded={showConfig}
          aria-label={showConfig ? 'Ocultar ajustes de escala' : 'Mostrar ajustes de escala'}
          title={showConfig ? 'Ocultar ajustes de escala' : 'Ajustes de escala y peso'}
          className={`grid size-7 shrink-0 place-items-center rounded-md border transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 ${
            showConfig
              ? 'border-primary/45 bg-primary/10 text-primary'
              : 'border-border bg-bg text-muted hover:border-primary/45 hover:text-primary'
          }`}
        >
          <Settings size={13} strokeWidth={1.5} aria-hidden="true" />
        </button>
      </div>

      <div className="mt-3 divide-y divide-border/70 border-y border-border/70">
        <RoleRow
          label="Titular"
          family={applied.headingFamily}
          weight={applied.headingWeight}
          stack={familyStackFromApplied(applied.headingFamily, applied.headingClassification)}
          pinned={pinHeading}
          onTogglePin={onTogglePinHeading}
        />
        <RoleRow
          label="Cuerpo"
          family={applied.bodyFamily}
          weight={applied.bodyWeight}
          stack={familyStackFromApplied(applied.bodyFamily, applied.bodyClassification)}
          pinned={pinBody}
          onTogglePin={onTogglePinBody}
        />
      </div>

      {bothPinned ? (
        <p
          role="status"
          className="mt-2 rounded-md border border-primary/30 bg-primary/10 px-2.5 py-1.5 text-chrome-caption leading-[1.4] text-ink"
        >
          Ambos roles fijados — desfijá uno para explorar la lista.
        </p>
      ) : null}

      {showConfig ? (
        <>
          <div className="mt-4 grid min-w-0 grid-cols-2 gap-4">
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

          <div className="mt-4">
            <SegmentedField label="Peso titular">
              {HEADING_WEIGHT_OPTIONS.map((value) => (
                <SegmentButton
                  key={value}
                  active={applied.headingWeight === value}
                  onClick={() => onHeadingWeightChange(value)}
                  label={`${value}`}
                  ariaLabel={`Peso titular ${value}`}
                />
              ))}
            </SegmentedField>
          </div>

          <p className="mt-4 flex min-w-0 flex-wrap gap-x-3 gap-y-1 border-t border-primary/25 pt-3 text-chrome-caption leading-[1.35]">
            <ScaleToken label="h1" value={readout.h1} />
            <ScaleToken label="h2" value={readout.h2} />
            <ScaleToken label="h3" value={readout.h3} />
            <ScaleToken label="body" value={readout.body} />
            <ScaleToken label="small" value={readout.small} />
          </p>
        </>
      ) : null}
    </div>
  );
}
