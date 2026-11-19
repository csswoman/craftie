import type { Metadata } from 'next';

import { ThemeTester } from '@/components/tools/ThemeTester';
import { ToolShell } from '@/components/tools/ToolShell';

const PATH = '/tools/theme-tester';

export const metadata: Metadata = {
  title: 'Probador de temas shadcn/ui con auditoría WCAG',
  description:
    'Pega las variables de tu tema shadcn/ui y míralas en una página real, en claro y oscuro, con el contraste WCAG de cada par de variables. Gratis y sin registro.',
  alternates: { canonical: PATH },
};

export default function ThemeTesterPage() {
  return (
    <ToolShell
      currentPath={PATH}
      title="Probador de temas shadcn/ui"
      lead="Pega el CSS de un tema (el que exporta Craftie u otro cualquiera). La página de ejemplo usa solo esas variables, así que ves lo mismo que verá tu app."
      about={
        <>
          <p>
            El probador lee las variables de <code>:root</code> (modo claro) y de <code>.dark</code> o{' '}
            <code>[data-theme=&quot;dark&quot;]</code> (modo oscuro), como lo haría tu app. Acepta cualquier color
            CSS (HEX, rgb, hsl u oklch) y referencias <code>var()</code>. Ignora <code>@theme</code> y el resto de
            reglas.
          </p>
          <p>
            La auditoría mide los pares que usan los componentes de shadcn/ui: cada <code>*-foreground</code> sobre
            su superficie, el texto atenuado sobre la página y sobre <code>--muted</code>, y el anillo de foco contra
            la página. El texto pide 4.5:1 (WCAG AA) y el anillo de foco 3:1 (WCAG 1.4.11).
          </p>
          <p>
            Todo ocurre en tu navegador. Solo se aplican colores opacos válidos y un <code>--radius</code> simple; el
            resto del CSS pegado no se ejecuta.
          </p>
        </>
      }
    >
      <ThemeTester />
    </ToolShell>
  );
}
