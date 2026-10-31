import type { UiLayoutSlot } from '@lib/color/layoutModes';

/** Container query context so the editorial page scales against its own width. */
export const EDITORIAL_CONTAINER_CLASS = 'preview-root @container/editorial';
export const EDITORIAL_GUTTER_CLASS = 'px-6 @min-[720px]/editorial:px-10';

export const EDITORIAL_NAV = ['Ensayos', 'Entrevistas', 'Color', 'Tipografía', 'Archivo'] as const;

export const EDITORIAL_MASTHEAD = {
  name: 'Revista Taller',
  tagline: 'Diseño, oficio y color',
  issue: 'Nº 42 · Otoño 2026',
} as const;

export const EDITORIAL_ARTICLE = {
  category: 'Diseño y oficio',
  title: 'Por qué un buen sistema de color empieza por el texto',
  dek: 'El tono de marca se lleva los aplausos, pero es el fondo el que sostiene cada línea. Una guía para empezar por lo que más se lee.',
  byline: 'Marta Ibáñez',
  meta: '8 min de lectura',
  lead: 'Antes de elegir un tono de marca conviene saber qué fondo va a sostener la lectura. Es la decisión que más se nota y la que menos se celebra.',
  paragraphs: [
    'Un párrafo largo pone a prueba el sistema entero. Si el contraste aguanta aquí, aguantará en las etiquetas, los botones y los avisos.',
    'La tipografía hace la otra mitad del trabajo: el tamaño base, la altura de línea y el peso del titular deciden si el texto se lee con calma o se esquiva.',
  ],
  quote: 'El color de marca se luce una vez; el color del texto trabaja en cada línea.',
} as const;

/** Stories in this issue; each one wears one palette color as its section color. */
export const EDITORIAL_RELATED: Array<{ title: string; meta: string; section: string; slot: UiLayoutSlot }> = [
  { title: 'Neutros con carácter', meta: '5 min', section: 'Color', slot: 'brand1' },
  { title: 'Cuándo romper la escala', meta: '7 min', section: 'Tipografía', slot: 'brand2' },
  { title: 'Un titular, dos pesos', meta: '4 min', section: 'Oficio', slot: 'brand3' },
];

export const EDITORIAL_MOST_READ = [
  'El gris que no es gris',
  'Diez paletas que envejecen bien',
  'Contraste sin miedo: guía práctica',
  'La serif vuelve a la pantalla',
] as const;

export const EDITORIAL_TAGS = ['Contraste', 'Tipografía', 'Sistema'] as const;

export const EDITORIAL_FOOTER_LINKS = ['Archivo', 'Suscripción', 'Quiénes somos', 'Contacto'] as const;
