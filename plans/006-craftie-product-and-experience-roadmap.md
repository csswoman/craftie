# Plan 006: Craftie como estudio de identidades visuales

- Fecha: 2026-10-06.
- Base revisada: commit `987f1bc`.
- Estado: PROPUESTA PARA EVALUAR. Este documento no autoriza implementar las fases.
- Tipo: dirección de producto, funcionalidades, interfaz y validación.
- Público inicial: developers, diseñadores y creadores que necesitan decidir y aplicar una identidad visual a una web o marca.
- Objetivo: explorar propuestas, editarlas en contexto, compararlas, comprobar sus problemas y llevarlas a código reutilizable.

## 1. Resultado que buscamos

Craftie debe permitir completar este recorrido:

**Crear un proyecto → elegir inspiración → editar sobre una composición → guardar alternativas → compararlas → revisar problemas → exportar y aplicar.**

Ejemplo de aceptación del producto: una persona prepara la identidad de una cafetería, conserva su color principal, crea dos direcciones tipográficas, las compara sobre los mismos textos, corrige un contraste, cierra el navegador y recupera su proyecto. Después aplica los tokens exportados en una pequeña web de ejemplo.

Se preserva la identidad visual actual: marco neutro, paletas protagonistas, Lora y Nunito en la interfaz, jerarquía clara y controles discretos. La mejora de interfaz se concentra en composición, selección y feedback contextual. Cualquier sustitución de la identidad visual requerirá una decisión específica.

## 2. Base existente y límites de esta revisión

Estos hechos se comprobaron leyendo el repositorio; no se ejecutaron pruebas ni una revisión visual en navegador para redactar el plan.

| Capacidad actual | Evidencia | Consecuencia para el plan |
|---|---|---|
| Inicio desde estilos o imagen | `src/components/color/EmptyWorkspaceCard.tsx` | Ampliar entradas para trabajar desde un objetivo o un color existente. |
| Workspace con herramientas, lienzo y adaptación móvil | `src/components/color/SelectColorsWorkspace.tsx`, `src/components/layout/StudioCanvas.tsx` | Reutilizar el shell y adaptar la jerarquía; evitar crear otro editor paralelo. |
| Vistas de colores, escala, guía, landing, dashboard, player, analytics e ilustración | `lib/color/canvasViews.ts` | Reutilizar composiciones existentes y distinguir objetivo del proyecto de vista activa. |
| Selección de roles mediante doble clic y de slots mediante clic | `src/components/color/preview/PreviewRoleTarget.tsx`, `PreviewSlotTarget.tsx` | Unificar selección accesible y añadir selección tipográfica; parte de la edición contextual ya existe. |
| Estado repartido entre contexto y controller | `src/context/RolePaletteContext.tsx`, `src/components/color/useSelectColorsWorkspaceController.ts` | Definir un snapshot explícito antes de persistir o duplicar proyectos. |
| Tipografía aplicada distinta del preview temporal | `lib/typography/typeState.ts` | Guardar lo aplicado; excluir hover y estados transitorios. |
| Correcciones de contraste por luminosidad | `lib/color/contrast.ts`, `src/components/color-engine/ContrastSuggestionPanel.tsx` | Extender la revisión y explicación; no reconstruir el cálculo existente. |
| Temas, bloqueos y overrides | `src/context/RolePaletteContext.tsx`, `lib/color/themePalette.ts` | Conservarlos al restaurar, comparar y generar propuestas. |
| Exportación de CSS, JSON, Tokens Studio, DESIGN.md y brand kit | `src/components/color/useWorkspaceExports.ts`, `lib/export/` | Completar fidelidad y demostrar consumo real de los archivos. |
| Brand kit v1 con paleta, roles y familias tipográficas | `lib/export/brandKit.ts` | No asumir que es un archivo de proyecto completo. |
| Persistencia parcial de preferencias y fuentes | `src/lib/browser/selectedFontPair.ts`, `customFonts.ts`, `useStudioPanelLayout.ts` | Separar preferencias globales de datos del proyecto. |
| Tests unitarios y CI con verify, build y audit | `package.json`, `.github/workflows/verify.yml` | Añadir pruebas de recorridos reales y accesibilidad; mantener los controles existentes. |

Excerpts para comprobar drift antes de ejecutar una fase:

```ts
// lib/export/brandKit.ts
export type BrandKitPayload = {
  version: 1;
  name: string;
  exportedAt: string;
  palette: GeneratedPalette;
  rolePalette: RolePalette;
  typography: {
    heading: { family: string; classification: string };
    body: { family: string; classification: string };
  } | null;
  designMd: string;
};

// lib/typography/typeState.ts
export type TypeUiState = {
  applied: AppliedTypography;
  hovered: AppliedTypography | null;
  pinHeading: boolean;
  pinBody: boolean;
  base: TypeScaleBase;
  ratio: TypeScaleRatio;
  customFonts: CustomFont[];
};
```

## 3. Prioridades y entregas

Cada entrega debe convertirse en una tarea/PR independiente cuando sea seleccionada. Esfuerzos orientativos para implementación y validación, sin estimaciones de calendario: M = acotado; L = varios módulos y recorridos; XL = separar en varias entregas.

| ID | Entrega | Prioridad | Esfuerzo | Riesgo | Dependencia |
|---|---|---|---|---|---|
| A | Proyectos guardados, autoguardado y reapertura | P1 | XL | Alto: restauración y pérdida de datos | Ninguna |
| B | Alternativas guardadas y comparación | P1 | L | Medio: aislamiento del estado | A |
| C | Inicio según objetivo y navegación clara | P1 | M | Medio: cambios de flujo | A para continuar proyectos; resto independiente |
| D | Lienzo editable e inspector contextual | P1 | XL | Medio: selección e interacción | Contrato de selección; A para persistir contenido |
| E | Exploración con intención | P2 | L | Alto: calidad de resultados y bloqueos | B; reconciliar planes 001–004 |
| F | Revisión de accesibilidad y corrección explicada | P1 | L | Alto: alcance y veracidad del diagnóstico | Selección de D; snapshot de A |
| G | Exportación fiel y aplicación consumidora | P2 | L | Medio: compatibilidad | A; contenido y tipografía de D |
| H | Pruebas de navegador, accesibilidad y uso real | P1 transversal | L | Medio: infraestructura y fixtures | Se incorpora a cada entrega |
| I | Caso de estudio y demo del producto | P3 | M | Bajo | Primera experiencia completa validada |

Orden recomendado para construir: **A → B → C → D → F → E → G → I**, con H desde A. Para evaluar diseño puede prototiparse C/D antes, sin reemplazar todavía el workspace.

Primera versión útil: A + B, usando previews actuales. Segunda: C + D + F. Tercera: E + G. No es necesario aprobar todo el roadmap de una vez.

## 4. A — Proyectos guardados, autoguardado y reapertura

### Funcionalidad

- Crear, nombrar, renombrar, abrir, duplicar y eliminar proyectos locales.
- Autoguardar cambios confirmados y mostrar estados reales: guardando, guardado y error.
- Mostrar proyectos recientes con nombre, fecha y una miniatura o resumen de la identidad.
- Descargar e importar un archivo de proyecto versionado para respaldo y traslado manual.
- Proteger cambios pendientes al abrir otro proyecto o volver al inicio.

### Contrato y arquitectura propuesta

- Crear `lib/projects/` para tipos, validación, migraciones y construcción de snapshots, sin React ni APIs de navegador.
- Crear adaptadores en `src/lib/browser/` para almacenamiento local. IndexedDB es la opción propuesta para snapshots y blobs; definir política de límites antes de implementarla.
- Guardar identidad, objetivo, contenido personalizado, fuente de inspiración, semillas, roles, overrides por tema, bloqueos, ajustes de generación, tipografía aplicada, escala, tamaños y espaciado. Guardar solo valores canónicos y volver a derivar previews/ratios.
- No persistir URLs de objeto, nodos DOM, hover, promesas, loaders ni selecciones tipográficas temporales.
- Decidir qué imagen y fuentes locales se conservan como blobs. Si falta un recurso, conservar sus referencias y mostrar una solicitud de recuperación; no sustituirlo silenciosamente.
- El archivo de proyecto es distinto del brand kit v1. Definir extensión, versión y compatibilidad antes de implementar importación. La importación de un brand kit antiguo solo puede recuperar los campos presentes y debe explicar sus límites.
- Restaurar en una operación coherente: no montar primero una mezcla de defaults y datos parciales que después se autoguarde.

### División sugerida

1. Esquema, round-trip y validación/migraciones.
2. Guardado/restauración de un proyecto con feedback y recuperación de errores.
3. Biblioteca local y duplicación/eliminación.
4. Archivo portátil e importación, con validación previa a reemplazar el estado.

### Aceptación

- Cerrar y abrir recupera ambos temas, bloqueos y ajustes tipográficos confirmados.
- Un cambio rápido seguido de cierre no se anuncia como guardado antes de persistirse; las limitaciones reales se explican.
- Un archivo inválido o de versión futura no modifica el proyecto abierto.
- Un error de cuota/almacenamiento conserva el estado editable y ofrece descargar respaldo.
- Dos proyectos y sus blobs no se mezclan. Duplicar crea identidad independiente.
- Conflictos entre pestañas no sobrescriben silenciosamente una versión más reciente.
- Eliminar requiere una acción explícita con el nombre del proyecto y alcance visible.

## 5. B — Alternativas y comparación

### Funcionalidad e interfaz

- Guardar una propuesta con nombre: por ejemplo, Editorial o Expresiva.
- Duplicar la propuesta activa y editarla sin alterar la original.
- Comparar dos propuestas sobre la misma composición, contenido, tamaño y tema.
- Mostrar cambios en colores, tipografía y contrastes, sin inventar un ranking de calidad estética.
- Elegir una propuesta para seguir trabajando; conservar las demás.
- En móvil, alternar A/B manteniendo encuadre; en escritorio, lado a lado.

### Implementación propuesta

Tipos y comparación pura en `lib/projects/`; UI nueva en `src/components/projects/` y conexión con `PaletteCanvas.tsx`. Una alternativa es un snapshot confirmado dentro de un proyecto, diferente del historial de deshacer/rehacer. Definir alcance del undo al cambiar de propuesta; recomendación inicial: historial por sesión de edición, sin prometer restaurar undo tras cerrar.

### Aceptación

- Editar B no cambia A, ni sus bloqueos ni recursos.
- Cambiar vista o tema de comparación no modifica las propuestas guardadas.
- A y B tienen identificación legible, sin depender solo de color.
- El usuario distingue entre guardar propuesta, duplicar, seleccionar y deshacer.

## 6. C — Inicio por objetivo y navegación

### Funcionalidad

- Entradas: Crear identidad para una web, Crear una marca, Empezar desde un color y Continuar un proyecto.
- Estilo e imagen siguen siendo fuentes de inspiración disponibles en el recorrido.
- Web abre una composición existente adecuada; marca abre una pieza de identidad existente. Empezar desde HEX funciona sin obligar a inventar una imagen o un estilo.
- Objetivo del proyecto y vista del lienzo son datos distintos. Cambiar de vista no borra el trabajo ni reclasifica el proyecto.

### Interfaz

- Modificar `EmptyWorkspaceCard.tsx` y el estado inicial de `SelectColorsWorkspace.tsx`.
- Incorporar nombre del proyecto y estado de guardado en `WorkspaceHeader.tsx`.
- Mantener acceso libre a colores, tipografía, revisión y exportación. La guía orienta sin forzar una secuencia rígida.
- Mostrar el siguiente paso útil cerca de la acción correspondiente. Actualizar `StudioFlowGuide.tsx` y `lib/studio/studioFlow.ts` solo donde el flujo seleccionado lo requiera.
- Conservar una explicación breve de qué se obtiene y un ejemplo utilizable; evitar una introducción larga antes del editor.

### Aceptación

- Cada entrada tiene un resultado visible y permite llegar al editor.
- Una persona puede comenzar con un HEX y ver una composición aplicada.
- Continuar recupera un proyecto, no únicamente preferencias de interfaz.
- Volver al inicio no descarta cambios sin tratamiento de guardado.

## 7. D — Lienzo editable, contenido propio e inspector

### Funcionalidad

- Seleccionar un título abre ajustes de su rol tipográfico; seleccionar un botón o superficie abre sus tokens de color y contraste.
- Editar nombre de marca, título, descripción y CTA de una composición inicial. Usar textos propios; no añadir un editor libre de HTML.
- Definir un contrato de selección en `lib/studio/` para token, rol tipográfico y campo de contenido. Los elementos DOM siguen en adaptadores/UI.
- Reutilizar y unificar `PreviewRoleTarget.tsx` y `PreviewSlotTarget.tsx`; añadir interacción por teclado y táctil.
- Distinguir seleccionar para editar de activar un componente de demostración. Evitar botones anidados o interacciones que cambien el proyecto por accidente.

### Composición de interfaz

- Izquierda: inspiración y alternativas. Centro: composición aplicada. Derecha: inspector contextual.
- Evaluar esta distribución sobre `StudioCanvas.tsx`, `StudioCanvasToolsSidebar.tsx`, `InspectorPanel.tsx` y `PaletteCanvas.tsx`; medir espacio útil antes de adoptarla en todas las vistas.
- Mantener plegado y redimensionado donde ya existan; mostrar controles avanzados de forma progresiva.
- En móvil, inspector en panel inferior accesible, con cierre, foco restaurado y preview visible cuando el teclado lo permita.
- Dar feedback al seleccionar, previsualizar, aplicar y deshacer. La animación debe respetar movimiento reducido.

### Aceptación

- El elemento seleccionado y el inspector siempre muestran el mismo objetivo.
- Una edición tipográfica afecta solo al rol previsto.
- Cancelar un preview no altera el snapshot confirmado; aplicar se incorpora al historial correspondiente.
- Los textos personalizados se conservan al guardar, duplicar y comparar.
- Teclado y toque pueden realizar las acciones principales sin doble clic obligatorio.
- Textos largos, 200% de zoom y tamaños móviles no ocultan acciones esenciales.

## 8. E — Exploración con intención

### Funcionalidad

- Comenzar con tres acciones delimitadas: Más sobria, Más cálida y Más contraste.
- Mostrar una propuesta temporal, cambios afectados y acciones Aplicar/Cancelar o Guardar como alternativa.
- Respetar roles y fuentes bloqueados; explicar cuando las restricciones impidan obtener una propuesta.
- Separar extracción fiel a la imagen de transformación de un sistema UI. No presentar colores derivados como píxeles extraídos.

### Reconciliación obligatoria

El plan `004-replace-regeneration-with-palette-intents.md` ya propone intenciones para extracción y depende de 001–003. Su índice sigue marcándolos TODO, pero este documento no verificó su estado real. Antes de ejecutar E, comprobar cambios desde `0fa2409`, leer los cinco planes existentes y actualizar su estado solo con evidencia. Reutilizar contratos implementados; no construir un segundo selector con significados incompatibles.

Políticas puras en `lib/color/`, controles en `PaletteImageBlock.tsx`/sidebar y coordinación en el controller. Definir rangos, objetivos y criterio de conservación de identidad antes de codificar. Una propuesta es determinista para la misma entrada, intención y configuración.

### Aceptación

- Aplicar puede deshacerse y cancelar deja el proyecto intacto.
- Ningún rol bloqueado cambia.
- Mismos datos y misma intención producen los mismos resultados.
- Más contraste indica qué pares mejoró y cuáles siguen fallando; no asegura conformidad global.
- Los resultados se revisan con un corpus propio de paletas cálidas, frías, neutras, saturadas y extremas.

## 9. F — Revisión accionable y corrección explicada

### Funcionalidad

- Listar problemas por elemento/token, tema y uso: texto, superficie o control evaluado.
- Al elegir un problema, enfocar su elemento y abrir el inspector correspondiente.
- Mostrar ratio y condición antes/después, tokens que cambiarían y efectos sobre otros pares conocidos.
- Respetar bloqueos y permitir corrección individual. Un cambio de varios tokens debe previsualizarse y aplicarse como operación única.
- Añadir comparación claro/oscuro sin confundir tema de la interfaz con tema del proyecto.
- Extender `suggestAccessibleForeground` y la evaluación de pares existentes; mantener APCA como lectura complementaria identificada.

### Alcance honesto

Definir un registro explícito de pares presentes en las composiciones soportadas y sus condiciones. Tamaño/peso real afectan clasificación de texto; tokens aislados no prueban conformidad de una aplicación completa. Identificar casos pendientes/no evaluables. Distinguir simulaciones de visión del color, ya presentes en el motor, de criterios WCAG verificables.

### Aceptación

- Cada problema tiene un destino visible o explica por qué solo existe como par de tokens.
- La corrección recalcula los pares afectados en ambos temas y muestra regresiones antes de confirmar.
- Roles bloqueados no se modifican; falta de solución es un estado explicado.
- Deshacer recupera todos los tokens de una corrección.
- Cambiar contenido, tamaños o colores invalida resultados obsoletos.
- La lista vacía comunica el alcance comprobado; no etiqueta toda la marca o web como accesible.

## 10. G — Exportación fiel y aplicación real

### Funcionalidad

- Conservar CSS, JSON de tokens, Tokens Studio, DESIGN.md y brand kit.
- Revisar la fidelidad entre tipografía aplicada y exportada: familias, pesos, escala, tamaños y espaciado. Hoy `useWorkspaceExports.ts` recibe `selectedPairing`; comprobar fuentes custom y ajustes antes de ampliar contratos.
- Verificar formato contra la especificación DTCG seleccionada para la entrega; declarar versión y límites de cada formato. No inferir compatibilidad solo por la etiqueta W3C / Style Dictionary.
- Diferenciar Guardar proyecto, Descargar respaldo y Exportar para desarrollo.
- Crear una aplicación consumidora pequeña y aislada, por ejemplo bajo `examples/token-consumer/`, con botones, formulario, navegación, estados y ambos temas.
- Usar el archivo realmente exportado. La aplicación consumidora no puede depender del contexto o de helpers internos del editor para que la demostración tenga valor.

### Aceptación

- Cambiar Craftie, exportar y cargar esos tokens cambia la aplicación de ejemplo.
- Los valores de ambos temas y la tipografía soportada coinciden con el estado confirmado.
- Cada export identifica campos omitidos o recursos tipográficos que requieren suministro/licencia del usuario.
- La guía explica cómo usar los archivos y qué se debe validar en la aplicación destino.
- Tests de serialización y validación detectan un token inválido o una incompatibilidad de formato.

Referencias a consultar al ejecutar: especificación DTCG 2025.10, https://www.w3.org/community/reports/design-tokens/CG-FINAL-format-20251028/ ; contraste WCAG 2.2, https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html . Verificar vigencia y alcance al comenzar la entrega.

## 11. H — Pruebas, accesibilidad y uso real

- Mantener tests puros para snapshots, validación, comparación, intenciones, correcciones y exportación. Seguir los patrones de `lib/typography/typeState.test.ts`, `lib/color/contrast.test.ts` y `lib/export/exportTokenSet.test.ts`.
- Añadir pruebas de navegador del recorrido crear → editar → deshacer → guardar → recargar → comparar → exportar/importar. Playwright es la herramienta propuesta; definir instalación, script y ejecución CI en una tarea propia.
- Usar fixtures locales y recursos tipográficos controlados en tests; separar los checks de red externa de las pruebas deterministas.
- Probar errores de almacenamiento, importación inválida, recursos ausentes y conflictos entre pestañas.
- Añadir checks automáticos de accesibilidad junto con revisión manual de teclado, foco, zoom, lector de pantalla y movimiento reducido. Un scanner automático no sustituye estas pruebas.
- Verificar escritorio y móvil en una ronda conjunta, corregir y confirmar en una segunda ronda acotada. Evitar iteraciones de pulido sin criterio de salida.
- Observar entre tres y cinco personas realizando una tarea concreta. Registrar bloqueos, errores y tiempo hasta primera propuesta utilizable; tratar la muestra como evidencia cualitativa.
- No añadir analytics remotos por defecto. Las pruebas de uso pueden registrarse manualmente y requieren participación acordada.

Aceptación: CI ejecuta los controles existentes y los nuevos recorridos críticos; el informe distingue pruebas automatizadas, revisión manual y uso observado. Una entrega solo declara validados los entornos y estados realmente comprobados.

## 12. I — Caso de estudio y demo

- Mostrar problema inicial, usuario previsto, flujo y decisiones de UX.
- Documentar por qué OKLCH, cómo se divide lógica/adaptadores/UI y cómo se evita mezclar previews con datos confirmados.
- Preparar demo de 60–90 segundos: crear dos propuestas, compararlas, corregir un problema, reabrir y aplicar tokens.
- Incluir resultados observados y límites reales, con capturas del producto construido. Evitar métricas inventadas.
- Mantener README, documentación de producto y guía de exportación coherentes con la versión publicada.

Aceptación: otra persona puede entender el producto y reproducir la demo con los pasos documentados. No requiere que el developer explique operaciones ocultas.

## 13. Contratos comunes, verificación y mantenimiento

### Reglas obligatorias

- Componentes de menos de 250 líneas; una responsabilidad por módulo.
- Lógica pura en `/lib`, imports `@lib/*`. Browser APIs en `/src/lib/browser`, imports `@/lib/browser/*`.
- No copiar contenido, tablas o datasets de terceros. Usar contenido propio y fixtures originales.
- Una tarea por PR; preservar WIP ajeno. Rama sugerida por entrega: `codex/craftie-<entrega>`.
- No incluir instalaciones, merges, commits, pushes o deploys como efecto de evaluar este documento.
- Mantener compatibilidad de exports actuales o declarar y probar una migración explícita.

### Comandos disponibles

| Verificación | Comando | Resultado esperado |
|---|---|---|
| Tipos | `pnpm typecheck` | Exit 0 |
| Lint | `pnpm lint` | Exit 0 |
| Tamaño de componentes | `pnpm check:component-size` | Exit 0 |
| Unit tests | `pnpm test` | Exit 0, tests pertinentes pasan |
| Conjunto actual | `pnpm verify` | Exit 0 |
| Build | `pnpm build` | Exit 0 |
| Diff | `git diff --check` | Exit 0 |

Comandos leídos en `package.json`, no ejecutados durante la planificación. El script E2E todavía no existe: definirlo y documentarlo en H. No considerar una prueba manual ejecutada por haberla descrito.

### Protocolo para ejecutar una entrega seleccionada

1. Revisar `git status --short` y `git diff --stat 987f1bc..HEAD -- lib src package.json .github`; contrastar estado actual con este documento.
2. Crear su plan de implementación separado, con archivos exactos, contrato de datos/selección, tests y criterios de salida. Acotar las entregas XL en PRs menores.
3. Definir los estados vacíos, carga, error, éxito, recursos faltantes y cancelación antes de diseñar la UI.
4. Implementar dominio y pruebas significativas; verificar tipos y tests pertinentes antes de integrar UI.
5. Integrar recorrido, ejecutar lint/tamaño/tipos/tests y probar en navegador los estados afectados.
6. Completar verify/build y registrar evidencia, límites y decisiones. Actualizar el estado del plan solo tras comprobar sus criterios.

### Detener y resolver antes de seguir

- El snapshot no representa algún ajuste visible: no declarar restauración completa ni ocultar la pérdida.
- Se necesita cambiar un cálculo de contraste para obtener un resultado deseado: comprobar el criterio, no cambiar umbrales del estándar.
- Persistir recursos locales necesita una política de tamaño/licencia/portabilidad no definida: resolverla antes de prometer almacenamiento completo.
- Un objetivo exige otro editor, backend, cuentas o integración externa: separar alcance y presentarlo para evaluación.
- Los planes de extracción existentes contradicen el estado real: reconciliar antes de ejecutar E.
- La UI nueva obliga a eliminar una capacidad existente: documentar el caso y decidirlo antes de sustituirla.

Mantenimiento: nuevos campos confirmados deben incorporarse a snapshots, migraciones y duplicación; nuevos elementos de preview deben registrar objetivos seleccionables y pares evaluables; nuevas intenciones deben respetar bloqueos y tener pruebas deterministas; nuevos formatos requieren fixtures consumidores y límites documentados.

## 14. Opciones posteriores y decisiones pendientes

Estas opciones se incluyen porque también se mencionaron en la conversación, pero no son requisito de la primera versión:

- Sincronización entre dispositivos: fase posterior a persistencia local estable. Si se elige Supabase, definir auth, RLS, conflictos, recursos y funcionamiento sin conexión en un plan independiente.
- Uso sin conexión: el motor y guardado pueden operar localmente, pero no prometer reapertura offline ni Google Fonts disponibles sin validar caché/carga y definir un alcance específico.
- Importación de brand kit v1: recuperación parcial opcional, con listado explícito de datos no presentes. El formato de proyecto nuevo debe cubrir round-trip completo.
- Corrección conjunta de múltiples problemas: posterior a correcciones individuales verificables, con detección de regresiones y explicación de conflictos.
- Ampliar composiciones y piezas de marca: después de validar una composición editable; evitar multiplicar templates antes de probar el flujo.
- Actualizar contexto de diseño: tarea independiente para reconciliar `PRODUCT.md`, `DESIGN.md` y su sidecar con las herramientas actuales. No cambiar identidad por una migración documental.

Decisiones a evaluar al seleccionar una entrega:

1. ¿La primera experiencia prioriza developers creando una web o creadores diseñando una marca? Recomendación: web para la primera entrega, manteniendo marca como objetivo disponible.
2. ¿Qué composición será editable primero? Recomendación: landing existente, con nombre, título, descripción y CTA.
3. ¿Qué recursos persisten y viajan en el respaldo? Recomendación: imagen local dentro de límites definidos; fuentes locales solo bajo política explícita y feedback de recursos ausentes.
4. ¿La primera entrega incluye comparación o solo reapertura? Recomendación: entregar A por partes y cerrar el primer incremento de producto con B.
5. ¿Se mantiene la distribución de tres zonas? Recomendación: validarla en prototipo de escritorio/móvil antes de reorganizar todas las vistas.

## 15. Hoja de evaluación

Marcar cada bloque como Aprobar, Ajustar, Posponer o Descartar y añadir el motivo. Esta selección determina los planes ejecutables siguientes.

| Bloque | Decisión | Ajuste o motivo |
|---|---|---|
| A — Proyectos y reapertura | Pendiente | |
| B — Alternativas y comparación | Pendiente | |
| C — Inicio por objetivo | Pendiente | |
| D — Lienzo e inspector | Pendiente | |
| E — Exploración por intención | Pendiente | |
| F — Revisión y correcciones | Pendiente | |
| G — Exportación y ejemplo consumidor | Pendiente | |
| H — Validación técnica y con usuarios | Pendiente | |
| I — Caso de estudio y demo | Pendiente | |
| Sincronización / offline / ampliaciones | Pendiente | |

El resultado de evaluar el documento será un alcance seleccionado y una secuencia de tareas; todas las fases permanecen sin implementar.
