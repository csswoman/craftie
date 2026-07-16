# Auto-paired text on fill colors — Design Spec

**Date:** 2026-07-16  
**Status:** Approved for planning  
**Surface:** Ajuste no destructivo / selección de tokens de fill (`primary`, `secondary`, `accent`, `hero-surface`, y escalas tonales equivalentes)  
**Context:** Al aclarar `secondary` a `#61C7CD`, el UI mostraba fallo AA 1.7:1 porque medía el `on-secondary` antiguo (texto claro) sobre el fill nuevo, sin recalcular el texto emparejado.

## Problem

Craftie trata roles como Secundario como fills (botón, chip, badge). Cada fill tiene un token `on-*` (texto encima). Hoy, al ajustar o seleccionar un fill:

1. El preview solo cambia el hex del fill (`previewSemanticToken`).
2. El contraste se mide contra el `on-*` ya guardado (a menudo del color original).
3. El canvas/layout puede mostrar el botón con texto del “color que no es” (p. ej. texto claro sobre teal claro).
4. El copy (“no alcanza AA”) suena como si el color fuera inválido, cuando el problema es el par desactualizado.

El usuario no quiere gestionar `on-*` ni confirmar overrides por un falso negativo. Quiere: elegir el color → texto oscuro o claro correcto → listo.

## Goals

1. Al seleccionar o ajustar un fill, recalcular automáticamente su texto emparejado (`on-*`).
2. Que preview y layout usen ese par de inmediato (botón legible, no “texto viejo”).
3. Que el veredicto AA refleje el par recalculado, no el `on-*` obsoleto.
4. Solo advertir / pedir confirmación cuando **ni siquiera** el mejor texto emparejado alcanza AA.
5. Aplicar la misma regla a todos los colores de fill del sistema, no solo Secundario.

## Non-goals

- Educar con paneles de “fitness por uso” (texto vs fill vs superficie) en esta iteración.
- Mejorar solo el copy sin recalcular el par.
- Dejar que el usuario edite manualmente `on-*` como flujo principal.
- Cambiar umbrales WCAG (sigue AA 4.5:1 para texto normal sobre el fill).
- Recalcular pares de borde, divider o data series (no son fills con texto encima).
- Rediseño amplio del editor de ajuste (sliders, candidatos de imagen) más allá del contraste/par.

## Decisions (locked)

| Topic | Choice |
|-------|--------|
| Comportamiento | Al cambiar un fill, **rederivar** su `on-*` con la lógica existente (`deriveForegroundForBackground` / `derivedPair`) |
| Persistencia | Al aplicar el fill, el `on-*` recalculado se guarda como **derived** (sigue al fill; no override manual) |
| Preview en vivo | El draft del fill incluye el `on-*` recalculado en tokens de preview y en el canvas |
| Cuándo fallar AA | Solo si el par fill + `on-*` recién derivado no alcanza 4.5:1 |
| Alcance de tokens | Fills: `primary`, `secondary`, `accent`, `hero-surface`, y pasos tonales que llevan `on-{base}-{step}` |
| UX de aprendizaje | Fuera de alcance ahora; el “lado bueno” es implícito: el color se aplica con texto correcto |

## Behavior

### Al seleccionar o ajustar un fill

1. Usuario cambia hex (candidato de imagen, slider de luminosidad/chroma, o apply).
2. Sistema deriva `on-*` para ese hex (texto más claro u oscuro según contraste).
3. Tokens de preview = fill nuevo + `on-*` nuevo.
4. Canvas / botones / chips usan ese par.
5. Badge de contraste = ratio del par nuevo vs AA.

### Al aplicar

- Se persiste el fill.
- Se regenera y persiste el `on-*` como `source: 'derived'` (o equivalente actual), de modo que futuros cambios del fill vuelvan a regenerarlo.
- Si el usuario tenía un override manual de `on-*`, al cambiar el fill el sistema **lo reemplaza** con el derivado (esta fase prioriza “siempre el texto correcto” sobre preservar overrides de on-color).

### Cuando el par derivado falla AA

- Caso raro (fills de luminosidad intermedia donde ni claro ni oscuro llegan a 4.5:1).
- Mantener confirmación explícita (“Aplicar de todos modos”) solo en ese caso.
- Copy: el fallo es del **par fill + texto**, no “el color es inútil”.

### Tokens fuera de alcance

- `border`, `divider`, data-N: sin `on-*` de fill → sin este flujo.
- Tokens `on-*` editados solos: fuera de esta fase (si se editan en otro flujo, se mide contra su fill actual).

## Architecture (lib)

| Unit | Responsibility |
|------|----------------|
| `previewSemanticToken` (o sucesor) | Al previsualizar un fill, también actualizar el token `on-*` emparejado |
| `semanticTokenTargets` / `READABLE_PAIRS` | Fuente de verdad del mapeo fill ↔ on |
| `deriveForegroundForBackground` / `derivedPair` | Cálculo del texto; sin duplicar lógica en UI |
| Apply path en RolePalette / semantic overrides | Al guardar un fill, regenerar su `on-*` derived |
| `InlineTokenDerivationEditor` | Consumir preview con par completo; AA = par derivado |

UI no inventa contraste: solo muestra el resultado del par recalculado.

## Data flow

```
fill draft hex
  → derive on-* (AA target 4.5)
  → preview tokens { fill, on-* }
  → canvas + contrast badge
  → on Apply: persist fill + derived on-*
```

## Error / edge cases

| Case | Behavior |
|------|----------|
| Fill muy claro | `on-*` oscuro; AA suele pasar |
| Fill muy oscuro | `on-*` claro; AA suele pasar |
| Fill “medio” sin AA posible | Warning + “Aplicar de todos modos” |
| Token sin par en `READABLE_PAIRS` | Sin badge AA de este flujo (como hoy) |
| Override previo de `on-*` | Se descarta al cambiar el fill (locked) |

## Testing

1. Ajustar `secondary` de oscuro (`#1C4B8E`) a claro (`#61C7CD`): preview muestra texto oscuro; ratio ≥ 4.5; no pedir “de todos modos” si el par pasa.
2. Mismo flujo para `primary` y `accent`.
3. Apply persiste fill y `on-secondary` derived; reabrir editor no restaura texto claro obsoleto.
4. Fill imposible de AA (si hay fixture): sí muestra confirmación.
5. Cambiar `border` no regenera ningún `on-*`.

## Out of scope follow-ups (explicit)

- Panel de tradeoffs educativos (buenos/malos usos del color).
- Conservar overrides manuales de `on-*` al cambiar fill.
- APCA u otros métricas además de WCAG AA.
