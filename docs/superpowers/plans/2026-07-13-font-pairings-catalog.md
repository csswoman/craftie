# Font pairings catalog expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand `CURATED_FONT_PAIRS` with Google-Fonts-only pairings from the approved list so they appear in `PairingList`, without changing filter UI.

**Architecture:** Keep the public export `CURATED_FONT_PAIRS` from `lib/typography/fontPairLibrary.ts`. Split new entries into category modules under `lib/typography/pairs/` and concatenate with the existing curated list. Deduplicate by heading+body family pair. Only include fonts available on Google Fonts.

**Tech Stack:** TypeScript, existing `FontPair` / `FontMeta` types, Vitest (or project test runner), Google Fonts specimen URLs.

**Spec:** `docs/superpowers/specs/2026-07-13-font-pairings-catalog-design.md`

---

## File structure

| File | Responsibility |
| --- | --- |
| `lib/typography/pairings.ts` | Types + `FONT_PAIRS` re-export (unchanged API) |
| `lib/typography/fontPairLibrary.ts` | Assembles `CURATED_FONT_PAIRS` from modules |
| `lib/typography/pairs/legacy.ts` | Current ~20 curated pairs (moved as-is) |
| `lib/typography/pairs/sansSans.ts` | New Sans + Sans pairs |
| `lib/typography/pairs/sansSerif.ts` | New Sans + Serif pairs |
| `lib/typography/pairs/displaySans.ts` | New Display + Sans pairs |
| `lib/typography/pairs/monoSans.ts` | New Mono + Sans pairs |
| `lib/typography/pairs/friendly.ts` | Friendly / rounded pairs |
| `lib/typography/pairs/accessible.ts` | Accessibility pairs |
| `lib/typography/pairs/singleFamily.ts` | Same family for heading and body |
| `lib/typography/pairs/index.ts` | Concatenate arrays (no dedupe logic beyond assembly order) |
| `lib/typography/pairings.test.ts` | Relax size bound; assert uniqueness and Google Fonts refs |

**Excluded fonts (never use):** Geist, Geist Mono, Satoshi, General Sans, Clash Display, Clash Grotesk, Cabinet Grotesk, Switzer.

**Skipped as duplicates of legacy (same heading+body families):** `JetBrains Mono` + `Inter`.

---

### Task 1: Relax catalog size test (TDD)

**Files:**
- Modify: `lib/typography/pairings.test.ts`

- [ ] **Step 1: Update the catalog size assertion**

Replace:

```ts
it('exports a curated library of about 20 pairs with character hooks', () => {
  expect(FONT_PAIRS.length).toBeGreaterThanOrEqual(18);
  expect(FONT_PAIRS.length).toBeLessThanOrEqual(22);
  expect(FONT_PAIRS.every((pair) => pair.displayName && pair.character.length > 0)).toBe(true);
  expect(FONT_PAIRS.every((pair) => pair.heading.googleFontsRef && pair.body.googleFontsRef)).toBe(true);
});
```

With:

```ts
it('exports a curated Google Fonts library with character hooks', () => {
  expect(FONT_PAIRS.length).toBeGreaterThanOrEqual(70);
  expect(FONT_PAIRS.every((pair) => pair.displayName && pair.character.length > 0)).toBe(true);
  expect(
    FONT_PAIRS.every((pair) => pair.heading.googleFontsRef && pair.body.googleFontsRef),
  ).toBe(true);
  expect(
    FONT_PAIRS.every((pair) =>
      pair.heading.googleFontsRef.startsWith('https://fonts.google.com/specimen/') &&
      pair.body.googleFontsRef.startsWith('https://fonts.google.com/specimen/'),
    ),
  ).toBe(true);

  const familyKeys = FONT_PAIRS.map(
    (pair) => `${pair.heading.family}::${pair.body.family}`,
  );
  expect(new Set(familyKeys).size).toBe(familyKeys.length);

  const ids = FONT_PAIRS.map((pair) => pair.id);
  expect(new Set(ids).size).toBe(ids.length);
});
```

- [ ] **Step 2: Run test and confirm it fails on length**

Run:

```bash
npm test -- lib/typography/pairings.test.ts
```

Expected: FAIL because `FONT_PAIRS.length` is still ~20 (`expected >= 70`).

- [ ] **Step 3: Commit only if the user explicitly asked to commit**

Do not commit unless the user requested a commit in this conversation.

---

### Task 2: Move legacy pairs into `pairs/legacy.ts`

**Files:**
- Create: `lib/typography/pairs/legacy.ts`
- Modify: `lib/typography/fontPairLibrary.ts`

- [ ] **Step 1: Create `lib/typography/pairs/legacy.ts`**

Move the current `CURATED_FONT_PAIRS` array contents unchanged into:

```ts
import type { FontPair } from '../pairings';

export const LEGACY_FONT_PAIRS: FontPair[] = [
  // …paste the existing 20 objects from fontPairLibrary.ts exactly…
];
```

- [ ] **Step 2: Point `fontPairLibrary.ts` at legacy only (temporary)**

```ts
import type { FontPair } from './pairings';
import { LEGACY_FONT_PAIRS } from './pairs/legacy';

export const CURATED_FONT_PAIRS: FontPair[] = [...LEGACY_FONT_PAIRS];
```

- [ ] **Step 3: Run tests**

Run:

```bash
npm test -- lib/typography/pairings.test.ts
```

Expected: Still FAIL on `length >= 70` (legacy-only). All other pairings tests that mock `FONT_PAIRS` should still pass.

---

### Task 3: Add Sans + Sans module

**Files:**
- Create: `lib/typography/pairs/sansSans.ts`

Each entry must follow the existing `FontPair` shape. Specimen URL pattern:

`https://fonts.google.com/specimen/` + family with spaces as `+`.

- [ ] **Step 1: Create the file with these pairs**

| id | displayName | heading | body | character | mood (suggested) | rationale |
| --- | --- | --- | --- | --- | --- | --- |
| `sans-inter-krub` | Tech limpio | Inter | Krub | technical, minimal | técnico, moderno | Sans limpia para SaaS y dashboards. |
| `sans-montserrat-karla` | Geométrico humanista | Montserrat | Karla | geometric, warm | geométrico, confiable | Geometría suave con cuerpo humanista. |
| `sans-poppins-open-sans` | Moderno web | Poppins | Open Sans | geometric, minimal | moderno, digital | Par versátil para web apps. |
| `sans-roboto-nunito` | Neutro amigable | Roboto | Nunito | warm, technical | cálido, confiable | Neutro Android/móvil con cuerpo amable. |
| `sans-work-source` | Profesional digital | Work Sans | Source Sans 3 | technical, minimal | preciso, profesional | Profesional para productos digitales. |
| `sans-manrope-inter` | Premium producto | Manrope | Inter | technical, minimal | moderno, preciso | Premium para fintech y productividad. |
| `sans-space-grotesk-inter` | Tech moderno | Space Grotesk | Inter | technical, geometric | técnico, moderno | Tech moderno para IA, Web3 y startups. |
| `sans-syne-inter` | Branding fuerte | Syne | Inter | bold, geometric | expresivo, moderno | Titulares con voz de marca fuerte. |
| `sans-prompt-rubik` | Redondeado EdTech | Prompt | Rubik | warm | cálido, amable | Redondeado amable para educación. |
| `sans-albert-barlow` | Minimalista SaaS | Albert Sans | Barlow | minimal, technical | minimal, preciso | Minimalista para SaaS y portfolios. |
| `sans-reddit-sora` | Contemporáneo social | Reddit Sans | Sora | geometric, technical | moderno, digital | Contemporáneo para apps sociales. |
| `sans-urbanist-redhat` | Elegante fintech | Urbanist | Red Hat Display | elegant, minimal | elegante, moderno | Elegante para fintech. |
| `sans-mulish-karla` | Calmado wellness | Mulish | Karla | warm, minimal | sereno, cálido | Calmado para wellness. |
| `sans-bricolage-inter` | Creativo IA | Bricolage Grotesque | Inter | bold, technical | expresivo, técnico | Creativo para productos de IA. |
| `sans-outfit-inter` | Limpio moderno | Outfit | Inter | geometric, minimal | moderno, limpio | Limpio para apps modernas. |
| `sans-outfit-manrope` | Elegante SaaS | Outfit | Manrope | geometric, elegant | elegante, moderno | Elegante para SaaS. |
| `sans-sora-inter` | Tecnología AI | Sora | Inter | technical, geometric | técnico, moderno | Tecnología para productos de AI. |

Implement every row as a full `FontPair` object. Example for the first:

```ts
{
  id: 'sans-inter-krub',
  displayName: 'Tech limpio',
  heading: {
    family: 'Inter',
    googleFontsRef: 'https://fonts.google.com/specimen/Inter',
    classification: 'sans-serif',
    contrast: 'medium',
    xHeight: 'high',
    personality: ['neutral', 'legible'],
    bestFor: 'heading',
  },
  body: {
    family: 'Krub',
    googleFontsRef: 'https://fonts.google.com/specimen/Krub',
    classification: 'sans-serif',
    contrast: 'medium',
    xHeight: 'high',
    personality: ['limpia', 'digital'],
    bestFor: 'body',
  },
  rationale: 'Sans limpia para SaaS y dashboards.',
  mood: ['técnico', 'moderno'],
  character: ['technical', 'minimal'],
},
```

Classification defaults: both `sans-serif`; Syne heading may use `display` if it reads more display-like; Bricolage Grotesque heading: `display` or `sans-serif` — use `display` for Bricolage/Syne headings.

- [ ] **Step 2: Do not wire into library yet** (next task wires all modules together)

---

### Task 4: Add Sans + Serif module

**Files:**
- Create: `lib/typography/pairs/sansSerif.ts`

- [ ] **Step 1: Create pairs**

| id | displayName | heading | body | character | mood | rationale |
| --- | --- | --- | --- | --- | --- | --- |
| `serif-playfair-lato` | Editorial moda | Playfair Display | Lato | editorial, elegant | editorial, elegante | Editorial para moda. |
| `serif-raleway-merriweather` | Elegante blogs | Raleway | Merriweather | editorial, elegant | editorial, elegante | Elegante para blogs. |
| `serif-montserrat-lora` | Clásico moderno | Montserrat | Lora | editorial, geometric | editorial, moderno | Clásico moderno para contenido. |
| `serif-roboto-lora` | UI y lectura | Roboto | Lora | editorial, technical | editorial, confiable | UI + lectura para noticias. |
| `serif-source-alegreya` | Docs artículos | Source Sans 3 | Alegreya | editorial | editorial, institucional | Documentación y artículos. |
| `serif-dm-serif-dm-sans` | Editorial revistas | DM Serif Display | DM Sans | editorial, elegant | editorial, elegante | Editorial para revistas. |
| `serif-fraunces-inter` | Moderno branding | Fraunces | Inter | editorial, warm | cálido, editorial | Moderno para branding. |
| `serif-libre-baskerville-source` | Tradicional lectura | Libre Baskerville | Source Sans 3 | editorial | editorial, confiable | Tradicional para lectura. |
| `serif-cormorant-proza` | Lujo premium | Cormorant Garamond | Proza Libre | editorial, elegant | elegante, editorial | Lujo para marcas premium. |
| `serif-ibm-plex` | Enterprise B2B | IBM Plex Serif | IBM Plex Sans | editorial, technical | institucional, preciso | Enterprise B2B. |
| `serif-noto-pair` | Global multilenguaje | Noto Serif | Noto Sans | editorial, accessible | editorial, confiable | Global multilenguaje. |
| `serif-zilla-lexend` | Accesible educación | Zilla Slab | Lexend | accessible, warm | cálido, accesible | Accesible para educación. |
| `serif-spectral-inter` | Editorial blogs | Spectral | Inter | editorial, minimal | editorial, sereno | Editorial para blogs modernos. |
| `serif-newsreader-inter` | Revistas contenido | Newsreader | Inter | editorial | editorial, moderno | Revistas y contenido. |
| `serif-bitter-source` | Docs técnicos | Bitter | Source Sans 3 | editorial, technical | editorial, preciso | Documentación y blogs técnicos. |
| `serif-literata-inter` | Lectura educativa | Literata | Inter | editorial, accessible | editorial, cálido | Lectura para apps educativas. |

Heading classifications: serif/display as appropriate (`DM Serif Display` → `display` or `serif`; prefer `serif` for body-facing serifs and `display` for display serifs like Playfair/DM Serif Display/Fraunces). Body sans → `sans-serif`; Alegreya/Lora/Merriweather/Proza Libre as body → `serif` when those are the body face.

Note: `Source Sans 3` + `Alegreya` has sans heading + serif body (swap relative to many others) — keep as listed.

---

### Task 5: Add Display + Sans module

**Files:**
- Create: `lib/typography/pairs/displaySans.ts`

- [ ] **Step 1: Create pairs**

| id | displayName | heading | body | character | mood | rationale |
| --- | --- | --- | --- | --- | --- | --- |
| `display-space-mono-jakarta` | Herramientas dev | Space Mono | Plus Jakarta Sans | technical, bold | técnico, moderno | Herramientas para desarrolladores. |
| `display-space-mono-grotesk` | Web3 creativo | Space Mono | Space Grotesk | technical, geometric | técnico, digital | Voz Web3. |
| `display-bebas-work` | Deportes impacto | Bebas Neue | Work Sans | bold | enérgico, directo | Deportes e impacto. |
| `display-archivo-black-archivo` | B2B fuerte | Archivo Black | Archivo | bold, technical | enérgico, institucional | B2B con presencia. |
| `display-gravitas-poppins` | Branding display | Gravitas One | Poppins | bold, warm | expresivo, cálido | Branding con display. |
| `display-unbounded-inter` | Creatividad | Unbounded | Inter | bold, geometric | expresivo, moderno | Creatividad. |
| `display-syne-syne` | Branding Syne | Syne | Syne | bold, geometric | expresivo, moderno | Branding con una sola voz Syne. |
| `display-league-spartan-inter` | Marketing | League Spartan | Inter | bold | enérgico, moderno | Marketing. |
| `display-oswald-inter` | Noticias | Oswald | Inter | bold, technical | directo, moderno | Noticias. |
| `display-anton-inter` | Impacto | Anton | Inter | bold | enérgico, directo | Impacto máximo. |
| `display-archivo-narrow-inter` | Dashboards densos | Archivo Narrow | Inter | technical, compact | técnico, preciso | Dashboards densos. |
| `display-bricolage-manrope` | IA creativa | Bricolage Grotesque | Manrope | bold, warm | expresivo, moderno | IA creativa. |

Heading classification: mostly `display` or `monospace` for Space Mono. Archivo Narrow / Oswald: `sans-serif` is fine if not display; Bebas Neue / Anton / Gravitas One / Archivo Black / Unbounded / League Spartan → `display`.

---

### Task 6: Add Mono + Sans, Friendly, Accessible, Single-family

**Files:**
- Create: `lib/typography/pairs/monoSans.ts`
- Create: `lib/typography/pairs/friendly.ts`
- Create: `lib/typography/pairs/accessible.ts`
- Create: `lib/typography/pairs/singleFamily.ts`

- [ ] **Step 1: `monoSans.ts`**

| id | displayName | heading | body | character |
| --- | --- | --- | --- | --- |
| `mono-roboto-roboto` | Código Roboto | Roboto Mono | Roboto | technical |
| `mono-ibm-plex` | Enterprise mono | IBM Plex Mono | IBM Plex Sans | technical |
| `mono-space-inter` | Developer | Space Mono | Inter | technical |
| `mono-firacode-inter` | Dev tools | Fira Code | Inter | technical |

Skip JetBrains Mono + Inter (already in legacy).

Rationale/mood: técnico / preciso; character: `technical`.

- [ ] **Step 2: `friendly.ts`**

| id | displayName | heading | body | character |
| --- | --- | --- | --- | --- |
| `friendly-caveat-karla` | Onboarding cálido | Caveat | Karla | warm |
| `friendly-aboreto-gotu` | Lifestyle | Aboreto | Gotu | warm |
| `friendly-sniglet-mplus` | Niños | Sniglet | M PLUS Rounded 1c | warm |
| `friendly-quicksand-nunito` | Educación redonda | Quicksand | Nunito | warm |
| `friendly-baloo-nunito` | Apps infantiles | Baloo 2 | Nunito | warm |
| `friendly-comfortaa-rubik` | Casual | Comfortaa | Rubik | warm |

Heading: Caveat/Aboreto/Sniglet → `display`; Quicksand/Baloo 2/Comfortaa → `sans-serif`. Body Gotu / M PLUS Rounded 1c → `sans-serif`.

Specimen for M PLUS Rounded 1c: `https://fonts.google.com/specimen/M+PLUS+Rounded+1c`

- [ ] **Step 3: `accessible.ts`**

| id | displayName | heading | body | character |
| --- | --- | --- | --- | --- |
| `a11y-atkinson-inter` | Inclusividad | Atkinson Hyperlegible | Inter | accessible, minimal |
| `a11y-lexend-zilla` | Lectura rápida | Lexend | Zilla Slab | accessible, warm |
| `a11y-inter-noto` | Productos globales | Inter | Noto Sans | accessible, technical |
| `a11y-noto-sans-serif` | Internacionalización | Noto Sans | Noto Serif | accessible, editorial |

- [ ] **Step 4: `singleFamily.ts`** (heading family === body family)

| id | displayName | family | character |
| --- | --- | --- | --- |
| `family-inter` | Familia Inter | Inter | minimal, technical |
| `family-manrope` | Familia Manrope | Manrope | minimal, technical |
| `family-plus-jakarta` | Familia Plus Jakarta | Plus Jakarta Sans | geometric, minimal |
| `family-ibm-plex-sans` | Familia IBM Plex Sans | IBM Plex Sans | technical |
| `family-source-sans` | Familia Source Sans 3 | Source Sans 3 | technical, minimal |
| `family-work-sans` | Familia Work Sans | Work Sans | technical, minimal |
| `family-sora` | Familia Sora | Sora | geometric, technical |
| `family-outfit` | Familia Outfit | Outfit | geometric, minimal |
| `family-instrument-sans` | Familia Instrument Sans | Instrument Sans | minimal, technical |
| `family-urbanist` | Familia Urbanist | Urbanist | elegant, minimal |
| `family-redhat-display` | Familia Red Hat Display | Red Hat Display | elegant, technical |
| `family-rubik` | Familia Rubik | Rubik | warm, geometric |
| `family-nunito` | Familia Nunito | Nunito | warm |
| `family-mulish` | Familia Mulish | Mulish | warm, minimal |
| `family-roboto` | Familia Roboto | Roboto | technical, minimal |
| `family-open-sans` | Familia Open Sans | Open Sans | warm, accessible |

For single-family rows: both `FontMeta` use the same family; heading `bestFor: 'heading'`, body `bestFor: 'body'`; `rationale` like `Una sola familia versátil para producto digital.`

Skip Geist / General Sans / Satoshi / Switzer.

---

### Task 7: Wire modules and pass tests

**Files:**
- Create: `lib/typography/pairs/index.ts`
- Modify: `lib/typography/fontPairLibrary.ts`

- [ ] **Step 1: Create `pairs/index.ts`**

```ts
import type { FontPair } from '../pairings';
import { LEGACY_FONT_PAIRS } from './legacy';
import { SANS_SANS_PAIRS } from './sansSans';
import { SANS_SERIF_PAIRS } from './sansSerif';
import { DISPLAY_SANS_PAIRS } from './displaySans';
import { MONO_SANS_PAIRS } from './monoSans';
import { FRIENDLY_PAIRS } from './friendly';
import { ACCESSIBLE_PAIRS } from './accessible';
import { SINGLE_FAMILY_PAIRS } from './singleFamily';

export const CURATED_FONT_PAIRS: FontPair[] = [
  ...LEGACY_FONT_PAIRS,
  ...SANS_SANS_PAIRS,
  ...SANS_SERIF_PAIRS,
  ...DISPLAY_SANS_PAIRS,
  ...MONO_SANS_PAIRS,
  ...FRIENDLY_PAIRS,
  ...ACCESSIBLE_PAIRS,
  ...SINGLE_FAMILY_PAIRS,
];
```

Export names in each module must match (`SANS_SANS_PAIRS`, etc.).

- [ ] **Step 2: Simplify `fontPairLibrary.ts`**

```ts
export { CURATED_FONT_PAIRS } from './pairs';
```

- [ ] **Step 3: Run typography tests**

```bash
npm test -- lib/typography/
```

Expected: all pass, including `FONT_PAIRS.length >= 70` and unique ids/family keys.

- [ ] **Step 4: Manual smoke (optional)**

Start the app, open font pairing panel, confirm new cards appear under Todos and that filters still work. Selecting a pair should load Google Fonts without console 404s for family names.

- [ ] **Step 5: Commit only if the user explicitly asked**

Suggested message if requested:

```text
feat(typography): expand curated Google Fonts pairing catalog
```

---

## Self-review (plan vs spec)

| Spec requirement | Task |
| --- | --- |
| Expand catalog GF-only | Tasks 3–6 |
| Exclude commercial faces | Explicit exclusion list + skipped rows |
| Keep existing pairs | Task 2 legacy module |
| No PairingList UI filter changes | No UI tasks |
| Update test bounds / uniqueness | Task 1 |
| `fontPairLibrary` remains export surface | Task 7 |
| Single-family pairs | Task 6 |
| Deduplicate JetBrains Mono + Inter | Noted skip in Task 6 |

No TBD placeholders. Export names are consistent across Task 7 and module tasks.

**Expected approximate count:** 20 legacy + 17 sans-sans + 16 sans-serif + 12 display + 4 mono + 6 friendly + 4 a11y + 16 single-family ≈ **95** pairs (above the test floor of 70).
