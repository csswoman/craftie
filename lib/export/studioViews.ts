export type DesignSystemView = 'style-guide' | 'type-scale' | 'colors';

export type LayoutView =
  | 'website'
  | 'ui-grid'
  | 'slides'
  | 'social'
  | 'newsletter'
  | 'resume'
  | 'business-card';

export type StudioView = DesignSystemView | LayoutView;

export type StudioViewGroup = 'design-system' | 'layouts';

export type StudioViewMeta = {
  id: StudioView;
  label: string;
  group: StudioViewGroup;
  description: string;
};

export const STUDIO_VIEWS: StudioViewMeta[] = [
  {
    id: 'style-guide',
    label: 'Guía de estilo',
    group: 'design-system',
    description: 'Tipografía, color e iconografía en un vistazo.',
  },
  {
    id: 'type-scale',
    label: 'Escala tipográfica',
    group: 'design-system',
    description: 'Jerarquía de tamaños con tu par de fuentes.',
  },
  {
    id: 'colors',
    label: 'Colores',
    group: 'design-system',
    description: 'Roles semánticos con valores técnicos.',
  },
  {
    id: 'website',
    label: 'Sitio web',
    group: 'layouts',
    description: 'Maqueta de landing con tu sistema.',
  },
  {
    id: 'ui-grid',
    label: 'UI Grid',
    group: 'layouts',
    description: 'Componentes en rejilla de producto.',
  },
  {
    id: 'slides',
    label: 'Diapositivas',
    group: 'layouts',
    description: 'Portada y slide de contenido.',
  },
  {
    id: 'social',
    label: 'Social',
    group: 'layouts',
    description: 'Formato vertical para redes.',
  },
  {
    id: 'newsletter',
    label: 'Newsletter',
    group: 'layouts',
    description: 'Bloques de email editorial.',
  },
  {
    id: 'resume',
    label: 'Currículum',
    group: 'layouts',
    description: 'Layout de CV de una columna.',
  },
  {
    id: 'business-card',
    label: 'Tarjeta de visita',
    group: 'layouts',
    description: 'Anverso y reverso compactos.',
  },
];

export function getStudioViewMeta(id: StudioView): StudioViewMeta {
  const meta = STUDIO_VIEWS.find((view) => view.id === id);
  if (!meta) {
    throw new Error(`Unknown studio view: ${id}`);
  }
  return meta;
}

export function isLayoutView(view: StudioView): view is LayoutView {
  return getStudioViewMeta(view).group === 'layouts';
}
