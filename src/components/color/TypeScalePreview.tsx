'use client';

import { useMemo, useState } from 'react';

import { buildSpecimenLevels, buildTypeScalePalette } from '@lib/typography/typeScalePreview';
import type { TypeScaleBase, TypeScaleRatio } from '@lib/typography/typeScale';
import type { SizeOverrides } from '@/components/font-pairing/FineTuneSizes';
import type { TypographySpacing } from '@/components/font-pairing/SpacingControls';

import { TypeLevelPopover, type TypeLevelAnchor } from '@/components/color/TypeLevelPopover';
import { useTypeRoles } from '@/context/TypeRolesContext';
import { TypeScaleSpecimen } from '@/components/color/TypeScaleSpecimen';
import { TypeScaleTable } from '@/components/color/TypeScaleTable';

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
  text,
  border,
  overrides,
  spacing,
  largerSteps,
  smallerSteps,
}: TypeScalePreviewProps) {
  const palette = useMemo(
    () => buildTypeScalePalette({ fondo: background, texto: text, borde: border }),
    [background, text, border],
  );
  const [activeId, setActiveId] = useState<string | null>(null);
  const [editing, setEditing] = useState<TypeLevelAnchor | null>(null);
  const { levelOverrides } = useTypeRoles();
  const levels = useMemo(
    () =>
      buildSpecimenLevels({
        base,
        ratio,
        largerSteps,
        smallerSteps,
        overrides,
        levelOverrides,
        headingWeight,
        bodyWeight,
        spacing,
      }),
    [base, ratio, largerSteps, smallerSteps, overrides, levelOverrides, headingWeight, bodyWeight, spacing],
  );

  return (
    <section
      className="@container/scale overflow-hidden rounded-xl border"
      style={{ backgroundColor: palette.background, borderColor: palette.hairline }}
      aria-labelledby="type-scale-title"
    >
      <header className="px-5 py-5 @min-[900px]/scale:px-8 @min-[900px]/scale:py-6">
        <div className="flex flex-col gap-5 @min-[640px]/scale:flex-row @min-[640px]/scale:items-end @min-[640px]/scale:justify-between">
          <div className="min-w-0">
            <h2
              id="type-scale-title"
              className="text-balance text-2xl"
              style={{ color: palette.ink, fontFamily: headingFamily, fontWeight: headingWeight, lineHeight: 1.1 }}
            >
              Escala tipográfica
            </h2>
            <p className="mt-2 max-w-[62ch] text-sm leading-relaxed text-pretty" style={{ color: palette.muted }}>
              Jerarquía modular para titulares, lectura continua y detalles de interfaz. Haz clic en cualquier texto o fila para ajustar su peso, tamaño e interlineado.
            </p>
          </div>
          <dl className="flex shrink-0 gap-2 text-sm">
            {[
              { label: 'Base', value: `${base}px` },
              { label: 'Ratio', value: String(ratio) },
              { label: 'Niveles', value: String(levels.length) },
            ].map((item) => (
              <div
                key={item.label}
                className="min-w-[4.5rem] rounded-lg px-3 py-2"
                style={{ backgroundColor: palette.chip }}
              >
                <dt className="text-[0.6875rem] leading-none" style={{ color: palette.muted }}>{item.label}</dt>
                <dd className="mt-1.5 font-mono tabular-nums" style={{ color: palette.ink }}>{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <p className="mt-5 text-xs leading-relaxed" style={{ color: palette.muted }}>
          <span style={{ color: palette.ink, fontFamily: headingFamily, fontWeight: headingWeight }}>{headingName}</span>
          {' '}en titulares ·{' '}
          <span style={{ color: palette.ink, fontFamily: bodyFamily, fontWeight: bodyWeight }}>{bodyName}</span>
          {' '}en lectura
        </p>
      </header>

      <div
        className="grid border-t @min-[900px]/scale:grid-cols-[minmax(0,1fr)_21rem]"
        style={{ borderColor: palette.hairline }}
      >
        <TypeScaleSpecimen
          levels={levels}
          headingFamily={headingFamily}
          bodyFamily={bodyFamily}
          palette={palette}
          activeId={activeId}
          onActiveChange={setActiveId}
          onSelect={(levelId, rect) => setEditing({ levelId, rect })}
        />
        <aside
          className="border-t px-2 py-5 @min-[900px]/scale:border-l @min-[900px]/scale:border-t-0 @min-[900px]/scale:py-8"
          style={{ borderColor: palette.hairline }}
          aria-label="Referencia de la escala"
        >
          <TypeScaleTable
            levels={levels}
            headingFamily={headingFamily}
            bodyFamily={bodyFamily}
            palette={palette}
            activeId={activeId}
            onActiveChange={setActiveId}
            onSelect={(levelId, rect) => setEditing({ levelId, rect })}
          />
        </aside>
      </div>
      <TypeLevelPopover anchor={editing} levels={levels} onClose={() => setEditing(null)} />
    </section>
  );
}
