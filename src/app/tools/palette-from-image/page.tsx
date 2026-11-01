import type { Metadata } from 'next';

import { PaletteFromImage } from '@/components/tools/PaletteFromImage';
import { ToolShell } from '@/components/tools/ToolShell';

const PATH = '/tools/palette-from-image';

export const metadata: Metadata = {
  title: 'Paleta de colores desde una imagen, gratis',
  description:
    'Extrae los colores dominantes de cualquier foto y copia sus códigos HEX. Se procesa en tu navegador: la imagen no se sube a ningún servidor.',
  alternates: { canonical: PATH },
};

export default function PaletteFromImagePage() {
  return (
    <ToolShell
      currentPath={PATH}
      title="Paleta de colores desde una imagen"
      lead="Sube una foto y obtén sus colores dominantes. Copia cada HEX con un clic."
      about={
        <>
          <p>
            Craftie reduce la imagen a un tamaño pequeño, agrupa los píxeles por color con k-means y descarta los
            grises que solo aportan ruido. El resultado son los colores que más pesan visualmente en la imagen.
          </p>
          <p>
            Todo ocurre en tu navegador. La imagen no se envía a ningún servidor, no se guarda y no necesitas una
            cuenta.
          </p>
          <p>
            Si quieres convertir esos colores en un sistema de diseño, con roles para fondo, texto y acción
            principal, temas claro y oscuro y exportación a CSS, Tailwind o shadcn/ui, sube la misma imagen en el
            estudio.
          </p>
        </>
      }
    >
      <PaletteFromImage />
    </ToolShell>
  );
}
