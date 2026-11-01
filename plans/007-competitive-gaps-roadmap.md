# Plan 007: Cerrar brechas frente a generadores de paletas

- Fecha: 2026-10-31.
- Estado: IMPLEMENTADO el 2026-10-31 (ver «Resultado» al final). Pendientes y límites anotados abajo.
- Contexto: Craftie es gratis, sin cuenta y sin objetivo comercial. No compite con Coolors en volumen de paletas ni comunidad; compite como estudio de sistema de diseño (roles semánticos, maquetas, roles tipográficos, `DESIGN.md`).
- Regla: una tarea por PR. Lógica en `/lib` (agnóstica de framework), adaptadores de navegador en `src/lib/browser`, componentes < 250 líneas.
- Relación con otros planes: complementa el 006. Proyectos locales, autoguardado y enlace compartible ya existen; no se repiten aquí.

## Hechos comprobados al redactar

- Existe lógica de visión del color en `lib/color/colorVision.ts`, pero la UI no ofrece simulación global.
- Los exports actuales son CSS, W3C tokens, Tokens Studio, `DESIGN.md`, brand kit, PNG y enlace (`lib/export/`, `src/components/layout/ExportMenu.tsx`).
- El export puede derivar escalas 50–900, pero no hay editor de rampa.
- La interfaz está solo en español.
- No se ejecutaron pruebas ni revisión en navegador para escribir este plan.

## Fases

| ID | Entrega | Prioridad | Esfuerzo | Depende de |
|---|---|---|---|---|
| 1 | Simulación de daltonismo en el lienzo | P1 | M | — |
| 2 | Export a Tailwind y shadcn/ui | P1 | M | — |
| 3 | Escalas de tonos 50–900 editables | P2 | L | — |
| 4 | Exploración rápida de paletas completas | P2 | M | — |
| 5 | Galería de paletas curadas | P2 | M | 4 |
| 6 | Internacionalización (ES/EN) | P1 | L | — |
| 7 | Páginas de herramienta con SEO | P2 | M | 6 |
| 8 | PWA instalable y modo sin conexión | P3 | S | — |
| 9 | Auditoría de accesibilidad y rendimiento de la propia app | P1 | M | — |

Orden sugerido: 1, 2, 9, 6, 7, 4, 5, 3, 8.

## 1. Simulación de daltonismo

- Qué: selector en la toolbar del lienzo para ver maquetas y paleta en protanopía, deuteranopía, tritanopía y escala de grises.
- Dónde: lógica en `lib/color/colorVision.ts`; el filtro se aplica solo a la vista, nunca a los datos ni al export.
- Aceptación:
  - Cambiar de modo no altera la paleta ni el historial.
  - Hay opción visible para volver a «Normal».
  - Tests unitarios con valores de referencia de las matrices usadas.
  - Docs actualizadas (`/docs/contrast`, `/docs/faq`: quitar «sin simulación global»).
- Riesgo: la simulación es aproximada; indicarlo en la UI.

## 2. Export a Tailwind y shadcn/ui

- Qué: dos entradas nuevas en Exportar: tema Tailwind (v4 `@theme` en CSS) y variables shadcn/ui (`--background`, `--primary`, `--foreground`, etc.) con claro y oscuro.
- Dónde: serializadores nuevos en `lib/export/`, conectados en `useWorkspaceExports.ts` y `ExportMenu.tsx`.
- Aceptación:
  - Mapa explícito rol Craftie → variable shadcn documentado y con tests.
  - El archivo de ejemplo funciona en una app de prueba (verificación manual descrita en el PR).
  - Incluye roles tipográficos cuando existan.
- Pregunta abierta: ¿solo Tailwind v4 o también el formato `tailwind.config` de v3?

## 3. Escalas 50–900 editables

- Qué: vista para editar la rampa de un rol (11 pasos) con ajuste de luminosidad y croma, y contraste por paso.
- Dónde: extender `lib/color/tonalScale.ts`; nueva vista de canvas, sin crear otro editor paralelo.
- Aceptación: la rampa editada se refleja en el export; deshacer/rehacer la cubre; tests de monotonía de luminosidad.

## 4. Exploración rápida de paletas

- Qué: acción «Otra paleta» (con atajo) que genera una paleta completa respetando los roles bloqueados.
- Aceptación: respeta bloqueos por tema; entra en el historial; no sustituye la lógica de intenciones del plan 004 (reconciliar antes).
- Riesgo: calidad de resultados; validar con pruebas de contraste mínimas.

## 5. Galería de paletas curadas

- Qué: página o modal con paletas originales de Craftie, filtrables por mood, que se abren en el estudio.
- Restricción: contenido propio, sin copiar paletas de terceros (regla de `AGENTS.md`).
- Aceptación: datos en `/lib`, cada paleta pasa un test de contraste de roles base.

## 6. Internacionalización ES/EN

- Qué: capa de textos con selector de idioma; empezar por estudio, luego `/docs`.
- Pregunta abierta: ¿rutas por idioma (`/en`) o preferencia en el navegador? Afecta SEO de la fase 7.
- Aceptación: no quedan textos fijos en componentes migrados; `lang` correcto en `<html>`.

## 7. Páginas de herramienta con SEO

- Qué: páginas indexables como «Verificador de contraste» y «Paleta desde imagen» que reutilizan componentes existentes.
- Aceptación: metadatos propios, sitemap, contenido útil sin necesidad de abrir el estudio completo.

## 8. PWA

- Qué: manifest ya existe; añadir service worker para uso sin conexión de las herramientas locales.
- Aceptación: instalable; el estudio abre sin red con los datos locales.

## 9. Calidad de la propia app

- Qué: auditoría con Lighthouse y revisión con teclado y lector de pantalla de los flujos principales; corregir hallazgos críticos.
- Aceptación: sin errores de contraste ni trampas de foco en inicio, panel de colores, exportar y Mis proyectos; presupuesto de rendimiento anotado.
- Nota: la validación completa de accesibilidad requiere pruebas manuales con tecnologías de apoyo.

## Fuera de alcance (decisión)

Cuentas, comunidad, paletas en tendencia, plugins de Figma, extensión de navegador y apps móviles nativas. Requieren backend, moderación o mantenimiento continuo que no encajan con un proyecto gratuito sin ingresos.

## Cómo medir si funciona

Sin analítica invasiva. Opciones a decidir: contador agregado y anónimo de exportaciones por formato, o solo feedback voluntario (issue templates ya existen).

## Resultado (2026-10-31)

| Fase | Estado | Notas |
|---|---|---|
| 1 Daltonismo | Hecho | Selector «Visión» en la toolbar del lienzo: protanopía, deuteranopía, tritanopía y grises. Solo cambia la vista. |
| 2 Tailwind / shadcn | Hecho | Decisión: solo Tailwind v4 (`@theme`). El export ahora deriva tokens de ambos temas (`on-*`, estados, dark completo), que antes faltaban. |
| 9 Calidad | Hecho | Auditoría axe en Playwright (inicio, docs, herramientas, oscuro, menú, escalas). Corregidos contraste en tonos medios, el botón primario en oscuro y el rol ARIA del menú. Componentes < 250 líneas de nuevo. Sin medir rendimiento (Lighthouse) ni prueba manual con lector de pantalla. |
| 6 i18n | Hecho (estudio) | Decisión: preferencia en el navegador (sin rutas `/en`). Todo el estudio está traducido: ~800 textos de interfaz (`t()`) y ~600 textos de datos como parejas tipográficas, estilos y maquetas (`tx()`). Siguen en español /docs y las páginas de herramientas. Los textos de ambos idiomas van en el bundle (~55 KB gzip); se podrían cargar bajo demanda. |
| 7 Herramientas SEO | Hecho | `/tools/contrast-checker`, `/tools/palette-from-image`, sitemap y robots. Solo en español. Requiere `NEXT_PUBLIC_SITE_URL` en producción. |
| 4 Otra paleta | Hecho | El botón ya existía; se añadió Alt+R (⌥+R en Mac). |
| 5 Galería | Hecho | `/palettes` con las 20 paletas existentes, filtros y `/?style=<id>`. No se añadieron paletas nuevas. |
| 3 Escalas 50–900 | Hecho | Vista «Escalas de tonos» editable; la rampa completa se exporta. |
| 8 PWA | Hecho | Service worker (solo producción), iconos PNG y manifest. Verificado offline contra un build de producción. |

Pendiente de decisión: traducir /docs y las herramientas; rutas por idioma si se prioriza el SEO en inglés.
