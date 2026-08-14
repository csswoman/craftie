'use client';

import { useMemo, type CSSProperties } from 'react';

import { buildTypeScaleLevels, type TypeScaleBase, type TypeScaleRatio } from '@lib/typography/typeScale';
import type { SizeOverrides } from '@/components/font-pairing/FineTuneSizes';
import type { TypographySpacing } from '@/components/font-pairing/SpacingControls';

type TypeScalePreviewProps = {
  base: TypeScaleBase;
  ratio: TypeScaleRatio;
  headingFamily: string;
  bodyFamily: string;
  headingWeight: number;
  bodyWeight: number;
  headingName: string;
  bodyName: string;
  background: string;
  surface: string;
  text: string;
  border: string;
  overrides: SizeOverrides;
  spacing: TypographySpacing;
  largerSteps: number;
  smallerSteps: number;
};

export function TypeScalePreview({
  base,
  ratio,
  headingFamily,
  bodyFamily,
  headingWeight,
  bodyWeight,
  headingName,
  bodyName,
  background,
  surface,
  text,
  border,
  overrides,
  spacing,
  largerSteps,
  smallerSteps,
}: TypeScalePreviewProps) {
  const rows = useMemo(() => buildTypeScaleLevels(base, ratio, largerSteps, smallerSteps), [base, ratio, largerSteps, smallerSteps]);
  const previewStyle: CSSProperties = {
    backgroundColor: surface,
    borderColor: border,
    ['--heading-line-height' as string]: String(spacing.headingLineHeight),
    ['--heading-letter-spacing' as string]: `${spacing.headingLetterSpacing}em`,
    ['--body-line-height' as string]: String(spacing.bodyLineHeight),
    ['--body-letter-spacing' as string]: `${spacing.bodyLetterSpacing}em`,
  };

  return (
    <section className="overflow-hidden rounded-xl border" style={previewStyle} aria-labelledby="type-scale-title">
        <div className="border-b px-5 py-5 sm:px-8 sm:py-7" style={{ backgroundColor: background, borderColor: border }}>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <h2 id="type-scale-title" className="text-xl font-semibold sm:text-2xl" style={{ color: text, fontFamily: headingFamily, fontWeight: headingWeight }}>
                Escala tipográfica
              </h2>
              <p className="mt-2 max-w-[62ch] text-sm leading-relaxed" style={{ color: text, opacity: 0.7 }}>
                Jerarquía modular para titulares, lectura continua y detalles de interfaz.
              </p>
            </div>
            <dl className="flex shrink-0 gap-5 text-sm" style={{ color: text }}>
              <div><dt className="text-[0.6875rem] font-semibold uppercase tracking-[0.06em] opacity-70">Base</dt><dd className="mt-1 font-mono font-semibold tabular-nums">{base}px</dd></div>
              <div><dt className="text-[0.6875rem] font-semibold uppercase tracking-[0.06em] opacity-70">Ratio</dt><dd className="mt-1 font-mono font-semibold tabular-nums">{ratio}</dd></div>
            </dl>
          </div>
          <p className="mt-5 truncate border-t pt-4 text-xs" style={{ color: text, borderColor: border, opacity: 0.7 }}>
            <span className="font-semibold" style={{ opacity: 1 }}>{headingName}</span> para títulos · <span className="font-semibold" style={{ opacity: 1 }}>{bodyName}</span> para lectura
          </p>
        </div>
        <div className="divide-y" style={{ borderColor: border }}>
          {rows.map((row) => {
            const size = overrides[row.id] ?? row.computedSize;
            const isHeading = row.role === 'heading';
            return (
              <div key={row.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-4 gap-y-3 px-5 py-5 sm:grid-cols-[7rem_minmax(0,1fr)_5rem] sm:px-8">
                <div className="min-w-0"><p className="text-xs font-semibold" style={{ color: text }}>{row.label}</p><p className="mt-1 truncate font-mono text-[0.625rem]" style={{ color: text, opacity: 0.7 }}>{row.token}</p></div>
                <span className="col-span-2 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap sm:col-span-1" style={{ color: text, fontFamily: isHeading ? headingFamily : bodyFamily, fontSize: `${size}px`, fontWeight: isHeading ? headingWeight : bodyWeight, lineHeight: `var(--${isHeading ? 'heading' : 'body'}-line-height)`, letterSpacing: `var(--${isHeading ? 'heading' : 'body'}-letter-spacing)` }}>
                  {isHeading ? 'Diseño con intención' : 'Una guía clara se lee sin esfuerzo.'}
                </span>
                <span className="col-start-2 row-start-1 text-right font-mono text-xs font-semibold tabular-nums sm:col-start-3" style={{ color: text }}>{size}<span className="font-normal opacity-70">px</span></span>
              </div>
            );
          })}
        </div>
    </section>
  );
}
