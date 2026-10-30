'use client';

import type { TypeScalePalette, TypeScaleSpecimenLevel } from '@lib/typography/typeScalePreview';

type TypeScaleTableProps = {
  levels: TypeScaleSpecimenLevel[];
  headingFamily: string;
  bodyFamily: string;
  palette: TypeScalePalette;
  activeId: string | null;
  onActiveChange: (id: string | null) => void;
  onSelect: (id: string, rect: DOMRect) => void;
};

const SAMPLE_CAP_PX = 26;

/** Compact reference: one line per level with its real size, spacing and weight. */
export function TypeScaleTable({
  levels,
  headingFamily,
  bodyFamily,
  palette,
  activeId,
  onActiveChange,
  onSelect,
}: TypeScaleTableProps) {
  return (
    <table className="w-full border-collapse text-left" aria-label="Niveles de la escala">
      <thead>
        <tr className="text-[0.6875rem]" style={{ color: palette.muted }}>
          <th scope="col" className="px-3 pb-2 font-normal">Nivel</th>
          <th scope="col" className="pb-2 pr-2 text-right font-normal">Tamaño</th>
          <th scope="col" className="pb-2 pr-2 text-right font-normal">Interl.</th>
          <th scope="col" className="pb-2 pr-3 text-right font-normal">Peso</th>
        </tr>
      </thead>
      <tbody>
        {levels.map((level) => {
          const active = activeId === level.id;

          return (
            <tr
              key={level.id}
              title={level.usage}
              onMouseEnter={() => onActiveChange(level.id)}
              onMouseLeave={() => onActiveChange(null)}
              className="transition-colors duration-150"
              style={{ backgroundColor: active ? palette.chip : 'transparent' }}
            >
              <th scope="row" className="min-w-0 rounded-l-lg p-0 text-left font-normal">
                <button
                  type="button"
                  aria-label={`Editar ${level.label}`}
                  onClick={(event) => onSelect(level.id, event.currentTarget.getBoundingClientRect())}
                  className="flex min-h-11 w-full items-baseline gap-2.5 rounded-lg px-3 py-2 text-left focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
                >
                  <span
                    aria-hidden="true"
                    className="w-9 shrink-0 truncate leading-none"
                    style={{
                      color: palette.ink,
                      fontFamily: level.isHeading ? headingFamily : bodyFamily,
                      fontWeight: level.weight,
                      fontSize: Math.min(level.size, SAMPLE_CAP_PX),
                    }}
                  >
                    Aa
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs" style={{ color: palette.ink }}>{level.label}</span>
                    <span className="block truncate text-[0.6875rem]" style={{ color: palette.muted }}>{level.usage}</span>
                  </span>
                </button>
              </th>
              <td className="py-2 pr-2 text-right font-mono text-xs tabular-nums" style={{ color: palette.ink }}>
                {level.size}px
              </td>
              <td className="py-2 pr-2 text-right font-mono text-xs tabular-nums" style={{ color: palette.muted }}>
                {level.lineHeight}
              </td>
              <td className="rounded-r-lg py-2 pr-3 text-right font-mono text-xs tabular-nums" style={{ color: palette.muted }}>
                {level.weight}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
