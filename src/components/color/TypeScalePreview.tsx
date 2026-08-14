'use client';

import { useMemo, type CSSProperties } from 'react';

import {
  buildTypeScaleRowTone,
  typeScaleIndexProgress,
  typeScaleSpecimenIsLarge,
} from '@lib/typography/typeScalePreview';
import { buildTypeScaleLevels, type TypeScaleBase, type TypeScaleRatio } from '@lib/typography/typeScale';
import type { SizeOverrides } from '@/components/font-pairing/FineTuneSizes';
import type { TypographySpacing } from '@/components/font-pairing/SpacingControls';

import { TypeScalePreviewRow } from '@/components/color/TypeScalePreviewRow';

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
  const rows = useMemo(
    () => buildTypeScaleLevels(base, ratio, largerSteps, smallerSteps),
    [base, ratio, largerSteps, smallerSteps],
  );
  const paintedRows = useMemo(() => {
    const sized = rows.map((row) => ({ ...row, size: overrides[row.id] ?? row.computedSize }));

    return sized.map((row, index) => {
      const isHeading = row.role === 'heading';
      const weight = isHeading ? headingWeight : bodyWeight;
      const progress = typeScaleIndexProgress(index, sized.length);

      return {
        ...row,
        isHeading,
        weight,
        tone: buildTypeScaleRowTone({
          fondo: background,
          superficie: surface,
          texto: text,
          borde: border,
          progress,
          specimenIsLarge: typeScaleSpecimenIsLarge(row.size, weight),
        }),
      };
    });
  }, [background, bodyWeight, border, headingWeight, overrides, rows, surface, text]);

  const headerTone = paintedRows[0]?.tone;
  const previewStyle: CSSProperties = {
    backgroundColor: headerTone?.background ?? surface,
    borderColor: border,
    ['--heading-line-height' as string]: String(spacing.headingLineHeight),
    ['--heading-letter-spacing' as string]: `${spacing.headingLetterSpacing}em`,
    ['--body-line-height' as string]: String(spacing.bodyLineHeight),
    ['--body-letter-spacing' as string]: `${spacing.bodyLetterSpacing}em`,
  };

  return (
    <section className="overflow-hidden rounded-xl border" style={previewStyle} aria-labelledby="type-scale-title">
      <header className="px-5 py-5 sm:px-8 sm:py-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h2
              id="type-scale-title"
              className="text-balance text-xl font-semibold sm:text-2xl"
              style={{ color: headerTone?.ink ?? text, fontFamily: headingFamily, fontWeight: headingWeight }}
            >
              Escala tipográfica
            </h2>
            <p className="mt-2 max-w-[62ch] text-sm leading-relaxed" style={{ color: headerTone?.muted ?? text }}>
              Jerarquía modular para titulares, lectura continua y detalles de interfaz.
            </p>
          </div>
          <dl className="flex shrink-0 gap-5 text-sm" style={{ color: headerTone?.ink ?? text }}>
            <div>
              <dt className="text-chrome-caption font-medium" style={{ color: headerTone?.muted ?? text }}>
                Base
              </dt>
              <dd className="mt-1 font-mono font-semibold tabular-nums">{base}px</dd>
            </div>
            <div>
              <dt className="text-chrome-caption font-medium" style={{ color: headerTone?.muted ?? text }}>
                Ratio
              </dt>
              <dd className="mt-1 font-mono font-semibold tabular-nums">{ratio}</dd>
            </div>
          </dl>
        </div>
        <p className="mt-4 truncate text-xs" style={{ color: headerTone?.muted ?? text }}>
          <span className="font-semibold" style={{ color: headerTone?.ink ?? text }}>
            {headingName}
          </span>{' '}
          para títulos ·{' '}
          <span className="font-semibold" style={{ color: headerTone?.ink ?? text }}>
            {bodyName}
          </span>{' '}
          para lectura
        </p>
      </header>
      <div>
        {paintedRows.map((row, index) => (
          <TypeScalePreviewRow
            key={row.id}
            label={row.label}
            usage={row.usage}
            token={row.token}
            size={row.size}
            isHeading={row.isHeading}
            family={row.isHeading ? headingFamily : bodyFamily}
            weight={row.weight}
            tone={row.tone}
            showHairline={index < paintedRows.length - 1}
          />
        ))}
      </div>
    </section>
  );
}
