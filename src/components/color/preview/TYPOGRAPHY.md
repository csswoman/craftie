# Guía tipográfica de los layout previews

> Aplica a los previews de `src/components/color/preview/` (Dashboard, Landing,
> Media, Analytics) y a **cualquier layout nuevo** que se agregue a este set.

## Para qué existen estos previews

Cada layout muestra al usuario **su paleta + su par tipográfico** (heading +
body) aplicados a una UI realista. Por eso las dos familias tienen que verse y
diferenciarse, y la jerarquía tiene que leerse. El error a evitar: que todo se
vea en negritas del mismo tamaño — ahí no se distingue ni la fuente de titulares
de la de cuerpo, ni el orden de importancia.

**Regla base:** la jerarquía se construye con **tamaño + peso + color**, no solo
con peso. `font-bold` en todo = ninguna jerarquía.

## El sistema de roles (fuente de verdad)

Usa los helpers de [`previewTypography.ts`](./previewTypography.ts). Devuelven un
objeto `style`; el tamaño (`text-[…]`) se queda como clase Tailwind en el call
site para conservar los pasos responsive de cada layout.

| Rol | Helper | Familia | Peso | Tracking | Uso |
|-----|--------|---------|------|----------|-----|
| **Display** | `displayStyle(fonts)` | heading | 600 | -0.01em | El número/título héroe de una superficie (KPI, precio, "38 launches"). Uno por card. |
| **Hero** | `heroStyle(fonts)` | heading | 700 | -0.02em | Titular grande de landing. `text-wrap: balance` incluido. |
| **Heading** | `headingStyle(fonts)` | heading | 600 | -0.006em | Títulos de panel/sección ("Activity", "Channel performance"). |
| **Title** | `titleStyle(fonts)` | body | 500 | normal | Títulos chicos de card, nombres en listas, nombre de track. |
| **Body** | `bodyStyle(fonts, color?)` | body | 400 | normal | Prosa, descripciones, ayuda, metadatos largos. |
| **Label** | `labelStyle(fonts, color?)` | body | 500 | normal | Etiquetas de métrica, nav, timestamps. |
| **Eyebrow** | `eyebrowStyle(fonts, color?)` | body | 500 | 0.06em + UPPERCASE | El kicker pequeño encima de un título ("Week overview", "Now playing"). |

### Por qué así

- **Heading font solo en display/hero/heading.** El resto va en body font. Así
  el par tipográfico se percibe: titulares con una voz, contenido con otra.
- **El cuerpo va en peso 400.** Es lo que hace que un 600 se lea como énfasis.
  Si el cuerpo es 600, no hay contraste.
- **Números grandes → `tabular-nums`.** KPIs, precios y stats no deben bailar.
- **Botones/CTAs:** body font a peso 600 (`{ ...labelStyle(fonts), fontWeight: 600 }`).
  No uses la heading font en botones.

## Letter spacing

- **Titulares (heading/display):** tracking negativo (-0.006em a -0.02em). Cuanto
  más grande el tamaño, más apretado — evita que las letras se vean sueltas. Piso
  duro: **nunca menos de -0.04em** (las letras se tocan).
- **Cuerpo y títulos:** tracking normal (0). No apretar texto pequeño.
- **Eyebrows en mayúsculas:** tracking positivo **+0.06em**. Las versalitas sin
  aire se leen apretadas; el tracking las abre.

## Color de las fuentes (grises para subtítulos)

Tres niveles, todos verificados a contraste WCAG por el motor de tokens:

- **`colors.text`** — títulos y contenido principal. Contraste alto.
- **`colors.mutedText`** — subtítulos, descripciones, metadatos, timestamps,
  eyebrows. Es el "gris" para texto secundario. Pásalo como 2º arg a
  `bodyStyle`/`labelStyle`/`eyebrowStyle`.
- **`onHero` / `supportSurfaceText`** — texto sobre superficies de color; usa el
  slot que corresponda, no `mutedText`.

Reglas:

- **No inventes grises con opacidad sobre fondos de color.** Sobre superficies
  tintadas usa el slot de texto de esa superficie (`supportSurfaceText`,
  `onHero`), no `text-black/60`.
- **El subtítulo va en `mutedText`, el título en `text`.** Ese salto de color es
  parte de la jerarquía, junto con el de tamaño y peso.
- Nunca dependas solo del color para jerarquía: tamaño + peso también cambian.

## Line height y medida

- **Titulares:** `line-height` 1.04–1.2 (más apretado cuanto más grande).
- **Cuerpo:** 1.55 (lo trae `bodyStyle`).
- **Medida de prosa:** tope 65–75ch. Usa `max-w-[52ch]` / `max-w-[60ch]` en
  descripciones largas, no `max-w-sm/xl` arbitrarios.
- **`text-wrap: balance`** en titulares de 2+ líneas (`heroStyle` ya lo trae;
  para displays largos añádelo: `{ ...displayStyle(fonts), textWrap: 'balance' }`).

## Checklist para un layout nuevo

1. El contenedor raíz setea `fontFamily: fonts.bodyFamily` (base = body font).
2. Todo titular usa un helper de heading (`display`/`hero`/`heading`), nunca
   `fonts.headingFamily` suelto con `font-bold`.
3. Todo texto de cuerpo/label/eyebrow usa su helper con la **body font**.
4. Subtítulos y metadatos en `mutedText`.
5. Máximo un `display` por card; el resto baja de nivel.
6. Números con `tabular-nums`.
7. Prosa ≤ 75ch.
8. `npx tsc --noEmit` y `npx eslint src/components/color/preview/` limpios.

## Ejemplo mínimo

```tsx
import { bodyStyle, displayStyle, eyebrowStyle, headingStyle, type PreviewFonts } from './previewTypography';

<section style={{ fontFamily: fonts.bodyFamily }}>
  <p className="text-[0.6875rem]" style={eyebrowStyle(fonts, colors.mutedText)}>Week overview</p>
  <h2 className="text-[1.5rem]" style={{ ...displayStyle(fonts), textWrap: 'balance' }}>Revenue operations</h2>

  <h3 className="text-[1.125rem]" style={headingStyle(fonts)}>Activity</h3>
  <p className="text-[0.8125rem]" style={bodyStyle(fonts, colors.mutedText)}>
    Keep the chrome quiet so the palette is judged on hierarchy and data color.
  </p>
</section>
```
