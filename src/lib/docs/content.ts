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
        'Los colores y la tipografía pueden funcionar bien por separado y producir resultados distintos cuando se aplican a una interfaz real. Craftie es una herramienta para experimentar con paletas, roles semánticos y fuentes mientras observas el resultado en componentes e interfaces de ejemplo — en un solo estudio en `/`, sin wizard y sin cuenta: todo se guarda en tu navegador.',
        [
          'Roles con temas claro/oscuro y estados (Éxito, Advertencia, Peligro).',
          'Contraste WCAG y lectura APCA, con consejos para corregir lo que falla.',
          'Parejas tipográficas, roles de texto y 7 maquetas (Dashboard, Landing, App móvil, Editorial, Tienda…).',
          'Export: CSS, tokens JSON, DESIGN.md, brand kit, imagen PNG y enlace compartible.',
        ],
        [
          'Abre `/` → estilo curado, imagen o un HEX propio.',
          'Asigna roles en panel Colores → «Ver guía de marca».',
          'Revisa tipografía y maquetas → guarda en Mis proyectos → Exportar.',
        ],
        [
          'Las maquetas usan contenido de ejemplo, no tu app completa.',
          'Propone valores; tú confirmas la intención de cada rol.',
          'Los proyectos viven en este navegador: no hay sincronización entre dispositivos.',
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
              'Crear una base visual — estilo curado, imagen o un HEX propio.',
              'Asignar roles semánticos — fondo, texto, superficie, acción principal, borde y estados.',
              'Trabajar en OKLCH — luminosidad, intensidad y matiz para variantes y escalas.',
              'Revisar accesibilidad — contraste WCAG, APCA complementario y consejos con la corrección sugerida.',
              'Probar tipografías — parejas populares y curadas, Google Fonts o fuentes locales en contenido real.',
              'Afinar la escritura — 10 roles tipográficos (Hero, Titular, Cuerpo, Botón…) con peso, tamaño, interlineado y tracking editables.',
              'Previsualizar interfaces — 7 maquetas donde puedes hacer clic para editar el color o el texto.',
              'Guardar y compartir — Mis proyectos, autoguardado y enlace que restaura la paleta.',
              'Exportar el sistema — CSS, design tokens, Tokens Studio, DESIGN.md, brand kit e imagen PNG.',
            ],
          },
          {
            heading: 'Flujo recomendado',
            bullets: [
              'Elige inspiración, sube una imagen o escribe un HEX.',
              'Asigna los colores principales a roles semánticos.',
              'Revisa tema claro y oscuro.',
              'Corrige problemas de contraste con los consejos del editor.',
              'Selecciona y ajusta la tipografía y sus roles.',
              'Comprueba distintas maquetas y anchos de ventana.',
              'Guarda el proyecto, exporta o comparte el enlace.',
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
              'No hay cuentas ni nube: los proyectos se guardan solo en este navegador.',
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
              'Estado vacío («Empieza por aquí»): «Explorar estilos», subir imagen (JPG/PNG/WebP, máx. 5 MB, solo local) o «Partir de un color (HEX)».',
              'Si ya guardaste proyectos, la pantalla de inicio muestra «Sigue donde lo dejaste» con los últimos tres.',
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
            heading: '4. Guardar y exportar',
            bullets: [
              'El header muestra el nombre del proyecto y su estado (Borrador, Guardando…, Guardado). Clic para abrir Mis proyectos.',
              'Menú Exportar en el header cuando existen primary, background y on-background.',
              'Si falta alguno, el botón queda desactivado y explica qué falta.',
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
        'Hay tres entradas: un estilo curado, una foto o un único color HEX. Craftie carga candidatos y tú asignas roles. Si no hay nada guardado, el estudio también te recibe con una paleta de ejemplo.',
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
            heading: 'Desde un color (HEX)',
            bullets: [
              'En «Partir de un color (HEX)» escribe un valor como #1F6F54 (hay un ejemplo con un clic).',
              'Craftie construye los colores fuente a partir de ese HEX y tú asignas los roles.',
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
              'Fondo, Superficie, Borde, Texto — blanco, grises y casi negro con apenas un rastro del tono de marca, más la escala neutra completa (neutral-0 a neutral-1000).',
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
              'Al elegir candidatos, Craftie penaliza pares que colapsan bajo deuteranopía (tooltip educativo). Para ver el lienzo completo con otra visión, usa el selector «Visión» de la toolbar.',
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
            heading: 'Consejos cuando falla',
            bullets: [
              'Si un par no llega a AA, el editor muestra «Faltan X puntos para AA», una barra de progreso y una muestra de texto real.',
              'Propone correcciones en OKLCH (aclarar u oscurecer texto o fondo) con el ratio resultante.',
              'Solo puedes aplicar la corrección del lado que estás editando; la del otro lado es una pista.',
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
            heading: 'Simulación de visión del color',
            bullets: [
              'El selector «Visión» de la toolbar del lienzo aplica protanopía, deuteranopía, tritanopía o escala de grises a toda la vista activa.',
              'Útil para detectar pares que solo se distinguen por el tono, como estados o series de datos.',
              'Vuelve a «Normal» para ver los colores reales.',
            ],
          },
          {
            heading: 'Límites',
            bullets: [
              'No audita teclado, ARIA, motion ni lectores de pantalla.',
              'La simulación de visión del color es aproximada y solo cambia la vista; no modifica la paleta ni el export.',
            ],
          },
        ],
      ),
      page(
        'typography',
        'Sobre Craftie',
        'Tipografía',
        'Parejas, escala y fuentes propias.',
        'Pestaña Tipografía en la barra lateral: parejas populares y curadas, recomendadas por mood del estilo, filtros por categoría, roles de texto editables y fuente personalizada (Google o archivo local en sesión).',
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
              'Las parejas más usadas llevan la insignia «Popular» y salen primero.',
            ],
          },
          {
            heading: 'Escala',
            bullets: [
              'Base, ratio y peso del titular (500/600/700).',
              'Vista «Escala tipográfica» en canvas, presentada como una página de muestra.',
              'Clic en un nivel para ajustar peso, interlineado y tracking solo de ese nivel.',
            ],
          },
          {
            heading: 'Roles tipográficos',
            bullets: [
              'Diez roles: Hero, Display, Titular, Título, Cuerpo, Etiqueta, Nota, Botón, Marca y Sobretítulo.',
              'Cada rol parte de un paso de la escala y de la fuente de titulares o de cuerpo.',
              'Edita peso, tamaño, interlineado y tracking desde la escala o haciendo clic en el texto de una maqueta (modo «Texto»).',
              'Por defecto el cambio aplica a todo el rol; activa «Solo este rol» para limitarlo a uno.',
              'Avisos de legibilidad si un ajuste deja el texto difícil de leer; hay botón para restablecer.',
              'Los roles se incluyen en el export (CSS, tokens, DESIGN.md, brand kit).',
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
        'Sistema, siete maquetas, ilustración y Pintar.',
        'El selector agrupa: Modo de extracción (Colores, Pintar), Sistema de diseño, Maquetas y Vistas previas. Cambia de vista para encontrar conflictos que un swatch aislado no muestra.',
        [],
        [],
        [],
        [
          {
            heading: 'Sistema',
            bullets: [
              'Guía de estilo — muestras de color + tipografía.',
              'Escala tipográfica — jerarquía aplicada.',
              'Escalas de tonos — rampas de 50 a 900 para Primario, Secundario y Acento; clic en un paso para ajustar luminosidad e intensidad, con su contraste sobre el fondo.',
              'Colores — roles, derivados y sistema completo.',
            ],
          },
          {
            heading: 'Maquetas',
            bullets: [
              'Dashboard · Landing · Reproductor · Analytics (contexto oscuro) · App móvil · Editorial · Tienda.',
              'Cada maqueta usa marco de navegador o de teléfono y contenido de ejemplo.',
            ],
          },
          {
            heading: 'Editar desde la maqueta',
            bullets: [
              'El selector «Clic edita» tiene tres modos: Bloqueado, Color y Texto.',
              'Color: clic en un elemento → popover para editar el token semántico (OKLCH + contraste, con consejos si falla).',
              'Texto: clic en un texto → popover del rol tipográfico (peso, tamaño, interlineado, tracking).',
              'Bloqueado: la maqueta solo se mira, sin abrir editores.',
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
              'Dashboard vs. Landing para densidad distinta; Editorial para lectura larga y Tienda para producto y precios.',
              'App móvil para comprobar pantallas pequeñas y botones táctiles.',
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
        'projects',
        'Sobre Craftie',
        'Proyectos y enlaces',
        'Autoguardado, Mis proyectos y enlace compartible.',
        'Tu trabajo no se pierde al recargar. Craftie autoguarda un borrador y te deja guardar varias versiones como proyectos locales, sin cuenta.',
        [],
        [],
        [],
        [
          {
            heading: 'Borrador autoguardado',
            bullets: [
              'Los cambios se guardan solos en el navegador; al volver, el estudio restaura la paleta.',
              'El header muestra «Borrador» hasta que lo guardas como proyecto.',
            ],
          },
          {
            heading: 'Mis proyectos',
            bullets: [
              'Abre el panel desde el header: guarda con nombre, renombra, duplica o elimina.',
              'Cada proyecto guarda la paleta, la tipografía y una miniatura.',
              'El estado del header cambia entre Guardando…, Guardado y «No se pudo guardar».',
              'En la pantalla de inicio aparecen los tres últimos en «Sigue donde lo dejaste».',
            ],
          },
          {
            heading: 'Enlace compartible',
            bullets: [
              'Exportar → Copiar enlace genera una URL con la paleta en el hash.',
              'Quien abre el enlace ve la misma paleta; no requiere cuenta ni servidor.',
              'Un enlace dañado o demasiado largo se ignora y se abre el estudio normal.',
            ],
          },
          {
            heading: 'Límites',
            bullets: [
              'Los proyectos son locales: no se sincronizan entre navegadores ni dispositivos.',
              'Borrar los datos del sitio elimina borrador y proyectos; exporta un brand kit si quieres un respaldo.',
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
              'Copiar enlace — URL que restaura esta paleta al abrirla.',
              'Copiar CSS — variables al portapapeles, sin descargar archivo.',
              'CSS variables — custom properties light/dark.',
              'Design tokens (JSON) — W3C / Style Dictionary.',
              'Figma (Tokens Studio) — JSON para import manual (no es plugin).',
              'Tailwind CSS v4 — bloque `@theme` con colores, fuentes y roles de texto; el oscuro se activa con `data-theme="dark"`.',
              'shadcn/ui — variables `:root` y `.dark` mapeadas desde tus roles, más el puente `@theme inline`.',
              'DESIGN.md — guía Markdown para el repo.',
              'Brand kit (.json) — paleta, roles, tipografía y DESIGN.md embebido.',
              'Imagen (.png) — tarjeta con la paleta y la tipografía activa para compartir.',
            ],
          },
          {
            heading: 'Qué incluye',
            bullets: [
              'Roles semánticos con su par `on-*`, escala neutra, series de datos y estados confirmados.',
              'Las rampas 50–900 de Primario, Secundario y Acento (`primary-500`, `accent-200`…), incluidos los pasos que hayas ajustado.',
              'Valores derivados para tema claro y oscuro, de modo que `[data-theme="dark"]` y `.dark` salen completos.',
              'Roles tipográficos (Hero, Titular, Cuerpo…) con sus ajustes en CSS, tokens, Tokens Studio, DESIGN.md y brand kit.',
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
              'Alt+R (⌥+R en Mac) — probar otra paleta; respeta los roles bloqueados.',
              'Esc — cerrar menús o vistas ampliadas.',
            ],
          },
          {
            heading: 'Reset',
            paragraphs: [
              'Clic en el logo Craftie con progreso activo → diálogo de confirmación para empezar de nuevo. Se descarta el borrador actual; los proyectos ya guardados en Mis proyectos se conservan.',
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
              'localStorage: borrador autoguardado de la paleta, layout del panel, pareja tipográfica y ajustes de la sesión de trabajo.',
              'IndexedDB: proyectos de Mis proyectos (paleta, tipografía y miniatura).',
              'sessionStorage: fuentes custom de la sesión.',
              'No se guarda: la imagen original ni los archivos de fuente locales.',
              'Todo permanece en tu navegador; limpiar los datos del sitio lo borra.',
            ],
          },
          {
            heading: 'Preguntas frecuentes',
            bullets: [
              '¿Estudio vs. docs? `/` trabaja · `/docs` documenta.',
              '¿Puedo partir de un solo color? Sí: «Partir de un color (HEX)» en la pantalla de inicio.',
              '¿Cómo comparto una paleta? Exportar → Copiar enlace.',
              '¿Puedo instalarlo o usarlo sin conexión? Sí: el navegador ofrece instalarlo y, tras la primera visita, el estudio y las herramientas abren sin red (solo en la versión publicada).',
              '¿Hay herramientas sueltas? Sí: `/tools/contrast-checker` (verificador de contraste), `/tools/palette-from-image` (paleta desde una imagen) y `/palettes` (galería de paletas que se abren en el estudio).',
              '¿Hay interfaz en inglés? Sí: el botón ES/EN del header (o del menú móvil) cambia el idioma y se recuerda en este navegador. Cubre todo el estudio; esta documentación y las páginas de herramientas siguen en español por ahora.',
              '¿Mi trabajo se pierde al cerrar la pestaña? No: se autoguarda como borrador; guárdalo como proyecto para tener varias versiones.',
              '¿Export bloqueado? Falta primary, background u on-background.',
              '¿Escalas 50–900 en UI? Sí: vista «Escalas de tonos» en el selector del lienzo. Los ajustes se exportan como primary-500, accent-200…',
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
