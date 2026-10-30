'use client';

import { useMemo } from 'react';
import { Settings } from 'lucide-react';

import type { AppliedTypography } from '@lib/typography/typeState';
import type { CustomFontRole } from '@lib/typography/customFonts';
import { familyStackFromApplied } from '@lib/typography/typeState';
import {
  TYPE_SCALE_BASES,
  TYPE_SCALE_RATIOS,
  TYPE_SCALE_RATIO_OPTIONS,
  buildTypeScaleReadout,
  buildTypeScaleLevels,
  type TypeScaleBase,
  type TypeScaleRatio,
} from '@lib/typography/typeScale';

import { FineTuneSizes, type SizeOverrides } from './FineTuneSizes';
import { SpacingControls, type TypographySpacing } from './SpacingControls';
import { TypeRolesPanel } from './TypeRolesPanel';

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
  onBodyWeightChange: (weight: number) => void;
  onApplyGoogleFont: (family: string, role: CustomFontRole) => Promise<void>;
  overrides: SizeOverrides;
  spacing: TypographySpacing;
  largerSteps: number;
  smallerSteps: number;
  onOverridesChange: (overrides: SizeOverrides) => void;
  onSpacingChange: (spacing: TypographySpacing) => void;
  onAddLargerStep: () => void;
  onAddSmallerStep: () => void;
  configOpen: boolean;
  onConfigOpenChange: (open: boolean) => void;
  stickToPanelTop?: boolean;
};

const HEADING_WEIGHT_OPTIONS = [500, 600, 700] as const;
const BODY_WEIGHT_OPTIONS = [300, 400, 500, 600] as const;

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
  onBodyWeightChange,
  onApplyGoogleFont,
  overrides,
  spacing,
  largerSteps,
  smallerSteps,
  onOverridesChange,
  onSpacingChange,
  onAddLargerStep,
  onAddSmallerStep,
  configOpen,
  onConfigOpenChange,
  stickToPanelTop = false,
}: AppliedTypeZoneProps) {
  const readout = buildTypeScaleReadout(base, ratio);
  const levels = useMemo(
    () => buildTypeScaleLevels(base, ratio, largerSteps, smallerSteps),
    [base, ratio, largerSteps, smallerSteps],
  );
  const bothPinned = pinHeading && pinBody;

  return (
    <div
      className={`sticky z-10 min-w-0 shrink-0 bg-bg pb-4 pt-1 ${stickToPanelTop ? '-mt-[var(--chrome-space-3)] top-[-15px] xl:top-0' : 'top-0'
        }`}
    >
      <section
        aria-labelledby="applied-type-heading"
        className="overflow-hidden rounded-xl border border-border bg-surface"
      >
        <div className="flex min-h-9 items-center justify-between gap-2 border-b border-border px-3 py-1.5">
          <p
            id="applied-type-heading"
            className="text-chrome-caption font-semibold uppercase tracking-[0.08em] text-primary"
          >
            Aplicado
          </p>
          <button
            type="button"
            onClick={() => onConfigOpenChange(!configOpen)}
            aria-pressed={configOpen}
            aria-expanded={configOpen}
            aria-label={configOpen ? 'Ocultar ajustes de escala' : 'Mostrar ajustes de escala'}
            title={configOpen ? 'Ocultar ajustes de escala' : 'Ajustes de escala y peso'}
            className={`inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md border px-2.5 text-chrome-caption transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 ${configOpen
              ? 'border-primary/45 bg-primary/10 text-primary'
              : 'border-border bg-bg text-muted hover:border-primary/45 hover:text-primary'
              }`}
          >
            <Settings size={13} strokeWidth={1.5} aria-hidden="true" />
            <span>{configOpen ? 'Ver pares' : 'Ajustes de texto'}</span>
          </button>
        </div>

        <div className="divide-y divide-border/70 bg-bg px-3">
          <RoleRow
            label="Titular"
            family={applied.headingFamily}
            weight={applied.headingWeight}
            weightOptions={HEADING_WEIGHT_OPTIONS}
            onWeightChange={onHeadingWeightChange}
            stack={familyStackFromApplied(applied.headingFamily, applied.headingClassification)}
            pinned={pinHeading}
            onTogglePin={onTogglePinHeading}
            role="heading"
            onApplyFamily={onApplyGoogleFont}
          />
          <RoleRow
            label="Cuerpo"
            family={applied.bodyFamily}
            weight={applied.bodyWeight}
            weightOptions={BODY_WEIGHT_OPTIONS}
            onWeightChange={onBodyWeightChange}
            stack={familyStackFromApplied(applied.bodyFamily, applied.bodyClassification)}
            pinned={pinBody}
            onTogglePin={onTogglePinBody}
            role="body"
            onApplyFamily={onApplyGoogleFont}
          />
        </div>
      </section>

      {bothPinned ? (
        <p
          role="status"
          className="mt-2 rounded-md border border-primary/30 bg-primary/10 px-2.5 py-1.5 text-chrome-caption leading-[1.4] text-ink"
        >
          Ambos roles fijados — desfijá uno para explorar la lista.
        </p>
      ) : null}

      {configOpen ? (
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

          <p className="mt-4 flex min-w-0 flex-wrap gap-x-3 gap-y-1 border-t border-primary/25 pt-3 text-chrome-caption leading-[1.35]">
            <ScaleToken label="h1" value={readout.h1} />
            <ScaleToken label="h2" value={readout.h2} />
            <ScaleToken label="h3" value={readout.h3} />
            <ScaleToken label="body" value={readout.body} />
            <ScaleToken label="small" value={readout.small} />
          </p>
          <div className="mt-4 space-y-3 border-t border-border/70 pt-4">
            <FineTuneSizes
              levels={levels}
              overrides={overrides}
              onOverridesChange={onOverridesChange}
              onAddLargerStep={onAddLargerStep}
              onAddSmallerStep={onAddSmallerStep}
            />
            <SpacingControls value={spacing} onChange={onSpacingChange} />
            <TypeRolesPanel headingWeight={applied.headingWeight} bodyWeight={applied.bodyWeight} />
          </div>
        </>
      ) : null}
    </div>
  );
}
