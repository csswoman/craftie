import type { SelectableColor } from '@lib/color/selectableColors';

export function PaintPaletteCanvas({ colors }: { colors: SelectableColor[] }) {
  return (
    <section className="flex h-full min-h-0 flex-col bg-bg p-4 lg:p-6" aria-labelledby="paint-palette-title">
      <header className="mb-4 shrink-0">
        <h2 id="paint-palette-title" className="font-display text-[1.375rem] font-medium text-ink">
          Colores para pintar
        </h2>
        <p className="mt-1 max-w-[65ch] text-pretty font-sans text-chrome-label text-muted">
          Muestras reales de la imagen. No hay roles, ajustes de contraste ni colores derivados.
        </p>
      </header>
      <ul className="grid min-h-0 flex-1 grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {colors.map((color) => (
          <li
            key={color.id}
            className="flex min-h-28 flex-col justify-end rounded-[var(--chrome-radius-card)] p-3"
            style={{ backgroundColor: color.hex }}
          >
            <span className="w-fit rounded-md bg-bg px-2 py-1 font-mono text-tools-meta font-semibold text-ink">
              {color.hex.toUpperCase()}
            </span>
            <span className="mt-1 w-fit rounded-md bg-bg px-2 py-1 font-sans text-tools-meta text-muted">
              {Math.round((color.prominence ?? 0) * 100)}% de la imagen
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
