export function EmptyCanvas() {
  return (
    <div className="flex h-full min-h-0 items-center justify-center bg-surface-raised/40 px-6 py-8">
      <p className="prose-measure max-w-xs text-center text-chrome-label leading-relaxed text-muted">
        Elige una inspiración para crear el sistema de color y editarlo directamente en el lienzo.
      </p>
    </div>
  );
}

export function PaletteCanvasSkeleton() {
  return (
    <div className="flex min-h-0 flex-1 flex-col" aria-busy="true" aria-label="Generando paleta">
      <p className="sr-only">Generando paleta a partir de los roles asignados…</p>
      <div className="flex-1 animate-pulse bg-surface-raised" />
    </div>
  );
}
