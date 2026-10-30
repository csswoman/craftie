import type { FontClassification, FontMeta, FontPair } from '../fontPairTypes';

function font(
  family: string,
  classification: FontClassification,
  role: 'heading' | 'body',
  personality: string[],
  extra: Partial<FontMeta> = {},
): FontMeta {
  return {
    family,
    googleFontsRef: `https://fonts.google.com/specimen/${family.replace(/ /g, '+')}`,
    classification,
    contrast: 'medium',
    xHeight: 'medium',
    personality,
    bestFor: role,
    ...extra,
  };
}

/**
 * Widely used Google Fonts combinations that were missing from the catalog.
 * Ranking lives in curation.ts so ordering stays in one place.
 */
export const POPULAR_PAIRS: FontPair[] = [
  {
    id: 'popular-poppins-inter',
    displayName: 'Startup versátil',
    heading: font('Poppins', 'sans-serif', 'heading', ['geométrica', 'amable'], {
      xHeight: 'high',
      defaultWeight: 600,
    }),
    body: font('Inter', 'sans-serif', 'body', ['neutral', 'legible'], { xHeight: 'high' }),
    rationale: 'Titulares geométricos y amables sobre el cuerpo más neutral de la web. Combinación base de muchas startups.',
    mood: ['moderno', 'digital'],
    character: ['minimal', 'warm'],
  },
  {
    id: 'popular-playfair-source-sans',
    displayName: 'Revista clásica',
    heading: font('Playfair Display', 'serif', 'heading', ['elegante', 'clásica'], {
      contrast: 'high',
    }),
    body: font('Source Sans 3', 'sans-serif', 'body', ['calmada', 'humanista'], { xHeight: 'high' }),
    rationale: 'Serif de alto contraste sobre una sans humanista tranquila. El look editorial de siempre.',
    mood: ['editorial', 'elegante'],
    character: ['editorial'],
  },
  {
    id: 'popular-montserrat-open-sans',
    displayName: 'Web corporativa',
    heading: font('Montserrat', 'sans-serif', 'heading', ['geométrica', 'firme'], {
      xHeight: 'high',
    }),
    body: font('Open Sans', 'sans-serif', 'body', ['abierta', 'legible'], { xHeight: 'high' }),
    rationale: 'Dos de las fuentes más usadas de Google Fonts: titulares firmes y cuerpo muy legible en cualquier pantalla.',
    mood: ['moderno', 'confiable'],
    character: ['minimal'],
  },
  {
    id: 'popular-oswald-lato',
    displayName: 'Marketing directo',
    heading: font('Oswald', 'sans-serif', 'heading', ['condensada', 'contundente'], {
      contrast: 'high',
    }),
    body: font('Lato', 'sans-serif', 'body', ['suave', 'abierta'], { xHeight: 'high' }),
    rationale: 'Titulares altos y condensados con un cuerpo suave y abierto. Funciona bien en landings y campañas.',
    mood: ['enérgico', 'directo'],
    character: ['warm'],
  },
  {
    id: 'popular-anton-roboto',
    displayName: 'Impacto póster',
    heading: font('Anton', 'display', 'heading', ['impactante', 'condensada'], {
      contrast: 'high',
      defaultWeight: 400,
    }),
    body: font('Roboto', 'sans-serif', 'body', ['neutral', 'funcional'], { xHeight: 'high' }),
    rationale: 'Titulares tamaño póster con un cuerpo neutro que no compite. Úsalo con titulares cortos.',
    mood: ['enérgico', 'directo'],
    character: ['minimal'],
  },
  {
    id: 'popular-libre-baskerville-open-sans',
    displayName: 'Tradicional confiable',
    heading: font('Libre Baskerville', 'serif', 'heading', ['tradicional', 'confiable'], {
      contrast: 'high',
      defaultWeight: 700,
    }),
    body: font('Open Sans', 'sans-serif', 'body', ['abierta', 'legible'], { xHeight: 'high' }),
    rationale: 'Serif clásica con una sans abierta. Transmite confianza en despachos, salud y marcas de servicio.',
    mood: ['editorial', 'confiable'],
    character: ['editorial'],
  },
  {
    id: 'popular-lora-merriweather-sans',
    displayName: 'Lectura larga',
    heading: font('Lora', 'serif', 'heading', ['cálida', 'literaria'], { defaultWeight: 600 }),
    body: font('Merriweather Sans', 'sans-serif', 'body', ['robusta', 'legible'], {
      xHeight: 'high',
    }),
    rationale: 'Titulares serif cálidos y cuerpo sans de x-height alta, pensado para artículos y blogs.',
    mood: ['editorial', 'sereno'],
    character: ['editorial', 'warm'],
  },
  {
    id: 'popular-roboto-roboto-slab',
    displayName: 'UI con carácter',
    heading: font('Roboto Slab', 'serif', 'heading', ['sólida', 'técnica']),
    body: font('Roboto', 'sans-serif', 'body', ['neutral', 'funcional'], { xHeight: 'high' }),
    rationale: 'Misma base que Roboto con una slab para los titulares. Cohesivo y fácil de leer en interfaces.',
    mood: ['técnico', 'confiable'],
    character: ['technical'],
  },
  {
    id: 'popular-fredoka-nunito',
    displayName: 'Familias y educación',
    heading: font('Fredoka', 'sans-serif', 'heading', ['redondeada', 'juguetona'], {
      xHeight: 'high',
      defaultWeight: 600,
    }),
    body: font('Nunito', 'sans-serif', 'body', ['amable', 'redondeada'], { xHeight: 'high' }),
    rationale: 'Formas redondeadas de punta a punta. Cercana para productos infantiles, educativos o de comunidad.',
    mood: ['cálido', 'amable'],
    character: ['warm'],
  },
  {
    id: 'popular-quicksand-karla',
    displayName: 'Suave y cercano',
    heading: font('Quicksand', 'sans-serif', 'heading', ['suave', 'geométrica'], {
      xHeight: 'high',
      defaultWeight: 600,
    }),
    body: font('Karla', 'sans-serif', 'body', ['humanista', 'peculiar'], { xHeight: 'high' }),
    rationale: 'Titulares geométricos suaves con un cuerpo humanista con algo de personalidad.',
    mood: ['cálido', 'amable'],
    character: ['warm', 'minimal'],
  },
  {
    id: 'popular-bricolage-work',
    displayName: 'Personalidad y claridad',
    heading: font('Bricolage Grotesque', 'sans-serif', 'heading', ['expresiva', 'moderna'], {
      defaultWeight: 700,
    }),
    body: font('Work Sans', 'sans-serif', 'body', ['limpia', 'versátil'], { xHeight: 'high' }),
    rationale: 'Un toque de carácter en los titulares y un cuerpo fiable debajo. Bueno para marcas creativas.',
    mood: ['moderno', 'expresivo'],
    character: ['minimal'],
  },
  {
    id: 'popular-oswald-source-serif',
    displayName: 'Portada editorial',
    heading: font('Oswald', 'sans-serif', 'heading', ['condensada', 'contundente'], {
      contrast: 'high',
    }),
    body: font('Source Serif 4', 'serif', 'body', ['editorial', 'cálida']),
    rationale: 'Titulares compactos sobre un cuerpo serif. Pensado para medios y sitios de publicación.',
    mood: ['editorial', 'directo'],
    character: ['editorial'],
  },
];
