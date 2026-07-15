# Typography panel: selector → canvas specimen — Design Spec

**Date:** 2026-07-14  
**Status:** Approved (product prompt authored by user)  
**Supersedes:** densify/search Approach A expand-on-select in `2026-07-14-font-pairing-list-density-design.md` for tools-tab UX  
**Scope:** Tipografía tab only. Do not change Colores. Maquetas only via the canvas type-token contract (§7).

## Problem

The typography panel competes with the canvas as the specimen (expanded in-card preview). Filters are duplicated (select + category list). Nested scroll hurts navigation. There is no control that visibly changes layout type (base size, scale, weights). Pairs are closed packages (cannot pin heading and explore bodies). Custom fonts are missing.

## Goal

**Panel = selector + type system knobs. Canvas = specimen.**  
Every control in the panel must change the maqueta visibly.

## Out of scope

- Colores tab behavior  
- Redesigning layout mockup composition (only type token wiring)  
- Long-press preview on touch  
- Promoting `--weight-ui` to a third editable role in the Applied zone (reserved for later)

## Locked decisions

| Topic | Choice |
|-------|--------|
| Scroll | One scrollable: Tipografía tab. List has **no** own `overflow-y-auto` / `max-height`. Applied zone `position: sticky; top: 0` with opaque bg + z-index |
| Filters | Horizontal chips only (Todas · Editorial · Técnico · Cálido · Minimal). Remove category `<select>` and category suggestion list |
| Search | Render **only if** `pairs.length >= 20`. Keep implementation behind that guard |
| Row density | Constant height. No expand / no in-card Titular·Cuerpo preview block |
| Selected chrome | Teal border + soft fill + **3px left bar** (product override of generic anti-side-stripe for this select pattern) |
| Hover | Desktop: `mouseenter` → non-destructive canvas preview + badge; `mouseleave` → revert to applied; `click` → apply (respect pins). Touch: click applies; no hover preview |
| Pins | `pinHeading` / `pinBody` break closed pairs; both on → list inert for apply (valid). Hybrid applied → **no** list row marked selected |
| UI weight | Option **(a)**: `--weight-ui: 600` implicit for chrome UI in maquetas |
| Specimen copy | Heading: **"Ship the brand story"** (landing h1 continuity). Body: **"El cuerpo se mantiene neutro y la paleta lleva la personalidad."** |
| Applied label | Single zone eyebrow **APLICADO** (not repeated on every subsection) |
| Catalog weights | Per-pair (e.g. Lora 600 / Inter 400); defaults 700 / 400 only when meta omits weight |

---

## 1. Panel layout

```
┌─ APLICADO (sticky; single uppercase zone label) ───┐
│  Titular / Cuerpo + weights + pins                 │
│  Base · Ratio · readout h1…small                   │
├─ Filtros ──────────────────────────────────────────┤
│  chips (scroll away); search if n≥20               │
├─ Lista (flows with panel scroll) ──────────────────┤
│  constant-height rows…                             │
│  [＋ Fuente personalizada]                         │
└────────────────────────────────────────────────────┘
```

**Scroll rules (acceptance-critical)**

1. Tipografía tab panel is the only `overflow-y-auto` for this content.  
2. Remove nested list scroll from `PairingList` (`overflow-y-auto`, `max-h-*`, `flex-1 min-h-0` scroll traps that create a second bar).  
3. Applied = sticky. Chips = **not** sticky.

Map in Craftie: `SelectColorsWorkspaceSidebar` tabpanel tipografía currently uses `overflow-hidden` + nested list scroll — invert so tabpanel scrolls and Applied sticks inside it.

---

## 2. Applied zone

### Role rows

- Family name + weight badge (`tabular-nums`) + pin toggle per role (heading / body).

### Pins (break closed pair)

| State | Hover / click on catalog row |
|-------|------------------------------|
| neither | Preview/apply full pair |
| `pinHeading` | Only body updates from row |
| `pinBody` | Only heading updates from row |
| both | List navigable; apply/hover does not change applied fonts (inert) |

When resulting applied state is a **hybrid** (not equal to any catalog `id`), **no** row shows selected chrome.

### Knobs

- **Base:** 14 / 16 / 18 — default **16**  
- **Ratio:** 1.125 / 1.25 / 1.333 — default **1.25**  

### Readout

`size(n) = round(base * ratio^n)`

| Token | n |
|-------|---|
| h1 | 3 |
| h2 | 2 |
| h3 | 1 |
| body | 0 |
| small | -1 |

Show all five px values live (developer-facing; always visible).

---

## 3. Filters

- Replace select + category suggestions with chips: Todos / Editorial / Técnico / Cálido / Minimal.  
- Active: solid (dark fill, light text). Inactive: outline.  
- No repeated “Categoría” labels.  
- Search: gate `pairs.length >= 20`. Component may remain in tree behind the guard.

Filter values map to existing `FontPair.character` tags: `editorial`, `technical`, `warm`, `minimal` (+ `all`).

---

## 4. Pair rows

Constant height. Structure:

```
SPACE GROTESK · WORK SANS                    700 / 400
Ship the brand story              ← heading family @ heading weight
El cuerpo se mantiene neutro y la paleta lleva la personalidad.
```

- Meta line: family names uppercase, muted, small.  
- Weights right-aligned (`tabular-nums`); **per-pair** when defined on catalog meta.  
- Specimen phrases (not font names as sample text):  
  - Heading: **“Ship the brand story”**  
  - Body: **“El cuerpo se mantiene neutro y la paleta lleva la personalidad.”**  
- Remove `PairSpecimenPreview` expand block from tools list entirely.  
- Selected (catalog match only): border + tint + 3px left bar; no height change.

---

## 5. Hover / click (highest impact)

| Event | Action |
|-------|--------|
| `mouseenter` row | Canvas re-renders with **hovered** rendering pair (non-destructive). Badge: “Vista previa — clic para aplicar” |
| `mouseleave` row | Canvas back to **applied**. Badge off |
| `click` row | Commit to **applied** (respect pins). Badge off |

- `hovered` is separate from `applied` and wins for canvas render when set.  
- `prefers-reduced-motion`: no font transition choreography — hard swap.  
- Touch: no hover path; click applies.

---

## 6. Custom fonts

- End of list: `＋ Fuente personalizada` (dashed/outline).  
- Modal/panel:  
  - Google Fonts: family name → validate → inject stylesheet link.  
  - Local: `.woff2` / `.ttf` / `.otf` → `FontFace` + `document.fonts.add()`.  
- Assign to **one role** (heading or body); does **not** create a curated catalog pair.  
- Session persistence; listed apart from curated pairs.  
- Browser-only adapter under `src/lib/browser`; pure types/state helpers in `/lib`.

---

## 7. Canvas type-token contract

Set CSS custom properties on the canvas/preview root:

```css
--font-heading: …;
--font-body: …;
--weight-heading: 700;
--weight-body: 400;
--weight-ui: 600;
--size-h1: …px;
--size-h2: …px;
--size-h3: …px;
--size-body: …px;
--size-small: …px;
```

Refactor **dashboard**, **landing**, and **media** layout previews so they consume these tokens (via CSS vars and/or `previewTypography` helpers that read from an expanded type token object) instead of literal `fontFamily` / `fontSize` / ad-hoc `fontWeight` where those encode the brand pairing.

**Default (a):** UI chrome (buttons, labels, eyebrows, badges) uses `--font-body` + `--weight-ui` (600). Do not add a third pin row yet.

**Render source for families:** `hovered ?? applied` (effective pair / hybrid).

---

## 8. Data model (Craftie mapping)

Do **not** replace `FontPair` with a numeric `id` Pair type. Extend the existing model:

```ts
// Catalog (extend FontMeta)
type FontMeta = {
  // …existing
  defaultWeight?: number; // optional; UI may override via TypeState
};

// Workspace type state (new)
type TypeScaleBase = 14 | 16 | 18;
type TypeScaleRatio = 1.125 | 1.25 | 1.333;

type AppliedTypography = {
  /** Catalog id when applied matches a curated pair; null when hybrid/custom */
  catalogPairId: string | null;
  headingFamily: string;
  bodyFamily: string;
  headingWeight: number;
  bodyWeight: number;
};

type TypeState = {
  applied: AppliedTypography;
  hovered: AppliedTypography | null;
  base: TypeScaleBase;
  ratio: TypeScaleRatio;
  pinHeading: boolean;
  pinBody: boolean;
  filter: 'all' | 'editorial' | 'technical' | 'warm' | 'minimal';
  customFonts: CustomFont[];
};
```

- Catalog identity remains `FontPair.id` (string). Never key pairs only by family names (same family can appear in different roles/weights).  
- Default weights if missing on meta: heading **700**, body **400** (product defaults; adjustable in Applied).  
- Persistence: at least applied pair id (existing); extend session storage for pins/base/ratio/custom as needed in implementation plan.

### Scale helper (`/lib`)

```ts
function typeScaleSize(base: number, ratio: number, step: number): number {
  return Math.round(base * ratio ** step);
}
```

---

## Acceptance criteria

1. Single scroll in Tipografía; Applied stays fixed while scrolling.  
2. No category `<select>`; chips only.  
3. Search not rendered when `pairs.length < 20`.  
4. No row height change on select.  
5. Hover changes maqueta; leave reverts; applied untouched until click.  
6. Base/Ratio change maqueta sizes and readout together.  
7. With heading pinned, click changes only body; no catalog row selected when hybrid.  
8. Can load a Google Font by name and see it on the maqueta.  
9. Dashboard / landing / media previews: no brand-pairing `font-family` / type-scale `font-size` literals left outside the token system (UI may still use Tailwind for layout spacing; type sizes for brand text come from tokens).

## PR slicing (AGENTS.md: one task per PR)

| PR | Focus |
|----|--------|
| A | Flat rows + chips + scroll fix + remove expand/select-dropdown UX; specimen phrases; kill nested list scroll |
| B | Applied/hovered state + hover preview on canvas + preview badge; click apply + pins (minimum viable pins if Coupled) |
| C | Applied zone knobs (base/ratio/weights display + readout) + CSS size tokens wired to maquetas |
| D | Maqueta pass: replace literals with tokens + `--weight-ui` |
| E | Custom fonts (GF + local) + session list |

Pins may ship in B or C; prefer **B** so hybrid selection UX lands with hover/apply.

## Relationship to prior density work

Prior density/search work (expand-on-select, dropdown + suggestions) is **reverted or rewritten** to match this spec for the tools tab. Reusable pieces: `filterFontPairs` (chips still use category filter), lazy Google Font load, `PAIRING_CATEGORY_FILTERS` vocabulary.
