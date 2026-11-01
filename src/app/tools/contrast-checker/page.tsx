import type { Metadata } from 'next';

import { ContrastChecker } from '@/components/tools/ContrastChecker';
import { ToolShell } from '@/components/tools/ToolShell';

const PATH = '/tools/contrast-checker';

export const metadata: Metadata = {
  title: 'Verificador de contraste WCAG online y gratis',
  description:
    'Comprueba el contraste entre el color del texto y el fondo según WCAG 2.2 (AA y AAA) y APCA. Si no cumple, sugiere cómo corregirlo. Gratis y sin registro.',
  alternates: { canonical: PATH },
};

export default function ContrastCheckerPage() {
  return (
    <ToolShell
      currentPath={PATH}
      title="Verificador de contraste WCAG"
      lead="Elige un color de texto y uno de fondo. Verás el ratio, si cumple AA o AAA y una corrección sugerida cuando no llega."
      about={
        <>
          <p>
            WCAG 2.2 mide el contraste como la relación entre las luminancias relativas de dos colores, de 1:1
            (idénticos) a 21:1 (negro sobre blanco). Para texto normal pide al menos 4.5:1 en el nivel AA y 7:1 en
            AAA. Para texto grande, 3:1 y 4.5:1.
          </p>
          <p>
            APCA es un modelo más reciente que tiene en cuenta cómo percibimos la luminosidad. Craftie lo muestra
            como lectura complementaria (Lc): a partir de 60 se considera cómodo para texto de cuerpo.
          </p>
          <p>
            Cuando el par falla, la corrección sugerida mueve la luminosidad en OKLCH para conservar el tono y
            llegar a 4.5:1 con el menor cambio posible. Es una propuesta, no una regla: valida el resultado en tu
            interfaz real.
          </p>
        </>
      }
    >
      <ContrastChecker />
    </ToolShell>
  );
}
