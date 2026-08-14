# Compact status colors — single generate button — Design Spec

**Date:** 2026-08-14  
**Status:** Approved — implemented  
**Surface:** Panel compacto de UI colors (`UiCompactColorPanel` / `UiCompactStatusSlot`)  
**Delivery:** Un solo cambio de UI en el panel compacto; sin cambios de lógica de generación.

## Problem

En “Colores de estado”, cada fila pendiente muestra el subtítulo “Generar automáticamente desde tu paleta” y un botón “Generar”. Los tres botones llaman al mismo `onGenerateStatus`, que ya genera el set completo (éxito, advertencia, peligro). El copy y la CTA se repiten sin aportar acción distinta.

## Goals

1. Un solo botón de generación para la sección, visible solo cuando `statusColors` es `null`.
2. Mantener las 3 filas como preview de roles (Éxito / Advertencia / Peligro) antes de generar.
3. Eliminar el subtítulo redundante “Generar automáticamente desde tu paleta”.
4. Conservar el estado post-generación: hex + “Editar” por fila.

## Non-goals

- Cambiar `onGenerateStatus` / algoritmo de status colors en `lib/`.
- Cambiar `UiStatusColorsSection` (ya tiene un solo CTA).
- Generación por rol individual.
- Regenerar o resetear estados desde este panel.

## Decisions (locked)

| Topic | Choice |
|-------|--------|
| Empty layout | Opción A: 3 filas preview + 1 botón debajo |
| Button placement | Debajo de la lista, no en el header |
| Button label | “Generar colores de estado” (con icono Sparkles) |
| Per-row pending copy | Ninguno (solo etiqueta del rol + swatch pending) |
| Per-row pending CTA | Ninguno |
| After generate | Sin botón de sección; cada fila con hex + Editar (igual que hoy) |
| API de slot | `onGenerate` deja de ser prop de `UiCompactStatusSlot`; el panel llama `onGenerateStatus` una vez |

## UI states

### Pending (`statusColors === null`)

```
[swatch] Éxito
[swatch] Advertencia
[swatch] Peligro

[✨ Generar colores de estado]
```

### Generated

```
[swatch] Éxito        #HEX   Editar →
[swatch] Advertencia  #HEX   Editar →
[swatch] Peligro      #HEX   Editar →
```

## Files

| File | Change |
|------|--------|
| `UiCompactStatusSlot.tsx` | Quitar subtítulo pending y botón Generar; quitar prop `onGenerate` |
| `UiCompactColorPanel.tsx` | Renderizar botón único bajo la lista cuando no hay `statusColors` |

## Testing

- Smoke visual: pending → un CTA; post-click → tres hex + Editar.
- Confirmar que no quedan strings “Generar automáticamente” ni tres botones “Generar” en el compact panel.
