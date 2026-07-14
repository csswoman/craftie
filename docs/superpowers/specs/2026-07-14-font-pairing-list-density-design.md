# Font pairing list: density + search — Design Spec

**Date:** 2026-07-14  
**Status:** Approved for planning  
**Surface:** `PairingList` / `PairCard` in studio tools (and `default` variant for consistency)  
**Related critique:** `.impeccable/critique/2026-07-14T15-37-27Z__src-components-font-pairing-pairinglist-tsx.md` (23/40)

## Problem

The pairing list shows ~92 pairs as tall cards: UI `displayName`, nested bordered preview, and repeated `HEADLINE`/`BODY` labels. Users scroll more than they compare. There is no text search; only five character chips. Critique P1s: density, missing search, nested cards.

## Goals

1. Maximize visible pairs in the tools sidebar without losing a rich specimen on the **selected** row.
2. Add search + category filter (dropdown) + typeahead suggestions.
3. Keep Craftie product register: light chrome, flat surfaces, no Framer dark/favorites/code chrome.
4. Address full critique backlog for this surface (P1 + P2: quieten uppercase role labels, align category vocabulary).

## Non-goals

- Recently Used / favorites / heart / copy-code actions from external references.
- Dark mode for this panel.
- Changes to `StudioToolsPanel` shell.
- Catalog data content overhaul (pair library stays as-is unless filter vocabulary mapping needs labels).
- New steps in the product roadmap beyond typography list UX.

## Decisions (locked)

| Topic | Choice |
|-------|--------|
| Approach | **A** — compact Framer-like rows; expand specimen only when selected |
| `displayName` | Keep, smaller (meta/caption), single-line truncate |
| Category UX | Dropdown “Todas las categorías” **and** text suggestions while typing |
| Expand trigger | Selection only (not hover) |
| Scope | Density + search + nested-card fix + quieter role labels |

## Interaction & layout

### Toolbar (sticky above list)

- **Search input** (compact): placeholder “Buscar pares…”.
- **Category dropdown** (right): “Todas las categorías” + Editorial / Técnico / Cálido / Minimal (stable filter vocabulary; maps to `FontPair.character` values).
- **Suggestions panel** under the search field when focused and/or query non-empty:
  - Matching categories (from the same vocabulary)
  - Matching font families (heading or body)
  - Matching pair `displayName`s
- Keyboard: ↑↓ Enter select suggestion; Esc closes suggestions.
- Current filter **chips row is removed** (replaced by dropdown + suggestions).

### Compact row (not selected)

- `displayName`: meta/caption size, `truncate`, one line.
- Specimen line: `HeadingFamily & BodyFamily`, each segment `font-family` of that role (lazy font load preserved).
- No nested bordered box; no repeated uppercase HEADLINE/BODY labels.
- Selected chrome: existing primary border/background treatment.

### Selected row (expanded)

- Compact header remains.
- Below: stacked Headline / Body preview (generous size for tools/xl tokens), hairline separator between roles, **single** interactive container (no inner card border).
- Exactly one expanded row: the selected pairing.
- Motion: short height/opacity (150–200ms); instant or crossfade if `prefers-reduced-motion`.

### Variants

- `tools`: primary target (sidebar).
- `default` (e.g. typography canvas list): same interaction model for consistency.

## Architecture

### `/lib` (framework-agnostic)

| Module | Responsibility |
|--------|----------------|
| `filterFontPairs(pairs, { query, category })` | Filter by category (`character` includes) and case-insensitive query over `displayName`, heading/body `family` |
| `suggestFontPairs(pairs, query, limit)` | Return ranked suggestions: `{ type: 'category' \| 'family' \| 'pair'; label: string; value: string }` |
| Category vocabulary helper | Export stable UI categories (`all` + four labels) and their `character` keys |

Query empty + category `all` → full list. When the search input is focused with an empty query, show category suggestions (the four named filters) to aid discovery; hide the panel on blur unless a keyboard selection is in progress.

### UI components (`src/components/font-pairing/`)

| Component | Role |
|-----------|------|
| `PairingList` | Owns `query`, `category`, suggestions open/active index; wires filter; renders toolbar + list |
| `PairingSearchToolbar` | Search input, category `<select>` or disclosure listbox, suggestions popover |
| `PairRow` (refactor of `PairCard`) | Compact row; when `selected`, renders specimen block |
| `PairSpecimenPreview` | Stacked headline/body without nested card; consumes `fontsReady` |

Preserve `LazyPairCard` / IntersectionObserver font loading behavior (may rename with `PairRow`).

### Data flow

1. User types → debounce ~100–150ms → recompute suggestions + filtered list.
2. Suggestion `category` → set category (query may clear or stay; prefer **keep query** unless it yields zero results, then clear query).
3. Suggestion `family` → set query to that family string.
4. Suggestion `pair` → call `onSelectPairing` for that pair (and optionally set query to displayName).
5. Parent contracts (`onSelectPairing`, `selectedPairing`, `pairings`) unchanged.

## Empty & edge states

| State | UI |
|-------|-----|
| Filter/search yields 0 | Message + “Limpiar búsqueda” and/or reset category to Todas |
| `pairings.length === 0` | Existing empty copy; omit interactive toolbar noise if useless |
| Suggestions with no matches | Do not show empty popover; close suggestions |
| Very long family names | Truncate with ellipsis; `title` attribute for full name |

## Accessibility

- Toolbar region: `role="search"`; labelled input.
- Category control: `aria-expanded` / listbox or native select with accessible name.
- Suggestions: `listbox` + `option` (or equivalent pattern); keyboard complete; Esc closes.
- Row button: `aria-pressed`; selected row `aria-expanded="true"`.
- Live region: announce “N pares” when filtered count changes.
- Contrast: meta/muted ≥ 4.5:1; keep existing focus rings.
- Do not rely on color alone for selection.

## Visual rules (Craftie)

- Restrained chrome; no new saturated decoration.
- Flat: depth via surface/border only; kill nested card.
- Role labels in expanded preview: caption without heavy uppercase tracking (or short “Titular” / “Cuerpo” in Spanish to match product locale)—not the repeated AI eyebrow treatment on every compact row.
- Body line length rules N/A for data rows; compact UI density is intentional.

## Testing

**Unit (`/lib`):**

- `filterFontPairs`: by category, by family substring, by displayName, combined, case-insensitive, empty query.
- `suggestFontPairs`: types returned, limit, no duplicates, empty query behavior.

**UI (lightweight):**

- Selecting a row shows specimen; deselecting/selecting another collapses previous.
- Applying category + query updates list count / empty state.

No E2E required for this slice.

## Implementation notes

- Keep components under 250 lines; split toolbar and specimen as above.
- One PR focused on this UX (AGENTS.md: one task per PR).
- Critique follow-ups mapped: densify (`typeset`/`distill`), search (`shape`→build), nested cards (`quieter`/`layout`), role labels (`quieter`), category coverage via suggestions + dropdown vocabulary.

## Success criteria

1. At typical tools panel height, clearly more pairs visible without scroll than today.
2. User can find a pair by family name in ≤3 seconds via search.
3. Selected pair still shows stacked Headline/Body specimen in the list.
4. Detector `nested-cards` count on this list drops to ~0 for pairing rows.
5. No regression to `onSelectPairing` / font loading behavior.
