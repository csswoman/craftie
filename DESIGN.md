---
name: Palette & Type Tool
description: Tema claro y neutro donde las paletas del usuario son el único color protagonista.
colors:
  bg: "#ffffff"
  surface: "#f7f7f7"
  surface-raised: "#f0f0f0"
  ink: "#2a2f2d"
  muted: "#5c6561"
  border: "#e3e5e4"
  primary: "#2f5644"
  primary-hover: "#244336"
  accent: "#3d6a8a"
  focus-ring: "#2f5644"
  pass: "#1f6b45"
  fail: "#b42318"
typography:
  display:
    fontFamily: "Playfair Display, Georgia, serif"
    fontSize: "clamp(1.75rem, 3vw, 2.25rem)"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Playfair Display, Georgia, serif"
    fontSize: "1.375rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "normal"
  title:
    fontFamily: "Open Sans, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: "normal"
  body:
    fontFamily: "Open Sans, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "normal"
  label:
    fontFamily: "Open Sans, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 500
    lineHeight: 1.35
    letterSpacing: "0.01em"
rounded:
  sm: "6px"
  md: "10px"
  lg: "14px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "48px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "10px 16px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "#ffffff"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
  swatch:
    rounded: "{rounded.md}"
    size: "48px"
---

# Design System: Palette & Type Tool

## 1. Overview

**Creative North Star: "The Quiet Gallery"**

La interfaz es una sala blanca y silenciosa: marco neutro, tipografía cuidada, controles discretos. **Las paletas del usuario son las obras** — los únicos bloques de color saturado que compiten por atención. La app no compite con el contenido; lo exhibe.

Densidad moderada, jerarquía clara, cero decoración SaaS. El verde musgo del sistema (`primary`) aparece solo en acciones y foco, nunca como fondo de página ni como gradiente de marca. Rechaza explícitamente clones de herramientas comerciales, cards infinitas, gradientes morados y dark mode por defecto (ver `PRODUCT.md`).

**Key Characteristics:**

- Tema **claro** con fondo blanco puro; sin crema, arena ni tintes cálidos en superficies.
- **Restrained**: cromo UI ≤10% de color de marca; saturación reservada a swatches y previews de paleta.
- **Serif display + sans body**: Playfair Display para títulos, Open Sans para trabajo diario.
- **Flat by default**: profundidad por borde y tono de superficie, no sombras pesadas.
- **WCAG-first**: texto legible siempre; la herramienta practica lo que predica.

## 2. Colors

Paleta de interfaz casi acromática; el color vive en el canvas de paletas, no en el chrome.

### Primary

- **Forest Ink** (`#2f5644` / `oklch(0.35 0.077 160)`): botón primario, anillo de foco, enlaces de acción crítica. Uso escaso — máximo ~10% de cualquier pantalla.

### Secondary

_Omitido a propósito._ Un solo acento de marca en el chrome; más color roles confunden el foco en las paletas del usuario.

### Tertiary

_Omitido._

### Neutral

- **Pure Paper** (`#ffffff` / `oklch(1 0 0)`): fondo de página y canvas principal.
- **Soft Surface** (`#f7f7f7` / `oklch(0.975 0 0)`): paneles laterales, barras de herramientas, zonas de apoyo.
- **Raised Surface** (`#f0f0f0` / `oklch(0.955 0 0)`): hover de filas, fondos de inputs en reposo.
- **Ink** (`#2a2f2d` / `oklch(0.19 0.008 160)`): texto principal. Contraste ≥7:1 sobre Pure Paper.
- **Muted Ink** (`#5c6561` / `oklch(0.44 0.012 160)`): texto secundario, metadatos. Contraste ≥4.5:1 sobre Pure Paper.
- **Hairline** (`#e3e5e4` / `oklch(0.90 0.003 160)`): divisores y bordes de 1px.

### Accent (funcional, no decorativo)

- **Link Blue** (`#3d6a8a` / `oklch(0.52 0.11 230)`): enlaces secundarios y estados informativos. Nunca como fondo de sección.

### Named Rules

**The Palette First Rule.** El único color saturado protagonista en pantalla son los swatches y previews de la paleta del usuario. El chrome de la app permanece neutro.

**The Paper Room Rule.** Fondo de página siempre blanco puro (`oklch(1 0 0)`). Prohibido crema, arena, beige o `--paper` cálido.

**The One Voice Rule.** `primary` (verde bosque) en ≤10% de la superficie visible. Su rareza es el punto.

## 3. Typography

**Display Font:** Playfair Display (Georgia, serif)  
**Body Font:** Open Sans (system-ui, sans-serif)

**Character:** Playfair aporta elegancia editorial en títulos; Open Sans es la voz de trabajo — legible, neutral, invisible en formularios y datos.

### Hierarchy

- **Display** (500, `clamp(1.75rem, 3vw, 2.25rem)`, lh 1.15): nombre de pantalla, encabezado de flujo. `text-wrap: balance`.
- **Headline** (500, 1.375rem, lh 1.2): secciones dentro de un paso del flujo.
- **Title** (600, 1rem, lh 1.35): etiquetas de panel, nombres de paleta guardada.
- **Body** (400, 0.9375rem, lh 1.55): copy, ayudas, resultados de contraste. Máx. 65–75ch en prosa.
- **Label** (500, 0.8125rem, lh 1.35): controles, badges de estado WCAG, metadatos de ratio.

### Named Rules

**The Two Voices Rule.** Playfair Display solo en display/headline. Open Sans en todo lo demás. Nunca Playfair en botones, inputs o tablas.

**The No Inter Rule.** Inter, system-ui genérico como display, y pares de sans geométricos idénticos están prohibidos.

## 4. Elevation

Sistema **plano por defecto**. La profundidad se comunica con cambio de tono de superficie (`surface` → `surface-raised`) y bordes Hairline de 1px, no con sombras ambientales.

### Shadow Vocabulary

- **Focus lift** (`0 0 0 3px oklch(0.35 0.077 160 / 0.25)`): único uso de sombra — anillo de foco accesible en controles interactivos.

### Named Rules

**The Flat-By-Default Rule.** Sin `box-shadow` decorativo en cards o contenedores. Si parece un dashboard SaaS 2018, la sombra sobra.

## 5. Components

### Buttons

- **Shape:** esquinas suaves (10px).
- **Primary:** fondo Forest Ink, texto blanco, padding 10×16px. Hover → `#244336`.
- **Ghost:** sin fondo, texto Ink, hover con Raised Surface.
- **Focus:** anillo Focus lift; nunca solo `outline: none`.

### Swatches (componente firma)

- **Shape:** 10px radius, tamaño mínimo 48×48px táctil.
- **Background:** el color de la paleta del usuario — **sin borde de acento de marca**.
- **Selected:** borde 2px Ink + offset 2px; no side-stripe.
- **Internal:** sin iconos decorativos encima del color.

### Cards / Containers

- **Corner Style:** 10px.
- **Background:** Soft Surface o Pure Paper.
- **Border:** 1px Hairline cuando hace falta separación; sin sombra.
- **Internal Padding:** 16–24px según densidad.

### Inputs / Fields

- **Style:** fondo Raised Surface, borde Hairline 1px, radius 10px.
- **Focus:** borde primary + anillo Focus lift.
- **Placeholder:** Muted Ink (≥4.5:1 verificado).

### Navigation

- **Style:** barra superior o lateral en Soft Surface, Hairline inferior/derecho.
- **Typography:** Title (Open Sans 600).
- **Active:** texto Ink + indicador 2px primary inferior; sin pill de color saturado.

## 6. Do's and Don'ts

### Do:

- **Do** dejar que los swatches de paleta ocupen el centro visual de cada pantalla.
- **Do** usar Playfair Display + Open Sans como par display/body.
- **Do** mantener fondo blanco puro y texto Ink con contraste verificado.
- **Do** mostrar ratios WCAG y niveles AA/AAA con datos explícitos (Show, don't tell).
- **Do** usar `primary` solo para acciones y foco, nunca como decoración de fondo.

### Don't:

- **Don't** imitar Coolors, Adobe Color u otras herramientas comerciales.
- **Don't** usar SaaS genérico: Inter por defecto, gradientes morados, grids de cards idénticas, hero-metrics.
- **Don't** esconder problemas de contraste detrás de grises "elegantes" en texto secundario.
- **Don't** saturar la UI con controles o jerga de diseño innecesaria.
- **Don't** usar dark mode por defecto sin motivo contextual.
- **Don't** poner bordes laterales de color en cards, alerts o listas (side-stripe).
- **Don't** usar gradient text, glassmorphism decorativo ni eyebrows en mayúsculas en cada sección.
