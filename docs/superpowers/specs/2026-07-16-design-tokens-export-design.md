# Exportar tokens de diseño (CSS, JSON W3C, Tokens Studio)

Fecha: 2026-07-16 · Estado: aprobado

## Objetivo

Exportar tokens de sistema de diseño en tres formatos —CSS custom properties,
JSON estándar W3C/Style Dictionary y JSON compatible con Tokens Studio para
Figma— más un DESIGN.md legible, incluyendo **solo los tokens que el usuario
definió**, y sin requerir presionar «Crear guía de marca».

## Decisiones clave

- **Solo lo definido**: entran los 7 roles asignados (proyectados a nombres
  semánticos en inglés) más los tokens semánticos que el usuario editó o
  confirmó explícitamente (status, data, escalas tonales, acentos). No se
  rellenan tokens derivados automáticamente ni se inventan para «completar»
  el sistema.
- **Mínimo para exportar**: `primario` + `fondo` + `texto` (→ `primary`,
  `background`, `on-background`). Si falta alguno, el menú Exportar se
  deshabilita y muestra qué falta.
- **Independiente de review**: «Crear guía de marca» sigue existiendo solo
  para entrar en fase de revisión; ya no es prerrequisito de exportación.
- **Nomenclatura**: inglés semántico (`--color-primary`, `surface`,
  `data-1`…), reemplazando el español del export actual.
- **Tipografía**: se incluye si hay font pairing elegido (`font-family` de
  heading y body; escala solo si ya existe en el estado).
- **Temas**: light siempre; dark solo para tokens con valor dark definido.

## Arquitectura

Pipeline de tres capas en `lib/export/` (framework-agnóstico):

1. `buildExportTokenSet(input)`: función pura que recibe el estado
   (rolePalette, overrides semánticos, status, accent family, temas,
   tipografía) y decide qué se exporta.
2. `ExportTokenSet`: estructura intermedia normalizada.
3. Serializadores que consumen el mismo set: `toCss`, `toW3cJson`,
   `toTokensStudio`, y `generateDesignMd` actualizado.

La UI (`ExportMenu` / `useWorkspaceExports`) solo elige formato, descarga
vía `downloadTextFile` y muestra el aviso de mínimo incompleto; no decide
qué tokens entran.

### ExportTokenSet

```ts
type ExportTokenSet = {
  name: string;
  exportedAt: string;
  colors: {
    [token: string]: { light: string; dark?: string };
  };
  typography?: {
    heading?: { family: string; weight?: number; size?: string };
    body?: { family: string; weight?: number; size?: string };
  };
  meta: {
    included: string[];    // tokens que sí entraron
    missingCore: string[]; // del mínimo, si aplica
  };
};
```

## Formatos de salida

| Formato | Archivo | Contenido |
|---------|---------|-----------|
| CSS (`toCss`) | `tokens.css` | `--color-*` en `:root`; dark en `[data-theme="dark"]`; `--font-heading` / `--font-body` si hay tipografía |
| W3C / Style Dictionary (`toW3cJson`) | `tokens.json` | `$value` / `$type` por token, agrupado en color y typography |
| Tokens Studio (`toTokensStudio`) | `figma-tokens.json` | Shape esperado por el plugin: grupos `color` / `fontFamilies`, modos light/dark si hay dark |
| Documento legible | `DESIGN.md` | `generateDesignMd` actualizado para leer del set (misma lista, inglés) |

El `brand-kit.json` actual sigue existiendo como paquete todo-en-uno, sin
bloquearse por «Crear guía», pero no es el path principal de tokens.

## UI

- `ExportMenu` deja de depender de `isReviewPhase`; usa `canExport` basado
  en el mínimo. Si no se cumple: deshabilitado + texto corto con la lista
  de `missingCore`.
- Opciones del menú: CSS variables · Design tokens (JSON) · Figma
  (Tokens Studio) · DESIGN.md · Brand kit.

## Errores y casos borde

- Rol sin hex → no entra.
- Override semántico vacío o inválido → se ignora.
- Sin pairing → bloque `typography` omitido.
- Sin dark → solo light en todos los formatos.
- Nombre del kit: el del workspace, o `craftie-tokens` por defecto.

## Pruebas (unit, en `/lib`)

1. `buildExportTokenSet`: solo roles + overrides; excluye derivados no
   tocados.
2. Mínimo: con 2 de 3 core → `missingCore` correcto; con 3 → exportable.
3. Cada serializador: asserts de shape (CSS con `--color-*`, W3C con
   `$value`/`$type`, Tokens Studio JSON parseable).
4. Tipografía: con y sin pairing.

## Fuera de alcance

- Checkboxes por token/grupo en un diálogo de export.
- Style Dictionary como dependencia.
- Figma Variables nativas / API Enterprise.
- Persistencia en Supabase.
- Escala tipográfica completa si aún no existe en el estado.
