export type DocsSection = {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
  code?: string;
};

export type DocsPage = {
  slug: string;
  section: string;
  title: string;
  description: string;
  lead: string;
  generated: string[];
  usage: string[];
  limitations: string[];
  sections: DocsSection[];
  kind?: 'home' | 'semantic-roles' | 'export' | 'standard';
};

export type DocsGroup = {
  title: string;
  pages: DocsPage[];
};

const page = (
  slug: string,
  section: string,
  title: string,
  description: string,
  lead: string,
  generated: string[],
  usage: string[],
  limitations: string[],
  sections: DocsSection[],
  kind: DocsPage['kind'] = 'standard',
): DocsPage => ({
  slug,
  section,
  title,
  description,
  lead,
  generated,
  usage,
  limitations,
  sections,
  kind,
});

export const DOCS_GROUPS: DocsGroup[] = [
  {
    title: 'Sobre Craftie',
    pages: [
      page(
        '',
        'Sobre Craftie',
        'Qué es Craftie',
        'Crear, probar y documentar identidad visual antes de implementarla en tu producto.',
        'Los colores y la tipografía pueden funcionar bien por separado y producir resultados distintos cuando se aplican a una interfaz real. Craftie es una herramienta para experimentar con paletas, roles semánticos y fuentes mientras observas el resultado en componentes e interfaces de ejemplo — en un solo estudio en `/`, sin wizard ni cuenta en la nube.',
        [
          'Roles con temas claro/oscuro y estados (Éxito, Advertencia, Peligro).',
          'Contraste WCAG y lectura APCA al editar.',
          'Parejas tipográficas y maquetas (Dashboard, Landing, Analytics…).',
          'Export: CSS, tokens JSON, DESIGN.md y brand kit.',
        ],
        [
          'Abre `/` → estilo curado o imagen.',
          'Asigna roles en panel Colores → «Ver guía de marca».',
          'Revisa tipografía y maquetas → Exportar.',
        ],
        [
          'Las maquetas usan contenido de ejemplo, no tu app completa.',
          'Propone valores; tú confirmas la intención de cada rol.',
        ],
        [
          {
            heading: 'El problema',
            paragraphs: [
              'Una paleta no muestra por sí sola cómo se verá un producto. Un color puede parecer correcto en un swatch y fallar en un botón, un texto, una superficie o un estado interactivo. Una pareja tipográfica puede verse bien en un título corto y perder legibilidad en tablas, formularios o párrafos largos.',
              'Probar todas esas combinaciones en tu app, en Figma o en un design system suele requerir tiempo y trabajo repetitivo.',
            ],
          },
          {
            heading: 'La propuesta',
            paragraphs: [
              'Craftie permite explorar estas decisiones antes de implementarlas. Empieza con un estilo curado, tus propios colores o una paleta extraída de una imagen. Asigna colores a roles semánticos, deriva temas claro y oscuro, comprueba accesibilidad y combina familias tipográficas.',
              'Los cambios se reflejan en interfaces de ejemplo para evaluar el sistema completo, no solo muestras aisladas.',
            ],
          },
          {
            heading: 'Qué puedes hacer',
            bullets: [
              'Crear una base visual — inspiración, imagen o colores propios.',
              'Asignar roles semánticos — fondo, texto, superficie, acción principal, borde y estados.',
              'Trabajar en OKLCH — luminosidad, intensidad y matiz para variantes y escalas.',
              'Revisar accesibilidad — contraste WCAG; APCA como lectura perceptual complementaria.',
              'Probar tipografías — parejas titular/cuerpo, Google Fonts o fuentes locales en contenido real.',
              'Afinar la escala — sobrescribe niveles individuales y ajusta interlineado/tracking por separado en titulares y cuerpo.',
              'Previsualizar interfaces — botones, navegación, paneles y datos en maquetas del canvas.',
              'Exportar el sistema — CSS, design tokens, JSON para Tokens Studio, DESIGN.md y brand kit.',
            ],
          },
          {
            heading: 'Flujo recomendado',
            bullets: [
              'Elige inspiración o introduce tus colores.',
              'Asigna los colores principales a roles semánticos.',
              'Revisa tema claro y oscuro.',
              'Corrige problemas de contraste.',
              'Selecciona y ajusta la tipografía.',
              'Comprueba distintas interfaces y anchos de ventana.',
              'Exporta o comparte el resultado.',
            ],
          },
          {
            heading: 'Craftie no reemplaza tu producto',
            paragraphs: [
              'Las interfaces del estudio sirven para explorar y detectar problemas rápido. Antes de publicar una identidad visual, pruébala también en tus componentes, contenidos, dispositivos y condiciones reales.',
            ],
          },
          {
            heading: 'Qué no es',
            bullets: [
              'No es un clon de Coolors ni Adobe Color.',
              'No hay plugin de Figma ni sincronización remota automática.',
              'No persiste el kit completo entre sesiones (solo preferencias parciales en el navegador).',
            ],
          },
        ],
        'home',
      ),
      page(
        'flow',
        'Sobre Craftie',
        'Flujo del estudio',
        'Cuatro momentos en el mismo workspace.',
        'Inspiración → ajuste en panel Colores → guía de marca → revisión y export. Tras crear la guía, el botón desaparece y Ctrl/⌘+Enter ya no aplica: el snapshot queda fijado para previews y export.',
        [],
        [],
        [],
        [
          {
            heading: '1. Inspiración',
            bullets: [
              'Estado vacío: «Elegir estilo curado» o subir imagen (JPG/PNG/WebP, máx. 5 MB, solo local).',
              'Cambiar de estilo a imagen o viceversa desde el panel Colores.',
            ],
          },
          {
            heading: '2. Ajuste',
            bullets: [
              'Panel lateral Colores: pestañas Sistema y Acentos; bloque de imagen al inicio.',
              'Canvas: paleta por columnas, vistas del sistema y maquetas.',
              'Footer «Ver guía de marca» con progreso (X de 7 roles listos).',
            ],
          },
          {
            heading: '3. Guía de marca',
            paragraphs: [
              'Congela el sistema derivado (tokens, escalas, estados). Es el momento para revisar tipografía y maquetas antes de exportar.',
            ],
          },
          {
            heading: '4. Export',
            bullets: [
              'Menú Exportar en el header cuando existen primary, background y on-background.',
              'Si falta alguno, el botón muestra «Falta: …».',
            ],
          },
          {
            heading: 'Layout',
            bullets: [
              'Desktop (≥1280px): barra lateral fija Colores / Tipografía.',
              'Móvil/tablet: dock inferior con Imagen, Colores y Tipografía.',
            ],
          },
        ],
      ),
      page(
        'inspiration',
        'Sobre Craftie',
        'Inspiración',
        'Estilo curado o imagen: las dos entradas reales.',
        'No hay flujo «un solo color semilla» en la UI. Empiezas con un preset o una foto; Craftie carga candidatos y tú asignas roles.',
        [],
        [],
        [],
        [
          {
            heading: 'Estilos curados (20)',
            bullets: [
              'Veinte estilos curados (Bosque sereno, Neón noche, Concreto…) con filtros por vibe.',
              'Cada uno trae 3 colores semilla y etiquetas de mood para tipografía.',
            ],
          },
          {
            heading: 'Desde imagen',
            bullets: [
              'Drag-and-drop o selector de archivo.',
              'Extracción de ~10 colores dominantes; «Regenerar» vuelve a muestrear.',
              'Tipo de paleta: Automático o forzar Pastel / Viva / Oscura / Neutra.',
              'Miniatura en toolbar del canvas; «Cambiar imagen» en el panel.',
            ],
          },
          {
            heading: 'Consejos',
            bullets: [
              'Usa fotos con color intencional, no capturas de otra UI.',
              'Regenera una vez si sale apagada; si sigue mal, edita roles manualmente.',
            ],
          },
        ],
      ),
      page(
        'panel-system',
        'Sobre Craftie',
        'Panel Colores: Sistema',
        'Marca, fundaciones, estados y colores fuente.',
        'La pestaña Sistema del panel Colores es el centro de edición semántica. «Editar» abre vistas enfocadas con candidatos de imagen, derivación L/C y contraste en vivo.',
        [],
        [],
        [],
        [
          {
            heading: 'Color de marca',
            bullets: [
              'Primario, Secundario, Acento — 3 roles con «Editar».',
            ],
          },
          {
            heading: 'Fundaciones',
            bullets: [
              'Fondo, Superficie, Borde, Texto — neutrales teñidos y contraste en contexto.',
            ],
          },
          {
            heading: 'Colores de estado',
            bullets: [
              'Éxito, Advertencia, Peligro (no solo rojo/verde decorativo).',
              '«Generar» rellena los tres estados en el panel. «Editar» abre el ajuste fino.',
              'Origen visible: Imagen, Ajustado o Generado.',
            ],
          },
          {
            heading: 'Colores fuente',
            paragraphs: [
              'Lista de colores extraídos de la imagen. Asigna un HEX a rol de marca, acento o estado desde el menú contextual.',
            ],
          },
          {
            heading: 'Vistas enfocadas',
            bullets: [
              'Candidatos etiquetados (fuente / sintético), opción «Sin asignar».',
              'Editor inline L/C con preview en el canvas.',
              'Contador de progreso hacia «Ver guía de marca».',
            ],
          },
        ],
      ),
      page(
        'panel-accents',
        'Sobre Craftie',
        'Panel Colores: Acentos',
        'Seis slots para gráficos y destacados.',
        'La pestaña Acentos gestiona 6 colores (Acento 1–6). El primero suele usarse en UI; 2–6 en gráficos. En export pueden aparecer como data-1…data-6.',
        [],
        [],
        [],
        [
          {
            heading: 'Controles',
            bullets: [
              'Contador «X de 6» y aviso si faltan slots.',
              'Candidatos con puntuación por uso: Texto, Fill, Acento, Superficie, Datos.',
              '«Vaciar Acento N» o derivar desde primario.',
            ],
          },
          {
            heading: 'Visión del color',
            paragraphs: [
              'Al elegir candidatos, Craftie penaliza pares que colapsan bajo deuteranopía (tooltip educativo). No hay simulación global de toda la pantalla.',
            ],
          },
          {
            heading: 'Canvas',
            paragraphs: [
              'En la vista Colores del lienzo, el toggle «Ver acentos» / «Ver roles» de la toolbar: el 1 se usa en UI; 2–6 en gráficos. En mobile, cambia de vista del lienzo con la pestaña Vista del menú inferior.',
            ],
          },
        ],
      ),
      page(
        'canvas-palette',
        'Sobre Craftie',
        'Lienzo: paleta de roles',
        'Columnas, herramientas y historial en el canvas.',
        'La vista Colores del canvas muestra columnas por rol (fondo, superficie, texto, primario, secundario, borde; acento en strip aparte). Es un modelo paralelo al panel Sistema: útil para comparar tonos y usar herramientas rápidas.',
        [],
        [],
        [],
        [
          {
            heading: 'Toolbar por columna',
            bullets: [
              'Bloquear — el rol no cambia al regenerar (por tema claro/oscuro por separado).',
              'Copiar HEX.',
              'Shades — 10 tonos derivados del color.',
              'Info — drawer con nombre NTC, armonías, copiar y sustituir color.',
              'Color aleatorio.',
            ],
          },
          {
            heading: 'Contraste en columnas',
            bullets: [
              'Badges Cumple / Parcial / No cumple en cada columna.',
              'Alerta flotante si la paleta de roles falla AA.',
            ],
          },
          {
            heading: 'Historial',
            bullets: [
              'Deshacer / Rehacer en toolbar (Ctrl/⌘+Z, Ctrl/⌘+Shift+Z, Ctrl/⌘+Y).',
              'Solo ediciones de paleta semántica, no tipografía ni imagen.',
            ],
          },
        ],
      ),
      page(
        'semantic-roles',
        'Sobre Craftie',
        'Roles semánticos',
        'Función estable, valor cambiable.',
        'Los roles del panel (Fondo, Texto, Primario…) exportan a tokens en inglés. Los componentes consumen el token; el HEX puede cambiar sin renombrar.',
        [],
        [],
        [],
        [
          {
            heading: 'Panel → export',
            bullets: [
              'Fondo → background · Superficie → surface · Texto → on-background',
              'Primario → primary · Secundario → secondary · Acento → accent · Borde → border',
              'Derivados en export: on-primary, surface-elevated, success, warning, error, data-*…',
            ],
          },
          {
            heading: 'Regla práctica',
            paragraphs: [
              'Si al cambiar el HEX tienes que renombrar el token, el nombre describía apariencia, no función.',
            ],
          },
        ],
        'semantic-roles',
      ),
      page(
        'contrast',
        'Sobre Craftie',
        'Contraste y OKLCH',
        'Dónde ver WCAG, APCA y los sliders L/C.',
        'No hay un «inspector» lateral dedicado. El contraste aparece en badges del canvas, editores del panel (vistas enfocadas), popover al editar en maquetas y en el editor de tokens semánticos.',
        [],
        [],
        [],
        [
          {
            heading: 'WCAG 2.2',
            bullets: [
              'Ratio, nivel AA/AAA y pass/fail sobre el par que editas.',
              'Texto normal ≥4.5:1 · texto grande ≥3:1.',
            ],
          },
          {
            heading: 'APCA',
            bullets: [
              'Lc complementario; aviso si discrepa de WCAG.',
              '«Pasa WCAG AA» y «APCA sugiere…» son afirmaciones distintas.',
            ],
          },
          {
            heading: 'OKLCH',
            bullets: [
              'L — claridad; primer control para arreglar contraste.',
              'C — intensidad (croma).',
              'H — matiz; mantener familia entre roles relacionados.',
              'HEX como referencia y para copiar.',
            ],
          },
          {
            heading: 'Límites',
            bullets: [
              'No audita teclado, ARIA, motion ni lectores de pantalla.',
              'Sin simulación global CVD ni tritanopia/gris en la UI.',
            ],
          },
        ],
      ),
      page(
        'typography',
        'Sobre Craftie',
        'Tipografía',
        'Parejas, escala y fuentes propias.',
        'Pestaña Tipografía en la barra lateral: parejas curadas, recomendadas por mood del estilo, filtros por categoría y fuente personalizada (Google o archivo local en sesión).',
        [],
        [],
        [],
        [
          {
            heading: 'Explorar y aplicar',
            bullets: [
              'Zona «Aplicado» con preview titular + cuerpo.',
              'Pin de titular o cuerpo al explorar el catálogo.',
              'Hover: «Vista previa — clic para aplicar».',
              'Top 3 recomendadas según mood del estilo activo.',
            ],
          },
          {
            heading: 'Escala',
            bullets: [
              'Base, ratio y peso del titular (500/600/700).',
              'Vista «Escala tipográfica» en canvas: Display, Títulos, Entradilla, Cuerpo, Detalle.',
            ],
          },
          {
            heading: 'Fuentes custom',
            bullets: [
              'Google Fonts por nombre o archivo local.',
              'Aplicar a Titular o Cuerpo; persiste en sessionStorage (no en export de archivo).',
              'El export guarda nombres de familia; tú cargas en tu app (@import, next/font, @font-face).',
            ],
          },
        ],
      ),
      page(
        'canvas-views',
        'Sobre Craftie',
        'Vistas del canvas',
        'Sistema, maquetas, ilustración y Pintar.',
        'El selector agrupa: Modo de extracción, Sistema de diseño, Maquetas y Vistas previas. Cambia de vista para encontrar conflictos que un swatch aislado no muestra.',
        [],
        [],
        [],
        [
          {
            heading: 'Sistema',
            bullets: [
              'Guía de estilo — muestras de color + tipografía.',
              'Escala tipográfica — jerarquía aplicada.',
              'Colores — roles, derivados y sistema completo.',
            ],
          },
          {
            heading: 'Maquetas',
            bullets: [
              'Dashboard · Landing · Reproductor · Analytics (contexto oscuro).',
              'Clic en un elemento → popover para editar el token semántico (OKLCH + contraste).',
            ],
          },
          {
            heading: 'Vistas previas',
            bullets: [
              'Ilustración — composición generativa SVG; «Otra composición».',
              'Pintar — paleta como pigmento (Gouache, Acuarela, Óleo); exploratorio, sin roles ni contraste.',
            ],
          },
          {
            heading: 'Qué mirar',
            bullets: [
              'Jerarquía fondo/superficie, legibilidad, peso del primario.',
              'Dashboard vs. Landing para densidad distinta.',
            ],
          },
        ],
      ),
      page(
        'theme',
        'Sobre Craftie',
        'Tema claro y oscuro',
        'Toggle del header y tokens derivados.',
        'El botón Claro/Oscuro en el header cambia la UI del estudio y el tema activo de la paleta. Craftie deriva valores light y dark para tokens compatibles.',
        [],
        [],
        [],
        [
          {
            heading: 'En el estudio',
            bullets: [
              'Toggle Sol/Luna junto a Docs y Exportar.',
              'Maqueta Analytics para revisar layout en contexto oscuro.',
              'Bloqueo por rol puede diferir entre claro y oscuro.',
            ],
          },
          {
            heading: 'En tu app',
            bullets: [
              'Export CSS incluye `:root` y `[data-theme="dark"]`.',
              'Activa dark con `data-theme="dark"` en `<html>` o contenedor raíz.',
            ],
          },
        ],
      ),
      page(
        'export',
        'Sobre Craftie',
        'Exportar',
        'Snapshot de la selección actual.',
        'Menú Exportar del header. Requiere primary, background y on-background. Descarga archivos listos; no sincroniza cambios posteriores.',
        [],
        [],
        [],
        [
          {
            heading: 'Formatos',
            bullets: [
              'CSS variables — custom properties light/dark.',
              'Design tokens (JSON) — W3C / Style Dictionary.',
              'Figma (Tokens Studio) — JSON para import manual (no es plugin).',
              'DESIGN.md — guía Markdown para el repo.',
              'Brand kit (.json) — paleta, roles, tipografía y DESIGN.md embebido.',
            ],
          },
          {
            heading: 'Tras descargar',
            bullets: [
              'Mensaje de confirmación (ej. «tokens.css descargado»).',
              'Versiona el archivo junto al código que lo consume.',
            ],
          },
          {
            heading: 'Ejemplo',
            code: '.button-primary {\n  background: var(--color-primary);\n  color: var(--color-on-primary);\n}',
          },
        ],
        'export',
      ),
      page(
        'help-shortcuts',
        'Sobre Craftie',
        'Ayuda, atajos y reset',
        'Header, teclado y empezar de nuevo.',
        'Además de estas docs, el estudio tiene Ayuda rápida en el header y atajos para guía e historial de color.',
        [],
        [],
        [],
        [
          {
            heading: 'Ayuda rápida (header)',
            paragraphs: [
              'Botón Ayuda: resumen de Inspiración, Colores, Accesibilidad, Tipografía y Exportación. Es distinto de `/docs`.',
            ],
          },
          {
            heading: 'Atajos',
            bullets: [
              'Ctrl/⌘+Enter — Ver guía de marca.',
              'Ctrl/⌘+Z — Deshacer edición de paleta.',
              'Ctrl/⌘+Shift+Z o Ctrl/⌘+Y — Rehacer.',
              'Esc — cerrar menús o vistas ampliadas.',
            ],
          },
          {
            heading: 'Reset',
            paragraphs: [
              'Clic en el logo Craftie con progreso activo → «¿Empezar de nuevo?» — pierdes la sesión actual (paleta, imagen, guía).',
            ],
          },
          {
            heading: 'No disponible hoy',
            bullets: [
              'Atajo ? para panel de atajos (definido en código, no montado).',
              'Calibrador de vibrancia en UI (lógica existe, sin control visible).',
            ],
          },
        ],
      ),
      page(
        'faq',
        'Sobre Craftie',
        'FAQ y límites',
        'Persistencia, preguntas frecuentes y límites honestos.',
        'Craftie es un estudio local en el navegador. Algunas cosas del motor no tienen control en UI; otras vistas en código no están en el selector del canvas.',
        [],
        [],
        [],
        [
          {
            heading: 'Qué se guarda localmente',
            bullets: [
              'localStorage: layout del panel, id de pareja tipográfica.',
              'sessionStorage: fuentes custom de la sesión.',
              'No se guarda: paleta completa, imagen ni guía entre visitas.',
            ],
          },
          {
            heading: 'Preguntas frecuentes',
            bullets: [
              '¿Estudio vs. docs? `/` trabaja · `/docs` documenta.',
              '¿Color semilla solo? No en UI; usa estilo o imagen.',
              '¿Export bloqueado? Falta primary, background u on-background.',
              '¿Escalas 50–900 en UI? El export puede derivarlas; no hay editor de rampa completa.',
              '¿Plugin Figma? No; solo JSON Tokens Studio si lo importas tú.',
            ],
          },
        ],
      ),
    ],
  },
];

export const DOCS_PAGES = DOCS_GROUPS.flatMap((group) => group.pages);

export function getDocsPage(slug: string) {
  return DOCS_PAGES.find((entry) => entry.slug === slug);
}

export function docsPath(slug: string) {
  return slug ? `/docs/${slug}` : '/docs';
}
