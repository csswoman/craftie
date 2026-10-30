import type { PreviewIconName } from './previewIcons';
import type { UiLayoutSlot } from '@lib/color/layoutModes';

export const LANDING_NAV = ['Estudio', 'Paletas', 'Guías'] as const;

/** Horizontal inset shared by header, hero, process, and body. */
export const LANDING_GUTTER_CLASS = 'px-6 @min-[720px]/landing:px-8';

export const STUDIO_TRAIL = [
  { label: 'Semilla', slot: 'brand1' as const },
  { label: 'Roles', slot: 'brand2' as const },
  { label: 'Contraste', slot: 'brand3' as const },
  { label: 'Export', slot: 'brand4' as const },
] as const;

export const STUDIO_STEPS: Array<{
  title: string;
  text: string;
  icon: PreviewIconName;
  slot: UiLayoutSlot;
}> = [
  {
    title: 'Mezclar',
    text: 'Un color semilla se convierte en roles de interfaz.',
    icon: 'layers',
    slot: 'brand1',
  },
  {
    title: 'Contrastar',
    text: 'Cada par texto–fondo se mide contra WCAG AA.',
    icon: 'shield',
    slot: 'brand2',
  },
  {
    title: 'Entregar',
    text: 'Tipografía y guía listas para exportar.',
    icon: 'check',
    slot: 'brand3',
  },
];

export const PLANS = [
  { name: 'Boceto', price: '$0', tagline: 'Paletas para uso personal', slot: 'brand2' as const },
  { name: 'Estudio', price: '$18', tagline: 'Guía, contraste y tipografía', slot: 'primaryAction' as const, featured: true },
  { name: 'Atelier', price: '$42', tagline: 'Varias marcas en un equipo', slot: 'brand3' as const },
] as const;

export const CRAFTIE_QUOTE = {
  author: 'Lucía Ríos',
  role: 'Diseñadora de marca',
  initials: 'LR',
  text: 'No deja pasar un contraste flojo. Craftie mezcla con criterio de perro artista.',
  badge: 'Contraste AA',
} as const;

export const HERO_COPY = {
  kicker: 'Perro artista · contraste medido',
  headline: 'Tu paleta, ya en contexto.',
  body: 'Genera roles, comprueba WCAG y exporta una guía ligera. El color se juzga en una UI, no en un swatch suelto.',
  primaryCta: 'Abrir estudio',
  secondaryCta: 'Ver contraste',
} as const;
