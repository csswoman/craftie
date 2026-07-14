# Rediseño de los previews de layout (ActiveLayoutPreview)

**Fecha:** 2026-07-13
**Estado:** Aprobado en diseño, pendiente revisión de spec

## Contexto

`ActiveLayoutPreview` (`src/components/color/PreviewView.tsx`) renderiza 4 mockups de UI
—Dashboard, Landing, Media, Analytics— que aplican la paleta generada por el usuario a
interfaces realistas. Sirven para **juzgar la paleta** en contextos de producto reales.

Cada elemento visual se envuelve en `PreviewSlotTarget` con un `slot`; al hacer clic se
abre el editor del token de color correspondiente. Esa mecánica clic-para-editar es central.

### Problema

- El color casi no aparece: chrome neutro, paleta relegada a puntitos y barras pequeñas.
  Slots `success/warning/error/accent/data5/data6` casi sin usar. Sin tintes suaves.
- Falta mobiliario de producto: no hay íconos reales (solo letras/glifos), avatares, ni
  gráficas más allá de barras (nada de área/línea, donut, sparklines).
- Las "interacciones" son solo `hover:-translate-y`. Nada entra, pulsa ni se togglea.
- `DashboardLayoutPreview.tsx` (342 líneas) y `LandingLayoutPreview.tsx` (277) ya violan
  el límite de 250 líneas de `check:component-size`.

## Restricciones (no negociables)

1. **Honestidad de paleta:** ningún color hardcodeado. Todo color sale de un slot editable
   (`colors.<slot>`). La riqueza se logra con tintes (`color-mix`) y usando más slots, no
   con colores inventados. Todo elemento tintado mapea a su slot base para edición.
2. **Backgrounds intactos:** `appBackground`, `chrome` y las `surface*` se resuelven
   EXACTAMENTE igual que hoy desde sus tokens, planos por tema. Light/dark deben verse
   idénticos a la versión actual. Nada de degradados sobre el fondo de página. Cualquier
   "atmósfera" vive solo DENTRO de elementos contenidos (album art, hero card, fills).
3. **Clic-para-editar sigue siendo el gesto primario en todo.** Las interacciones reales
   con clic llaman `event.stopPropagation()` para interactuar sin editar; su color se
   edita haciendo clic en su indicador visible (que sigue siendo `PreviewSlotTarget`).
4. **Tamaño de componente:** cada `.tsx` en `src/components` debe quedar **bajo 250 líneas**.
5. **Slots verificados:** cada slot usado visualmente debe estar en el `*_VISUAL_SLOTS`
   exportado del layout y resolverse vía el modo (test `layoutPreviewSlots.test.ts`).
6. **Movimiento accesible:** toda animación respeta `prefers-reduced-motion` (usar
   `motion-reduce:` de Tailwind o guardas equivalentes).

## Arquitectura

### Primitivas compartidas — `src/components/color/preview/previewPrimitives.tsx`

Componentes reutilizables; cada uno recibe colores de slot + `onEditSlot` y envuelve sus
partes coloreadas en `PreviewSlotTarget`. Mantener el archivo enfocado (dividir en un
segundo archivo si se acerca a 250 líneas, p.ej. `previewCharts.tsx`).

- `PreviewIcon` — íconos SVG stroke con `currentColor` (set pequeño: home, chart, users,
  bell, search, play, pause, chevrons, etc.).
- `Avatar` — círculo tintado con iniciales (bg = slot al ~15%, texto = slot sólido).
- `Tag` / `StatusPill` — pill tintado (bg slot ~12%, texto slot sólido).
- `StatDelta` — chip de tendencia con flecha + color success/warning/error.
- `Sparkline` — mini línea SVG (color de slot data*).
- `AreaChart` — área SVG con degradado del slot (fill de `color-mix` slot→transparent),
  con animación de entrada del `path`.
- `DonutChart` — anillo SVG multi-serie (data1–5), arcos animados de 0→valor al montar.
- `EqualizerBars` — barras que animan en loop (auto, decorativo).
- `ProgressBar` — barra con progreso; variante `loop` para el player.
- `SegmentedControl` — control real con estado (`useState`); cada segmento hace
  `stopPropagation` al click. Track e indicador activo son slot targets editables.

### Kit de motion — `src/components/color/preview/previewMotion.ts` (+ CSS)

- Keyframes de entrada (grow/fade/draw) añadidos a `globals.css` bajo un scope de preview,
  todos con `@media (prefers-reduced-motion: reduce)` que los desactiva.
- Helpers pequeños si hacen falta (p.ej. hook `useMountedProgress` para animar 0→valor).

### Los 4 layouts quedan como composiciones

Cada archivo importa primitivas y compone la pantalla. Objetivo: < 250 líneas c/u.

## Dirección por layout (mezcla de referencias)

| Layout | Referencia | Contenido |
|---|---|---|
| **Dashboard** | Linear/Vercel | Sidebar con `PreviewIcon` + item activo tintado; KPI cards con `Sparkline` + `StatDelta`; `AreaChart` con degradado; feed de actividad con `Avatar` tintados; `SegmentedControl` de rango de tiempo (interacción real). |
| **Analytics** | Stripe | `DonutChart` del mix de fuentes (data1–5, animado); barras con tooltip en hover; leyenda que resalta la serie en hover; número grande + `StatDelta`. |
| **Media** | Spotify/Arc | Atmósfera con degradado desde `accent` SOLO dentro del album art / card; `EqualizerBars` (auto); `ProgressBar` loop; play/pausa real (toggle); fila scrolleable de cards. Fondo de página = surface inverse actual, sin cambios. |
| **Landing** | Marketing consumer | Hero con degradado contenido en una card/mock (no en el fondo); grid de features con `PreviewIcon`; `SegmentedControl` mensual/anual real en pricing; testimonial con `Avatar`. |

## Responsive

Cada layout colapsa limpio mobile→desktop con los breakpoints existentes (`sm/lg/xl`).
Mantener el wrapper `max-w-*` actual de `PreviewView`. Verificar a ~360px, ~768px, ~1280px:
sin overflow horizontal, gráficas y controles legibles, sidebars que se ocultan/reflujan.

## Tests y verificación

- Actualizar los `*_VISUAL_SLOTS` de cada layout con los slots nuevos que se usen.
- `layoutPreviewSlots.test.ts` debe seguir pasando (cada slot resuelve vía el modo).
- Añadir un test de humo por primitiva compleja si aporta (donut/area con datos de ejemplo
  renderizan sin fallar). YAGNI en lo demás.
- `pnpm verify` (lint + component-size + typecheck + test) debe pasar. Nota: el repo
  actualmente FALLA component-size por 5 archivos preexistentes; este trabajo debe dejar
  los 2 previews que toca (Dashboard, Landing) BAJO 250, reduciendo la deuda, no
  aumentándola. Los otros 3 archivos fuera de alcance quedan como estaban.
- Revisión visual en la app real (`pnpm dev`) en light y dark, confirmando que los
  backgrounds no cambiaron respecto a la versión actual.

## Orden de construcción sugerido

1. Primitivas + keyframes de motion (con tests de humo).
2. Dashboard (pilotea el lenguaje visual y el patrón de interacción real).
3. Analytics (reusa charts).
4. Media.
5. Landing.
6. Actualizar `*_VISUAL_SLOTS` + tests; pasar `pnpm verify`; revisión visual light/dark.

## Fuera de alcance

- Rediseñar la familia `illustration` u otros previews no-UI.
- Cambiar el modelo de tokens/slots o cómo se resuelven los colores por tema.
- Refactorizar los otros 3 archivos que exceden 250 líneas (no relacionados).
