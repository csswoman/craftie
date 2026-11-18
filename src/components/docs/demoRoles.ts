export type RoleId = 'primario' | 'superficie' | 'texto' | 'acento';

export type DemoRole = {
  id: RoleId;
  token: string;
  visualName: string;
  label: string;
  note: string;
};

export const ROLES_ES: DemoRole[] = [
  {
    id: 'primario',
    token: 'primary',
    visualName: 'verde bosque',
    label: 'Acción principal',
    note: 'La acción que quieres que encuentren primero. Si cambias el tono, el token sigue siendo primary.',
  },
  {
    id: 'superficie',
    token: 'surface',
    visualName: 'gris menta',
    label: 'Superficie',
    note: 'Una capa sobre el fondo. El texto encima usa otro token (on-surface), no el color de la superficie.',
  },
  {
    id: 'texto',
    token: 'on-background',
    visualName: 'casi negro',
    label: 'Texto sobre fondo',
    note: 'Es el color del texto, no del relleno. Ponerlo como fondo de un botón rompe el contraste.',
  },
  {
    id: 'acento',
    token: 'accent',
    visualName: 'azul pizarra',
    label: 'Acento',
    note: 'Enlaces y destacados secundarios. Apoya la jerarquía sin competir con el primario.',
  },
];

export const ROLES_EN: DemoRole[] = [
  {
    id: 'primario',
    token: 'primary',
    visualName: 'forest green',
    label: 'Primary action',
    note: 'The action you want users to find first. If you change the hue, the token remains primary.',
  },
  {
    id: 'superficie',
    token: 'surface',
    visualName: 'mint gray',
    label: 'Surface',
    note: 'A layer above background. Text on top uses another token (on-surface), not the surface color.',
  },
  {
    id: 'texto',
    token: 'on-background',
    visualName: 'near black',
    label: 'Text on background',
    note: 'This is text color, not fill color. Using it as button background breaks contrast.',
  },
  {
    id: 'acento',
    token: 'accent',
    visualName: 'slate blue',
    label: 'Accent',
    note: 'Links and secondary highlights. Supports hierarchy without competing with primary.',
  },
];
