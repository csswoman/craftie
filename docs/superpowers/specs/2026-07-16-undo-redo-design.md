# Deshacer / Rehacer en la paleta de roles

Fecha: 2026-07-16 · Estado: aprobado

## Objetivo

Botones Deshacer/Rehacer para las ediciones de color, ubicados en el navbar del
lienzo «Paleta de roles», con atajos Ctrl+Z / Ctrl+Shift+Z (y Ctrl+Y).

## Alcance

Entra al historial (commits de edición):

- Reemplazar color de rol o token semántico (`replaceRole`, `replaceSemanticToken`)
- Vaciar token (`clearSemanticToken`)
- Estados: asignar fuente y elegir candidato (`assignSourceToStatus`, `selectStatusColor`)
- Vibrancia guardada (`saveVibrancy`), estilo neutro (`setNeutralStyle`)
- Renombrar rol (`renameRole`) y bloquear/desbloquear (`toggleLock`)

No entra / resetea el historial:

- Cargar imagen, regenerar o limpiar paleta (`assignFromExtracted`,
  `assignFromHexes`, `setRolePalette`, `clearRolePalette`) → historial vacío
- Previews en vivo (sliders, hover): solo el commit crea un paso
- Tema activo, rol activo, seed de ilustración

## Arquitectura

- `lib/utils/historyStack.ts`: pila genérica inmutable
  (`createHistory`, `pushHistory`, `undoHistory`, `redoHistory`,
  `canUndo`, `canRedo`), límite 50 pasos. Framework-agnóstica, con test.
- `RolePaletteContext`: el sub-estado editable se consolida en un solo objeto
  (`tokenOverrides`, `clearedSemanticTokens`, `roleNames`, `lockedRolesByTheme`,
  `savedVibrancy`, `neutralStyle`, `forcedStatusSources`, `forcedStatusColors`)
  gestionado por la pila. Cada acción de edición hace `pushHistory`.
  Se exponen `undoEdit`, `redoEdit`, `canUndoEdit`, `canRedoEdit`.
  Al deshacer/rehacer se sincroniza `previewVibrancy` y se limpia el preview
  de edición.
- `src/components/color/PaletteHistoryControls.tsx`: dos botones de icono
  (Lucide `Undo2`/`Redo2`, hit area 44px, `aria-label`, deshabilitados sin
  historial), montado en el navbar de `PaletteCanvas` junto al título.
- `src/lib/browser/useUndoRedoShortcuts.ts`: adapter de teclado
  (Ctrl/Cmd+Z, Ctrl/Cmd+Shift+Z, Ctrl/Cmd+Y). Ignora inputs, textareas y
  contenteditable.
