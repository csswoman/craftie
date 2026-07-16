# Logo Craftie → inicio con confirmación

Fecha: 2026-07-16 · Estado: aprobado

## Objetivo

El wordmark **Craftie** del navbar del workspace debe llevar al “inicio”
(empty state de inspiración). Si hay progreso en la sesión, pedir confirmación
antes de borrarlo. Sin persistencia de proyecto en localStorage.

## Contexto

- La app es una sola ruta (`/`). El `Link href="/"` actual no reinicia el
  estudio porque el usuario ya está en home.
- El progreso de paleta/inspiración vive en estado React del controller.
- Persistencia de proyecto completo pertenece a la fase Save & Export; fuera
  de alcance aquí.

## Comportamiento

### Clic en Craftie

1. Si **no hay progreso** → `resetWorkspace()` en silencio (idempotente si ya
   está vacío).
2. Si **hay progreso** → abrir diálogo de confirmación.
   - **Cancelar** → cerrar diálogo; no cambia el estado.
   - **Empezar de nuevo** → `resetWorkspace()` y cerrar diálogo.

### Qué cuenta como progreso (`hasWorkspaceProgress`)

Verdadero si cualquiera de estos aplica:

- `catalogSource !== 'none'`
- `rolePalette !== null`
- `generatedPalette !== null`
- imagen en curso o cargada (`imageFile !== null` o `imagePreviewUrl !== null`
  o `isImageBusy`)

Tipografía / preferencias de chrome no cuentan por sí solas como progreso de
sesión a proteger (ver “Qué no se toca”).

### Qué borra `resetWorkspace()`

- Inspiración: `catalogSource`, `selectedStyleId`, `paletteCatalog`
- Imagen: file, preview URL (con `revokeObjectURL`), fingerprint, regenerate
  index, tipos de paleta de imagen
- Paleta: `clearRolePalette()`
- Guía: `generatedPalette`
- UI de flujo: `error`, `statusMessage`, `inspirationModalOpen`, flags busy
  de imagen
- Tipografía de sesión del estudio: volver a `createInitialTypeUiState()`
  (no reescribir localStorage de pair id en este reset; la tipografía
  “aplicada al kit” se pierde con la guía)

### Qué no se toca

- Tema claro/oscuro
- Layout de paneles (`craftie-studio-panel-layout`)
- Preferencia de guía rápida descartada
- `localStorage` de pair tipográfico (sigue disponible si el usuario vuelve a
  generar; no es el borrador del proyecto)

## UI

Diálogo nativo (`<dialog>`) alineado con `InspirationModal` /
`MockupModal` + `useDialogAccessibility`.

| Elemento | Copy |
| --- | --- |
| Título | ¿Empezar de nuevo? |
| Cuerpo | Se perderá el progreso de esta sesión. |
| Secundaria | Cancelar |
| Primaria destructiva | Empezar de nuevo |

Accesibilidad: focus trap, Escape = cancelar, `aria-labelledby` /
`aria-describedby`, botones con hit area ≥ 44px.

## Arquitectura

| Pieza | Responsabilidad |
| --- | --- |
| `lib/studio/workspaceProgress.ts` (puro) | `hasWorkspaceProgress(input)` — test unitario |
| `useSelectColorsWorkspaceController` | `resetWorkspace()`, expone `hasWorkspaceProgress` y handler de logo |
| `ConfirmResetWorkspaceDialog` | Presentación del confirm |
| `WorkspaceHeader` | Sustituir `Link` por control que llama `onCraftieHome` (o similar) |

Flujo:

```
Craftie click
  → hasWorkspaceProgress? 
      no  → resetWorkspace()
      sí  → open confirm
            → confirm → resetWorkspace()
            → cancel  → close
```

## Fuera de alcance

- Guardar borrador en localStorage / “Continuar donde lo dejaste”
- Confirmación al cerrar pestaña del navegador (`beforeunload`)
- Navegación multi-página o dashboard de proyectos
- Cambiar SiteHeader legacy (si no está montado en el flujo actual)

## Criterios de aceptación

1. Con empty state, clic en Craftie no muestra diálogo y el UI sigue vacío.
2. Tras elegir estilo o subir imagen, clic en Craftie muestra el diálogo.
3. Cancelar deja paleta/inspiración intactas.
4. Confirmar vuelve al empty card y permite empezar otra inspiración.
5. Teclado: Escape cancela; Tab cicla dentro del diálogo.
6. No se escriben claves nuevas de proyecto en localStorage.
