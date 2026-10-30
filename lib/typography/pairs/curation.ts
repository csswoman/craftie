import type { FontPair } from '../fontPairTypes';

/**
 * Editorial ranking of the most widely used Google Fonts pairings (1 = most used),
 * based on what recurring "best Google Font pairings" guides recommend.
 */
export const POPULAR_RANKS: Readonly<Record<string, number>> = {
  'popular-poppins-inter': 1,
  'popular-playfair-source-sans': 2,
  'serif-fraunces-inter': 3,
  'serif-dm-serif-dm-sans': 4,
  'sans-poppins-open-sans': 5,
  'popular-montserrat-open-sans': 6,
  'popular-oswald-lato': 7,
  'popular-anton-roboto': 8,
  'popular-libre-baskerville-open-sans': 9,
  'display-archivo-black-archivo': 10,
  'display-space-mono-grotesk': 11,
  'family-inter': 12,
  'popular-lora-merriweather-sans': 13,
  'popular-roboto-roboto-slab': 14,
  'popular-fredoka-nunito': 15,
  'serif-cormorant-proza': 16,
  'popular-quicksand-karla': 17,
  'popular-bricolage-work': 18,
  'popular-oswald-source-serif': 19,
  'serif-playfair-lato': 20,
};

/** Replaces terse one-liners with a rationale that says what the pair is good for. */
const RATIONALE_OVERRIDES: Readonly<Record<string, string>> = {
  'display-space-mono-jakarta': 'Monoespaciada técnica en titulares y una sans redondeada para leer. Pensado para herramientas de desarrollo.',
  'display-space-mono-grotesk': 'Dos fuentes de la misma familia de diseño, una con voz técnica y otra geométrica. Ideal para dev tools y proyectos Web3.',
  'display-bebas-work': 'Mayúsculas condensadas de mucho impacto con un cuerpo sans neutro. Funciona en deportes y eventos.',
  'display-archivo-black-archivo': 'Titulares muy pesados con su misma familia en el cuerpo. Fuerte y sin adornos para B2B.',
  'display-gravitas-poppins': 'Display pesado y muy reconocible con un cuerpo geométrico amable. Para marcas que quieren presencia.',
  'display-unbounded-inter': 'Titulares anchos y redondeados con un cuerpo neutro. Da un aire creativo sin perder legibilidad.',
  'display-syne-syne': 'Una sola voz Syne con mucho contraste de peso. Para marcas de carácter fuerte y poco texto.',
  'display-league-spartan-inter': 'Geometría compacta en titulares y Inter en el cuerpo. Directo para marketing y landings.',
  'display-oswald-inter': 'Condensada y alta para titulares densos con un cuerpo neutro. Típica de medios y noticias.',
  'display-anton-inter': 'Titulares de máximo impacto con un cuerpo neutro. Úsalo con titulares cortos.',
  'display-archivo-narrow-inter': 'Titulares estrechos que ahorran espacio horizontal. Útil en dashboards y tablas densas.',
  'display-bricolage-manrope': 'Titulares con rasgos expresivos y un cuerpo limpio. Para productos de IA y marcas creativas.',
  'sans-inter-krub': 'Inter en titulares y Krub en el cuerpo, con un aire más cercano. Sans limpia para SaaS y dashboards.',
  'sans-montserrat-karla': 'Titulares geométricos firmes y cuerpo humanista más suave. Equilibra estructura y calidez.',
  'sans-poppins-open-sans': 'Dos de las sans más usadas: titulares geométricos y cuerpo muy legible. Seguro para casi cualquier web app.',
  'sans-roboto-nunito': 'Roboto neutro en titulares y Nunito redondeada en el cuerpo. Neutro pero amable en móvil.',
  'sans-work-source': 'Dos sans de lectura cómoda y poco ruido. Aspecto profesional para productos digitales.',
  'sans-manrope-inter': 'Manrope da un toque premium a los titulares y Inter sostiene la lectura. Funciona en fintech y productividad.',
  'sans-space-grotesk-inter': 'Titulares con rasgos tecnológicos y un cuerpo neutro. Para IA, Web3 y startups.',
  'sans-syne-inter': 'Titulares con una voz de marca fuerte y un cuerpo neutro que no compite.',
  'sans-prompt-rubik': 'Formas redondeadas y cálidas de principio a fin. Cercano para educación y apps de aprendizaje.',
  'sans-albert-barlow': 'Dos sans sobrias y compactas. Minimalista para SaaS y portfolios.',
  'sans-reddit-sora': 'Titulares geométricos con aire social y un cuerpo abierto. Contemporáneo para comunidades y apps sociales.',
  'sans-urbanist-redhat': 'Urbanist y Red Hat Display, ambas limpias y elegantes. Para fintech y servicios con tono sobrio.',
  'sans-mulish-karla': 'Dos sans suaves y humanistas. Tono calmado para wellness y servicios personales.',
  'sans-bricolage-inter': 'Titulares con personalidad sobre un cuerpo neutro. Para productos de IA y marcas creativas.',
  'sans-outfit-inter': 'Titulares geométricos limpios con un cuerpo neutro. Moderno y fácil de aplicar en apps.',
  'sans-outfit-manrope': 'Dos geométricas modernas con buen ritmo. Elegante para SaaS.',
  'sans-sora-inter': 'Titulares anchos y tecnológicos con un cuerpo neutro. Para productos de IA.',
  'serif-playfair-lato': 'Serif de alto contraste con una sans suave. Elegante para moda, belleza y estilo de vida.',
  'serif-raleway-merriweather': 'Titulares finos y elegantes con un cuerpo serif robusto. Funciona en blogs y contenido largo.',
  'serif-montserrat-lora': 'Titulares geométricos firmes con un cuerpo serif cálido. Clásico con aire moderno.',
  'serif-roboto-lora': 'Titulares neutros de interfaz y cuerpo serif para leer. Útil en noticias y apps de lectura.',
  'serif-source-alegreya': 'Titulares sans claros con un cuerpo serif de trazo caligráfico. Cómodo en documentación y artículos.',
  'serif-dm-serif-dm-sans': 'Familias diseñadas para ir juntas, con un serif de alto contraste y una sans geométrica. Editorial y cohesivo.',
  'serif-fraunces-inter': 'Serif suave con mucho carácter sobre la sans más neutral. Moderno y cálido para branding.',
  'serif-libre-baskerville-source': 'Baskerville clásica con una sans humanista. Tradicional y cómoda para leer.',
  'serif-cormorant-proza': 'Serif de alto contraste muy fina con una sans humanista. Aire de lujo para marcas premium.',
  'serif-ibm-plex': 'Serif y sans de la misma familia de diseño. Sobrio y coherente para entornos enterprise.',
  'serif-noto-pair': 'Noto Serif y Noto Sans comparten diseño y cubren muchos alfabetos. Para productos multilenguaje.',
  'serif-zilla-lexend': 'Slab con carácter y Lexend, diseñada para facilitar la lectura. Para educación y contenido accesible.',
  'serif-spectral-inter': 'Serif editorial pensada para pantalla con un cuerpo neutro. Para blogs y newsletters modernos.',
  'serif-newsreader-inter': 'Serif de estilo periodístico con un cuerpo neutro. Para revistas y sitios de contenido.',
  'serif-bitter-source': 'Slab legible en pantalla con una sans humanista. Cómodo en documentación y blogs técnicos.',
  'serif-literata-inter': 'Serif diseñada para lectura prolongada con un cuerpo neutro. Para apps de lectura y educativas.',
};

function singleFamilyRationale(pair: FontPair): string {
  return `${pair.heading.family} en titulares y cuerpo. La jerarquía se logra solo con peso y tamaño, sin mezclar familias.`;
}

function curate(pair: FontPair): FontPair {
  const rationale = pair.id.startsWith('family-')
    ? singleFamilyRationale(pair)
    : (RATIONALE_OVERRIDES[pair.id] ?? pair.rationale);
  const popularRank = POPULAR_RANKS[pair.id];

  return {
    ...pair,
    rationale,
    // Playfair is a serif; one entry had it as "display", which changes the fallback stack.
    heading:
      pair.heading.family === 'Playfair Display' && pair.heading.classification === 'display'
        ? { ...pair.heading, classification: 'serif' }
        : pair.heading,
    ...(popularRank !== undefined ? { popularRank } : {}),
  };
}

/** Applies rationales and popularity, then lists popular pairs first (most used on top). */
export function curatePairs(pairs: FontPair[]): FontPair[] {
  const curated = pairs.map(curate);
  const popular = curated
    .filter((pair) => pair.popularRank !== undefined)
    .sort((left, right) => left.popularRank! - right.popularRank!);
  const rest = curated.filter((pair) => pair.popularRank === undefined);

  return [...popular, ...rest];
}
