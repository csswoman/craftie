const CASE_STUDY_PILLARS = [
  {
    term: 'Colores que combinan',
    detail:
      'Una paleta completa desde un solo color o una imagen.',
  },
  {
    term: 'Legible para todos',
    detail:
      'Texto con buen contraste sobre cada fondo (WCAG).',
  },
  {
    term: 'Listo para usar',
    detail:
      'Mira tus colores en una interfaz real y expórtalos en un clic.',
  },
] as const;

/**
 * Welcoming intro shown on the empty home screen, beside the dog illustration
 * and the inspiration card. Quiet Gallery aesthetic: Lora display for the
 * headline, Nunito body, primary used only as a thin accent, no dividers,
 * WCAG-AA prose. Plain language for non-technical users. Presentation only.
 */
export function CaseStudyIntro() {
  return (
    <section aria-labelledby="case-study-title" className="w-full">
      <h2
        id="case-study-title"
        className="max-w-[16ch] text-balance font-display text-[2.25rem] font-medium leading-[1.1] text-ink"
      >
        Los colores de tu marca, listos en minutos.
      </h2>
      <p className="mt-4 max-w-[52ch] text-pretty text-chrome-section leading-relaxed text-muted">
        Parte de un color o una imagen y Craftie hace el resto.
      </p>

      <dl className="mt-6 grid gap-4 sm:grid-cols-3 lg:grid-cols-1 lg:gap-4">
        {CASE_STUDY_PILLARS.map((pillar) => (
          <div key={pillar.term}>
            <dt className="font-display text-chrome-section font-medium text-ink">{pillar.term}</dt>
            <dd className="mt-1 text-pretty text-chrome-label leading-relaxed text-muted">
              {pillar.detail}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
