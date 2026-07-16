export type CanvasViewGroup = 'mode' | 'system' | 'layout' | 'preview';

export type CanvasViewId =
  | 'paint'
  | 'style-guide'
  | 'type-scale'
  | 'colors'
  | 'dashboard'
  | 'landing'
  | 'player'
  | 'analytics'
  | 'illustration';

export type CanvasViewMeta = {
  id: CanvasViewId;
  group: CanvasViewGroup;
  name: string;
  description: string;
};

export const CANVAS_VIEWS: readonly CanvasViewMeta[] = [
  { id: 'paint', group: 'mode', name: 'Pintar', description: 'Paleta actual como pigmento' },
  { id: 'style-guide', group: 'system', name: 'Guía de estilo', description: 'Vista completa del sistema' },
  { id: 'type-scale', group: 'system', name: 'Escala tipográfica', description: 'Roles y tamaños de fuente' },
  { id: 'colors', group: 'mode', name: 'Colores', description: 'Roles, derivados, sistema completo' },
  { id: 'dashboard', group: 'layout', name: 'Dashboard', description: 'Panel de control' },
  { id: 'landing', group: 'layout', name: 'Landing', description: 'Página de aterrizaje' },
  { id: 'player', group: 'layout', name: 'Reproductor', description: 'Player de música' },
  { id: 'analytics', group: 'layout', name: 'Analytics', description: 'Dashboard dark mode' },
  { id: 'illustration', group: 'preview', name: 'Ilustración', description: 'Composición generativa con la paleta' },
];

export const CANVAS_VIEW_GROUP_LABEL: Record<CanvasViewGroup, string> = {
  mode: 'Modo de extracción',
  system: 'Sistema de diseño',
  layout: 'Maquetas',
  preview: 'Vistas previas',
};

export function getCanvasViewMeta(id: CanvasViewId): CanvasViewMeta {
  return CANVAS_VIEWS.find((view) => view.id === id) ?? CANVAS_VIEWS[3]!;
}
