import type { PreviewIconName } from './previewIcons';
import type { UiLayoutSlot } from '@lib/color/layoutModes';

export const LANDING_NAV = ['Estudio', 'Paletas', 'Guías'] as const;

export const STUDIO_TRAIL = [
  { label: 'Semilla', slot: 'data1' as const },
  { label: 'Roles', slot: 'data2' as const },
  { label: 'Contraste', slot: 'data3' as const },
  { label: 'Export', slot: 'data4' as const },
] as const;

export const STUDIO_STEPS: Array<{
  title: string;
  text: string;
  icon: PreviewIconName;
  slot: UiLayoutSlot;
}> = [
  {
    title: 'Mezclar',
    text: 'De un color semilla, Craftie arma roles claros sin ruido.',
    icon: 'layers',
    slot: 'data1',
  },
  {
    title: 'Contrastar',
    text: 'Cada par se mide en WCAG antes de tocar el lienzo.',
    icon: 'shield',
    slot: 'data2',
  },
  {
    title: 'Entregar',
    text: 'Tipografía y guía listas. El hex deja de pelearte.',
    icon: 'check',
    slot: 'data3',
  },
];

export const PLANS = [
  { name: 'Boceto', price: '$0', tagline: 'Paletas personales', slot: 'data1' as const },
  { name: 'Estudio', price: '$18', tagline: 'Guías y tipografía', slot: 'primaryAction' as const, featured: true },
  { name: 'Atelier', price: '$42', tagline: 'Equipos y marcas', slot: 'data4' as const },
] as const;

export const CRAFTIE_QUOTE = {
  author: 'Lucía Ríos',
  role: 'Diseñadora de marca',
  initials: 'LR',
  text: 'Craftie pinta con criterio de perro artista: mezcla con gusto y no deja pasar un contraste flojo.',
  badge: 'AA listo',
} as const;

export const HERO_COPY = {
  kicker: 'Perro artista · diseñador de color',
  headline: 'Mezcla la paleta. Tú decides la marca.',
  body: 'Prueba color en contexto, valida contraste y exporta una guía ligera, todo en el mismo estudio.',
  primaryCta: 'Abrir estudio',
  secondaryCta: 'Ver una paleta',
} as const;
