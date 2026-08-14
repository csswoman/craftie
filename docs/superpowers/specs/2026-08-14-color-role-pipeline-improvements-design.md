# Color role pipeline improvements — Design Spec

**Date:** 2026-08-14  
**Status:** Approved for planning  
**Surface:** Pipeline `assignRolesFromExtracted` / `assignRolesFromHexes` → `deriveSemanticTokens` → `projectSemanticTokensToRolePalette` en `lib/color/`  
**Delivery:** Un solo PR con 4 commits lógicos (una mejora por commit), cada uno testeable por separado.

## Problem

El pipeline de roles elige colores expresivos por score estético (`brandScore` / chroma / prominence) y deriva neutros por rampa tintada, pero:

1. No expone si un expresivo es seguro como **texto** sobre la superficie (AA 4.5:1).
2. `background` y `surface` pueden quedar demasiado cercanos en lightness OKLCH, con capas visualmente fusionadas.
3. No hay un token/rol de primera clase para **texto secundario** (~3:1).
4. Los consumidores eligen libremente entre `primary` / `secondary` / `accent` sin un mapeo de **intención de uso**.

## Goals

1. Exponer `textSafe` en slots expresivos sin cambiar qué hex se elige.
2. Garantizar distancia mínima de lightness entre `background` y `surface` (light y dark), con clamp para no invadir `border`.
3. Añadir `on-background-muted` → rol `texto-secundario` (~3:1 vs surface; AA large).
4. Exponer `getColorForUsage(intent)` con mapeo fijo de intención → rol, devolviendo fill + texto seguro.

## Non-goals

- Migrar todos los componentes UI a `getColorForUsage` (solo exponer API + wrapper de contexto).
- Parámetro `against?: 'surface' | 'background'` en esta iteración (anotado para el futuro).
- Cambiar la selección de hexes expresivos (primary/secondary/accent).
- Rediseñar rampa tonal, status tokens o data series.
- Reimplementar luminancia WCAG desde cero si ya existe `contrastRatio`.

## Decisions (locked)

| Topic | Choice |
|-------|--------|
| Dónde vive `textSafe` | En `RoleSlot` al proyectar; **no** se añade a `SemanticToken` |
| Contra qué se mide `textSafe` | `surface.hex` por defecto (componentes sobre cards/superficies). Futuro: `against` opcional |
| Umbral AA texto normal | ≥ 4.5:1 (`isTextSafe`) |
| Delta L fondo/superficie | `MIN_BG_SURFACE_LIGHTNESS_DELTA = 0.035`; clamp vs lightness de `border` |
| Dirección del ajuste | Light: alejar `surface.l` bajándola si está demasiado cerca; dark: subirla. Mismo hue/chroma |
| Texto secundario | Token `on-background-muted`; rol `texto-secundario`; ~3:1 vs `surface`; sin alpha |
| Asunción de tamaño muted | AA large: tipicamente ≥18px o ≥14px bold — documentado en comentario de código |
| Helper de uso | Puro en `lib/color/usageColor.ts`; wrapper fino en `RolePaletteContext` |
| Return de `getColorForUsage` | `{ fill: RoleSlot; text: RoleSlot; textSafe: boolean }` |
| Fallback texto en `action` + `!textSafe` | Preferir tonal oscuro mismo hue (`primary-900`); si no existe, `texto` / `on-background` |
| Delivery | Un PR, 4 commits lógicos |

## Architecture

```
extracted / hexes
      → deriveSemanticTokens  (+ delta L surface, + on-background-muted)
      → projectSemanticTokensToRolePalette  (+ textSafe en primario/secundario/acento, + texto-secundario)
      → RolePalette
      → getColorForUsage(palette, tokens, intent)  [lib]
      → RolePaletteContext wrapper  [UI]
```

| Piece | File | Responsibility |
|-------|------|----------------|
| Contraste AA | `lib/color/roleFitness.ts` | `isTextSafe(candidateHex, surfaceHex)` |
| Rampa + muted | `lib/color/semanticTokens.ts` | delta L + clamp; token `on-background-muted` |
| Tipos de rol | `lib/color/roleTypes.ts` | `texto-secundario` en id/order/labels/derived |
| Proyección | `lib/color/semanticRoleProjection.ts` | mapeo muted; set `textSafe` en expresivos |
| Uso | `lib/color/usageColor.ts` | intents → `UsageColor` |
| UI | `src/context/RolePaletteContext.tsx` | wrapper con palette/tokens actuales |

## Behavior

### 1. `isTextSafe`

- Usa `contrastRatio` existente (luminancia relativa WCAG).
- `true` si ratio ≥ 4.5.
- Comentario: criterio de accesibilidad para texto normal, no de estética.

### 2. Distancia background ↔ surface

Después de generar la rampa neutra tintada en `deriveBaseSemanticTokens`:

1. Leer lightness OKLCH de `background` y `surface`.
2. Si `|ΔL| < 0.035`, ajustar solo `surface.l` alejándolo de `background` (dirección según tema).
3. Clampear `surface.l` para no cruzar el lightness de `border` ni el de `background`.
4. Si el rango es demasiado estrecho, aplicar el máximo delta posible dentro del clamp.

### 3. `on-background-muted` / `texto-secundario`

- Derivado de `on-background`: mismo hue (y chroma de rampa), lightness hacia `background` hasta ~3:1 vs `surface`.
- Comentario de código: pensado para labels/texto secundario a tamaño AA large (≥18px o ≥14px bold), no para body 12px.
- Proyección: `'texto-secundario': 'on-background-muted'`.
- Ripple TypeScript: `ROLE_LABELS`, `DERIVED_ROLES`, `PALETTE_ROLE_ORDER`, switches/`Record<PaletteRoleId, …>` exhaustivos.

### 4. `getColorForUsage`

```ts
type UsageIntent =
  | 'action'
  | 'active-state'
  | 'positive-trend'
  | 'data-visualization';

type UsageColor = {
  fill: RoleSlot;
  text: RoleSlot;
  textSafe: boolean;
};
```

| Intent | Fill role | Texto encima |
|--------|-----------|--------------|
| `action` | `primario` | Si `textSafe`: puede usar el expresivo como fuente; si no: `primary-900` (mismo hue) → fallback `texto` |
| `active-state` | `primario` | Nunca el expresivo como fuente; `text` = `texto` / `on-background` |
| `positive-trend` | `acento` | `text` = `texto` (fill como indicador/dato, no fuente) |
| `data-visualization` | `secundario` | `text` = `texto` |

`textSafe` en el return refleja el del fill expresivo (medido vs surface en proyección).

**Futuro (no implementar):** `against?: 'surface' | 'background'` para badges flotantes sobre fondo de página.

## Testing

| Área | Casos |
|------|--------|
| `isTextSafe` | Par AA conocido → true; par bajo contraste → false |
| Delta L | Light y dark: `\|L(bg)-L(surface)\| ≥ 0.035`; surface no invade border |
| `getColorForUsage` | Un caso por intent; `action` + `textSafe: false` verifica que `text.hex` es tonal mismo hue (`primary-900`), **no** el fallback genérico `on-background` |

## Implementation order (commits)

1. `isTextSafe` + tests  
2. Delta L background/surface + clamp + tests  
3. `on-background-muted` / `texto-secundario` + proyección + ripple tipos  
4. `usageColor` + wrapper contexto + tests de mapeo/fallback tonal  

## Open follow-ups (out of scope)

- `getColorForUsage(..., { against: 'surface' | 'background' })`
- Migración gradual de componentes a la API de usage
