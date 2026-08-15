import Link from 'next/link';

const STEPS = [
  {
    title: 'Inspiración',
    body: 'Estilo curado o imagen local (JPG/PNG/WebP).',
    detail: 'Vacío → «Elegir estilo curado» o subir imagen.',
  },
  {
    title: 'Panel Colores',
    body: 'Sistema (marca, fundaciones, estados) y Acentos (6 slots).',
    detail: 'Pestañas Sistema / Acentos en la barra lateral.',
  },
  {
    title: 'Guía de marca',
    body: 'Abre la vista previa con «Ver guía de marca» (Ctrl/⌘+Enter).',
    detail: 'Progreso «X de 7 listos» en el footer del panel.',
  },
  {
    title: 'Revisar y exportar',
    body: 'Maquetas, tipografía y menú Exportar del header.',
    detail: 'Activo con primary, background y on-background.',
  },
] as const;

export function DocsStudioWalkthrough() {
  return (
    <section
      aria-labelledby="docs-flow-title"
      className="overflow-hidden rounded-xl border border-border bg-surface"
    >
      <div className="border-b border-border px-4 py-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="docs-flow-title" className="text-sm font-bold text-ink">
              Cómo se usa el estudio
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted">
              Un solo workspace en la página de inicio. Cuatro momentos, sin wizard de pantallas.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
          >
            Abrir el estudio
          </Link>
        </div>
      </div>

      <ol className="grid divide-y divide-border sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4">
        {STEPS.map((step, index) => (
          <li
            key={step.title}
            className="p-4 sm:border-b sm:border-border sm:p-5 lg:border-b-0 lg:border-r lg:last:border-r-0 sm:odd:border-r"
          >
            <p className="font-mono text-xs font-semibold text-primary">{String(index + 1).padStart(2, '0')}</p>
            <h3 className="mt-2 text-base font-bold text-ink">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{step.body}</p>
            <p className="mt-3 text-xs leading-relaxed text-muted">{step.detail}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
