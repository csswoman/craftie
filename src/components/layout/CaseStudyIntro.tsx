const CASE_STUDY_PILLARS = [
  {
    term: 'Colores que combinan',
    detail:
      'Craftie arma una paleta completa a partir de un solo color o una imagen, con tonos que se ven bien juntos.',
  },
  {
    term: 'Legible para todos',
    detail:
      'Comprueba que el texto se lea con claridad sobre cada fondo, siguiendo los estándares de accesibilidad.',
  },
  {
    term: 'Listo para usar',
    detail:
      'Ves tus colores aplicados en botones, tarjetas y pantallas reales, y los exportas a tu proyecto en un clic.',
  },
] as const;

/**
 * Welcoming intro shown on the empty home screen, beside the dog illustration
 * and the inspiration card. Quiet Gallery aesthetic: Lora display for the
 * headline, Nunito body, primary used only as a thin accent, flat dividers,
 * WCAG-AA prose. Plain language for non-technical users. Presentation only.
 */
export function CaseStudyIntro() {
  return (
    <section aria-labelledby="case-study-title" className="w-full">
      <p className="text-chrome-caption font-semibold uppercase tracking-[0.14em] text-primary">
        Estudio de color
      </p>
      <h2
        id="case-study-title"
        className="mt-3 max-w-[16ch] text-balance font-display text-[2.25rem] font-medium leading-[1.1] text-ink sm:text-[2.75rem]"
      >
        Los colores de tu marca, listos en minutos.
      </h2>
      <p className="mt-4 max-w-[52ch] text-pretty text-chrome-section leading-relaxed text-muted">
        Elige un color o sube una imagen y Craftie crea una paleta completa, comprueba que se lea
        bien y te muestra cómo queda en una interfaz real.
      </p>

      <dl className="mt-8 grid gap-6 sm:grid-cols-3 lg:grid-cols-1 lg:gap-5">
        {CASE_STUDY_PILLARS.map((pillar) => (
          <div key={pillar.term} className="border-t border-border pt-4">
            <dt className="font-display text-chrome-section font-medium text-ink">{pillar.term}</dt>
            <dd className="mt-2 text-pretty text-chrome-label leading-relaxed text-muted">
              {pillar.detail}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
