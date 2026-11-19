---
name: Craftie
description: Una mesa de muestras en bosque cozy donde las paletas del usuario son lo único con color vivo.
colors:
  bg: "oklch(0.985 0.01 95)"
  canvas: "oklch(0.94 0.02 110)"
  surface: "oklch(0.972 0.013 100)"
  surface-raised: "oklch(0.945 0.02 105)"
  ink: "#1f2a22"
  muted: "#596154"
  faint: "#9ca392"
  line: "#e4e2d0"
  line-soft: "#eeeddf"
  border: "oklch(0.86 0.022 105)"
  primary: "oklch(0.35 0.077 160)"
  primary-hover: "oklch(0.28 0.07 160)"
  on-primary: "oklch(1 0 0)"
  forest: "#1e4635"
  forest-deep: "#163728"
  forest-darker: "#0f2b1e"
  accent: "oklch(0.52 0.11 230)"
  attention: "#c47b2a"
  attention-bg: "#fbf1e4"
  clay: "oklch(0.58 0.12 45)"
  pass: "oklch(0.45 0.12 150)"
  fail: "oklch(0.48 0.18 25)"
typography:
  display:
    fontFamily: "Lora, Georgia, serif"
    fontSize: "1.75rem"
  headline:
    fontFamily: "Lora, Georgia, serif"
    fontSize: "1.125rem"
  body:
    fontFamily: "Nunito, system-ui, sans-serif"
    fontSize: "1rem"
  label:
    fontFamily: "Nunito, system-ui, sans-serif"
    fontSize: "0.8125rem"
  caption:
    fontFamily: "Nunito, system-ui, sans-serif"
    fontSize: "0.75rem"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  control: "10px"
  card: "16px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  2xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.control}"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  swatch:
    rounded: "{rounded.md}"
    size: "48px"
---

# Design System: Craftie

## Overview

**Creative North Star: "La mesa de muestras"**

Craftie es una mesa de trabajo neutra, con un tinte verde de bosque, donde las paletas del usuario se ponen a prueba como muestras sobre un tablero. La interfaz sostiene las muestras y no compite con ellas. El carácter buscado es cozy y natural: verdes de bosque profundos, neutros con un leve tinte verde, serif cálida en los títulos y esquinas suaves.

La densidad es moderada y la jerarquía clara. El tema claro es el predeterminado y existe un tema oscuro por `data-theme='dark'`. La dirección cozy está confirmada, pero el sistema actual es más sobrio que cálido; ese hueco es una decisión abierta (ver Elevation & Depth).

**Key Characteristics:**
- Fondo de página crema cálido (`oklch(0.985 0.01 95)`); el lienzo de trabajo (`canvas`) lleva un tinte verde-gris muy leve y una cuadrícula de puntos.
- Color de marca (bosque) reservado a acciones y foco; la saturación es de las paletas del usuario.
- Lora para títulos, Nunito para todo lo demás.
- Profundidad sobre todo por tono de superficie y bordes finos.
- WCAG primero: la herramienta cumple lo que valida.

## Colors

Neutros cálidos de musgo y crema (hue 95 a 110) y un solo verde de marca profundo. El ámbar solo avisa.

### Primary
- **Verde bosque** (`oklch(0.35 0.077 160)`): botón primario, foco y acciones críticas. Hover en `oklch(0.28 0.07 160)`.
- **Bosque profundo** (`#1e4635`, `#163728`, `#0f2b1e`): variantes de bosque para superficies de marca y énfasis oscuro.

### Secondary
- **Azul de enlace** (`oklch(0.52 0.11 230)`): enlaces secundarios y estados informativos. No se usa como fondo.

### Neutral
- **Crema** (`oklch(0.985 0.01 95)`): fondo de página.
- **Lienzo musgo claro** (`oklch(0.945 0.006 160)`): área de trabajo detrás de las paletas.
- **Superficie** (`oklch(0.982 0.002 160)`) y **Superficie elevada** (`oklch(0.945 0.004 160)`): paneles, inputs y filas.
- **Tinta bosque** (`#1a2420`): texto principal.
- **Tinta suave** (`#5c6561`) y **Neblina** (`#9aa8a0`): texto secundario y metadatos.
- **Línea** (`#e4eae6`, `#eef2f0`) y borde (`oklch(0.86 0.005 160)`): divisores y bordes de 1px.

### Acento
- **Terracota** (`oklch(0.58 0.12 45)`; en oscuro `oklch(0.72 0.11 50)`): solo indicadores de pestaña activa. No en fondos ni texto.
- **Ámbar de aviso** (`#c47b2a` sobre `#fbf1e4`): atención, nunca decoración.
- **Aprobado** (`oklch(0.45 0.12 150)`) y **Fallo** (`oklch(0.48 0.18 25)`): resultado WCAG. Siempre con texto o icono, no solo color.

### Named Rules
**The Palette First Rule.** Los únicos bloques de color saturado son los swatches y previews del usuario. El chrome se queda en neutros verdosos.
**The One Voice Rule.** El verde bosque aparece en acciones y foco, no como fondo de página ni degradado de marca.

## Typography

**Display Font:** Lora (con Georgia, serif)
**Body Font:** Nunito (con system-ui, sans-serif)

**Character:** Lora da calidez editorial a los títulos; Nunito, redondeada y amable, hace el trabajo diario en controles y datos.

### Hierarchy
- **Display** (1.75rem): título de pantalla.
- **Headline** (1.125rem): secciones dentro de un paso.
- **Body** (1rem): texto y ayudas. Prosa de 65 a 75ch.
- **Label** (0.8125rem): controles, badges WCAG, valores hex.
- **Caption** (0.75rem): conteos y chips.

### Named Rules
**The Two Voices Rule.** Lora solo en display y headline; Nunito en el resto, incluidos botones, inputs y tablas.

## Layout

Espacio base de 4px con pasos de 4, 8, 12, 16, 24 y 32px. Lienzo central con puntos sutiles (`canvas-dot`) y paneles laterales de herramientas. La barra lateral de color usa una escala de cinco tamaños (13 a 17px). Los puntos de ruptura exactos no se documentaron.

## Elevation & Depth

Suave y con tinte bosque. Las superficies cambian de tono (`surface`, `surface-raised`) y llevan bordes de 1px. Las sombras existen pero son suaves: `shadow-float` en elementos flotantes, y `shadow-sm/md/lg` en popovers y paneles.

- **Float** (`0 1px 2px oklch(0.3 0.04 150 / 0.06), 0 4px 14px -4px oklch(0.3 0.04 150 / 0.12)`): elementos que flotan sobre el lienzo. `shadow-sm/md/lg` siguen la misma receta.

Dirección cozy aplicada en tokens (neutros cálidos, radios blandos, sombras con tinte bosque). Pendiente: acento cálido, íconos redondeados y estados vacíos con personalidad.

## Shapes

Esquinas blandas. Controles de 10px, tarjetas de 16px, escala general de 8, 12, 16 y 20px, y píldoras de 999px. Los swatches usan 10px.

## Components

### Buttons
- **Shape:** 8px de radio.
- **Primary:** fondo verde bosque, texto blanco; hover más oscuro.
- **Ghost:** sin fondo, texto tinta; hover con superficie elevada.
- **Focus:** anillo visible siempre.

### Swatches (componente firma)
- **Shape:** 10px de radio, mínimo 48px.
- **Background:** el color del usuario, sin borde de marca.
- **Selected:** contorno interior de 2px (`inset 0 0 0 2px`).

### Cards / Containers
- **Corner Style:** 12px.
- **Background:** Superficie o Papel, con borde de 1px.
- **Shadow Strategy:** ver Elevation & Depth.

### Inputs / Fields
- **Style:** fondo Superficie elevada, borde de 1px, radio de 8 a 10px.
- **Focus:** borde de color primario y anillo.

## Do's and Don'ts

### Do:
- **Do** dejar que los swatches sean el centro visual de cada pantalla.
- **Do** mostrar ratio y nivel AA/AAA con datos.
- **Do** usar neutros cálidos de crema y musgo, no grises fríos.
- **Do** acompañar pass/fail con texto o icono.

### Don't:
- **Don't** imitar Coolors, Adobe Color ni otras herramientas comerciales.
- **Don't** usar Inter por defecto, gradientes morados ni grids de tarjetas idénticas.
- **Don't** poner bordes laterales de color en tarjetas, alertas o listas.
- **Don't** usar texto con degradado ni glassmorphism decorativo.
- **Don't** esconder problemas de contraste detrás de grises elegantes.
