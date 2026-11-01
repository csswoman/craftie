import type { Metadata } from 'next';

import { DESIGN_STYLES } from '@lib/styles/presets';

import { PaletteGallery } from '@/components/tools/PaletteGallery';
import { ToolShell } from '@/components/tools/ToolShell';

const PATH = '/palettes';

export const metadata: Metadata = {
  title: 'Galería de paletas de colores para tu marca',
  description:
    'Paletas de colores originales y curadas, filtradas por estilo. Ábrelas en el estudio de Craftie para asignar roles, probar maquetas y exportar a CSS, Tailwind o shadcn/ui.',
  alternates: { canonical: PATH },
};

export default function PalettesPage() {
  return (
    <ToolShell
      currentPath={PATH}
      title="Galería de paletas"
      lead="Puntos de partida originales de Craftie. Elige una y ábrela en el estudio para convertirla en un sistema de diseño."
      about={
        <>
          <p>
            Cada paleta combina cinco colores pensados para funcionar juntos. Al abrirla en el estudio, Craftie los
            toma como colores fuente: tú decides cuál es el fondo, el texto y la acción principal, y la herramienta
            comprueba el contraste en tema claro y oscuro.
          </p>
          <p>
            Las paletas son un punto de partida, no un resultado final. Ajusta los roles, prueba las maquetas y
            exporta cuando el sistema funcione en tu interfaz.
          </p>
        </>
      }
    >
      <PaletteGallery styles={DESIGN_STYLES} />
    </ToolShell>
  );
}
