import type { UiLayoutSlot } from '@lib/color/layoutModes';

/** Container query context so the editorial page scales against its own width. */
export const EDITORIAL_CONTAINER_CLASS = '@container/editorial';
export const EDITORIAL_GUTTER_CLASS = 'px-6 @min-[720px]/editorial:px-10';

export const EDITORIAL_NAV = ['Ensayos', 'Entrevistas', 'Archivo'] as const;

export const EDITORIAL_ARTICLE = {
  category: 'Diseño y oficio',
  title: 'Por qué un buen sistema de color empieza por el texto',
  byline: 'Marta Ibáñez',
  meta: '8 min de lectura',
  lead: 'Antes de elegir un tono de marca conviene saber qué fondo va a sostener la lectura. Es la decisión que más se nota y la que menos se celebra.',
  paragraphs: [
    'Un párrafo largo pone a prueba el sistema entero. Si el contraste aguanta aquí, aguantará en las etiquetas, los botones y los avisos.',
    'La tipografía hace la otra mitad del trabajo: el tamaño base, la altura de línea y el peso del titular deciden si el texto se lee con calma o se esquiva.',
  ],
  quote: 'El color de marca se luce una vez; el color del texto trabaja en cada línea.',
} as const;

export const EDITORIAL_RELATED: Array<{ title: string; meta: string; slot: UiLayoutSlot }> = [
  { title: 'Neutros con carácter', meta: '5 min', slot: 'data1' },
  { title: 'Cuándo romper la escala', meta: '7 min', slot: 'data2' },
  { title: 'Un titular, dos pesos', meta: '4 min', slot: 'data3' },
];

export const EDITORIAL_TAGS = ['Contraste', 'Tipografía', 'Sistema'] as const;
