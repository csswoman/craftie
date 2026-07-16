import { useMemo, useState } from 'react';

import {
  MATERIALS,
  transformPalette,
  type Material,
} from '@lib/color/paintMaterials';
import type { SelectableColor } from '@lib/color/selectableColors';

export function PaintPaletteCanvas({ colors }: { colors: SelectableColor[] }) {
  const [material, setMaterial] = useState<Material>('gouache');
  const rawHexes = useMemo(() => colors.map((color) => color.hex), [colors]);
  const transformed = useMemo(
    () => transformPalette(rawHexes, material),
    [material, rawHexes],
  );

  return (
    <section className="flex h-full min-h-0 flex-col bg-bg p-4 lg:p-6" aria-labelledby="paint-palette-title">
      <header className="mb-4 shrink-0">
        <h2 id="paint-palette-title" className="font-display text-[1.375rem] font-medium text-ink">
          Colores para pintar
        </h2>
        <p className="mt-1 max-w-[65ch] text-pretty font-sans text-chrome-label text-muted">
          Muestras de tu paleta actual, vistas como pigmento. Sin roles ni corrección de contraste.
        </p>
      </header>
      <div className="mb-5 shrink-0">
        <h3 className="mb-2 text-tools-meta font-bold uppercase tracking-[0.06em] text-muted">
          Material
        </h3>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {Object.values(MATERIALS).map((option) => {
            const selected = material === option.id;
            const preview = transformPalette(rawHexes.slice(0, 3), option.id);

            return (
              <button
                key={option.id}
                type="button"
                aria-pressed={selected}
                onClick={() => setMaterial(option.id)}
                className={`rounded-[var(--chrome-radius-card)] border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 motion-reduce:transition-none ${
                  selected
                    ? 'border-primary bg-[var(--chrome-green-soft)] shadow-[0_0_0_1px_var(--primary)]'
                    : 'border-border bg-bg hover:border-primary/40 hover:bg-surface-raised'
                }`}
              >
                <span className="mb-2 flex h-6 gap-1" aria-hidden="true">
                  {preview.map((hex, index) => (
                    <i key={`${hex}-${index}`} className="min-w-0 flex-1 rounded-sm" style={{ backgroundColor: hex }} />
                  ))}
                </span>
                <span className={`block text-chrome-label font-bold ${selected ? 'text-primary' : 'text-ink'}`}>
                  {option.name}
                </span>
                <span className="mt-0.5 block text-chrome-caption leading-snug text-muted">
                  {option.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-2 flex shrink-0 flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <span className="text-tools-meta font-bold uppercase tracking-[0.06em] text-muted">
          Paleta transformada
        </span>
        <span className="text-chrome-caption font-semibold text-primary">
          {MATERIALS[material].name} · {MATERIALS[material].ruleLabel}
        </span>
      </div>

      <ul className="grid min-h-0 flex-1 grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3 lg:grid-cols-5">
        {transformed.map((hex, index) => (
          <li
            key={`${hex}-${index}`}
            className="flex min-h-28 flex-col justify-end rounded-[var(--chrome-radius-card)] p-3"
            style={{ backgroundColor: hex }}
          >
            <span className="w-fit rounded-md bg-bg px-2 py-1 font-mono text-tools-meta font-semibold text-ink">
              {hex.toUpperCase()}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-4 shrink-0 text-chrome-caption leading-snug text-muted">
        Aproximación perceptual de cómo el medio afecta el color según pigmento, opacidad y secado.
        No sustituye el color real de la pintura física.
      </p>
    </section>
  );
}
