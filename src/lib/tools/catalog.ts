export type ToolEntry = {
  path: string;
  name: string;
  description: string;
};

/** Standalone tools, used by the sitemap and by the cross-links between tool pages. */
export const TOOLS: readonly ToolEntry[] = [
  {
    path: '/tools/contrast-checker',
    name: 'Verificador de contraste WCAG',
    description: 'Comprueba el contraste entre dos colores y obtén una corrección sugerida si no llega a AA.',
  },
  {
    path: '/tools/palette-from-image',
    name: 'Paleta de colores desde una imagen',
    description: 'Extrae los colores dominantes de una foto, sin subirla a ningún servidor.',
  },
  {
    path: '/palettes',
    name: 'Galería de paletas',
    description: 'Paletas originales filtradas por estilo, listas para abrir en el estudio.',
  },
];
