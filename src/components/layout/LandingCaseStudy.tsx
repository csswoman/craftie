const CASE_STUDY_PILLARS = [
  {
    term: 'OKLCH, no HSL',
    detail:
      'Los roles se derivan en espacio OKLCH, así que al ajustar luminosidad o croma el tono se mantiene perceptualmente estable.',
  },
  {
    term: 'Contraste APCA y WCAG',
    detail:
      'Cada par texto–fondo se mide contra WCAG 2.2 AA y se contrasta con la lectura APCA, con los datos a la vista en lugar de un sello verde.',
  },
  {
    term: 'Núcleo determinista',
    detail:
      'La misma semilla produce la misma paleta: la lógica de color es pura y se prueba sola, sin aleatoriedad escondida.',
  },
] as const;

/**
 * Brief portfolio case-study framing above the tool. Quiet Gallery aesthetic:
 * white page, Lora display + Nunito body, primary used only as a thin link
 * accent, flat (border + surface tone, no shadow), WCAG-AA prose. No uppercase
 * eyebrows, gradient text, hero metrics, or generic SaaS card grid.
 */
export function LandingCaseStudy() {
  return (
    <section
      aria-label="Sobre Craftie"
      className="mx-auto w-full max-w-4xl px-5 py-10 sm:px-8 sm:py-14"
    >
      <p className="text-chrome-label font-medium text-primary">Craftie · estudio de color</p>
      <h1 className="mt-2 max-w-[22ch] font-display text-ink">
        Paletas que se juzgan en contexto, no en un swatch suelto.
      </h1>
      <p className="mt-4 max-w-[65ch] text-chrome-body leading-relaxed text-muted">
        Craftie convierte un color semilla o una imagen en un sistema de roles completo, comprueba su
        contraste y lo muestra dentro de UIs reales. Nace como pieza de portafolio: una herramienta de
        diseño que practica el rigor que predica.
      </p>

      <dl className="mt-8 grid gap-6 sm:grid-cols-3">
        {CASE_STUDY_PILLARS.map((pillar) => (
          <div key={pillar.term} className="border-t border-border pt-3">
            <dt className="text-chrome-title font-semibold text-ink">{pillar.term}</dt>
            <dd className="mt-1.5 text-chrome-body leading-relaxed text-muted">{pillar.detail}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-8 text-chrome-label text-muted">
        El estudio abre debajo con una paleta de ejemplo lista para explorar.
      </p>
    </section>
  );
}
