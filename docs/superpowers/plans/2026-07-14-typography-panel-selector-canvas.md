# Typography panel: selector → canvas Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan **one PR phase at a time**. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Tipografía tab a type selector/calibrator and the canvas the specimen: flat rows, chips, sticky Applied zone, hover-preview, scale tokens, custom fonts.

**Architecture:** Introduce workspace `TypeState` (`applied` / `hovered`, pins, base, ratio). Pure helpers in `/lib/typography` for scale and effective fonts. Tools UI redesigned under `src/components/font-pairing/`. Preview root exposes CSS custom properties; maquetas consume tokens via `previewTypography`.

**Tech Stack:** TypeScript, React, Tailwind, Vitest, Google Fonts link loader, FontFace API (browser adapter).

**Spec:** `docs/superpowers/specs/2026-07-14-typography-panel-selector-canvas-design.md`

**Commit policy:** Do not commit unless the user explicitly asks.

---

## File structure (target)

| File | Responsibility |
|------|----------------|
| `lib/typography/typeScale.ts` | `typeScaleSize`, preset bases/ratios, readout map |
| `lib/typography/typeState.ts` | Types + `resolveEffectiveTypography` (hovered ?? applied) + apply-from-pair with pins |
| `lib/typography/pairingFilters.ts` | Keep category filter; drop suggestion-driven category UX from UI |
| `src/lib/browser/customFonts.ts` | GF validation/load + local FontFace |
| `src/components/font-pairing/AppliedTypeZone.tsx` | Sticky Applied controls |
| `src/components/font-pairing/PairingFilterChips.tsx` | Chips only |
| `src/components/font-pairing/PairRow.tsx` | Flat specimen row |
| `src/components/font-pairing/PairingList.tsx` | List + search gate; no nested scroll |
| `src/components/font-pairing/CustomFontEntry.tsx` | Modal + CTA |
| `src/components/color/preview/previewTypography.ts` | Token-aware styles + `--weight-ui` |
| `src/components/color/PreviewView.tsx` (or canvas root) | Set CSS vars; badge; feed hovered/applied |
| Workspace controller / context | Own `TypeState` |

---

## Phase A — Flat selector chrome (PR 1)

**Goal:** Constant-height rows, chips, no expand, no category select, single scroll, specimen phrases.

### Task A1: Scroll + chips + kill nested list scroll

**Files:**
- Modify: `src/components/color/SelectColorsWorkspaceSidebar.tsx`
- Modify: `src/components/font-pairing/PairingList.tsx`
- Create: `src/components/font-pairing/PairingFilterChips.tsx`
- Remove usage of: `PairingSearchToolbar` dropdown path (gate or delete toolbar; search returns in A2)

- [ ] **Step 1:** Make tipografía tabpanel `overflow-y-auto` (single scroll). Remove `overflow-hidden` trap that forced inner list scroll.

- [ ] **Step 2:** Create chips component using `PAIRING_CATEGORY_FILTERS` labels (Todos · …). Active = solid dark; inactive = outline. No “Categoría” text.

- [ ] **Step 3:** In `PairingList`, remove `overflow-y-auto` / `max-h-*` / `flex-1 min-h-0` scroll on `<ul>`. List is a normal block in the tab scroll.

- [ ] **Step 4:** Remove category `<select>` and suggestions-as-category-list UI. Keep `filterFontPairs` for chips.

- [ ] **Step 5:** Manual: one scrollbar; chips filter list.

### Task A2: Flat `PairRow` specimen + remove expand

**Files:**
- Modify: `src/components/font-pairing/PairRow.tsx`
- Delete or stop importing: `PairSpecimenPreview.tsx` from tools list (delete file if unused)

- [ ] **Step 1:** Rewrite row to constant layout:

```tsx
// Meta
<p className="flex justify-between gap-2 text-tools-meta uppercase tracking-wide text-muted">
  <span className="truncate">{heading} · {body}</span>
  <span className="tabular-nums shrink-0">{hW} / {bW}</span>
</p>
// Specimen
<p className="truncate" style={{ fontFamily: headingStack, fontWeight: hW }}>Ship the brand story</p>
<p className="truncate text-muted" style={{ fontFamily: bodyStack, fontWeight: bW }}>
  A focused landing experience stays calm.
</p>
```

Defaults weights 700 / 400 until Phase C wires Applied weights.

- [ ] **Step 2:** Selected chrome: border + soft bg + `border-l-[3px] border-l-primary` (no expand). Never change padding block between selected/unselected enough to change height materially.

- [ ] **Step 3:** Search: `{pairings.length >= 20 ? <SearchInput … /> : null}` — keep simple input if needed; do not show with current catalog if under 20.

- [ ] **Step 4:** Run `pnpm check:component-size`. Visual check tools tab.

---

## Phase B — Hover preview + apply + pins (PR 2)

**Goal:** Non-destructive hover preview on canvas; click applies with pin rules.

### Task B1: TypeState + resolve helpers (TDD)

**Files:**
- Create: `lib/typography/typeState.ts`
- Create: `lib/typography/typeState.test.ts`

- [ ] **Step 1:** Write tests for:
  - `resolveEffectiveTypography({ applied, hovered })` prefers hovered when non-null
  - `applyPairToTypography(applied, pair, { pinHeading, pinBody })` updates only unpinned roles
  - both pins → returns applied unchanged
  - hybrid detection: `catalogPairId` null when families don’t match a single pair id

- [ ] **Step 2:** Implement until green: `pnpm test -- lib/typography/typeState.test.ts`

### Task B2: Wire workspace state + canvas badge

**Files:**
- Modify: `useSelectColorsWorkspaceController.ts` (or extract `useTypographyState`)
- Modify: `PreviewView.tsx` / layout preview root
- Modify: `PairingList` / `PairRow` events
- Modify: `SidebarTypographySection` props

- [ ] **Step 1:** Replace bare `selectedPairing` with `TypeState` (or keep selected id derived from `applied.catalogPairId` for persistence compatibility).

- [ ] **Step 2:** `onPairPointerEnter(pair)` → set `hovered` from pair + pins. `onPairPointerLeave` → `hovered = null`. `onPairClick` → write `applied`, clear `hovered`.

- [ ] **Step 3:** Canvas fonts from `resolveEffectiveTypography`. Show badge when `hovered !== null`: “Vista previa — clic para aplicar”.

- [ ] **Step 4:** When `applied.catalogPairId === null`, no row `aria-pressed`/selected chrome.

- [ ] **Step 5:** Touch: no hover handlers required beyond click (pointer fine for desktop; ensure click works without hover).

- [ ] **Step 6:** `prefers-reduced-motion`: no CSS font transition classes on canvas root.

### Task B3: Pins UI (minimal in Applied shell)

**Files:**
- Create stub `AppliedTypeZone.tsx` with pin buttons + family/weight readout (weights may still be defaults)

- [ ] **Step 1:** Sticky Applied with heading/body rows + pin toggles only (scale knobs in Phase C).

- [ ] **Step 2:** Verify pinHeading + click another pair updates body only; no row selected if hybrid.

---

## Phase C — Scale knobs + size tokens (PR 3)

### Task C1: `typeScale` (TDD)

**Files:**
- Create: `lib/typography/typeScale.ts`
- Create: `lib/typography/typeScale.test.ts`

- [x] **Step 1:** Tests for `typeScaleSize(16, 1.25, 3) === 31`, `…(16, 1.25, -1) === 13`, etc. for defaults.

- [x] **Step 2:** Export readout builder `{ h1, h2, h3, body, small }`.

### Task C2: Knobs + CSS vars

**Files:**
- Expand `AppliedTypeZone.tsx`
- Modify canvas root to set `--size-h*` / `--size-body` / `--size-small` from readout
- Weight badges editable or display-only for v1: **display from applied** (defaults 700/400); optional simple toggles if cheap

- [x] **Step 1:** Segmented Base 14/16/18 and Ratio 1.125/1.25/1.333.
- [x] **Step 2:** Live readout row.
- [x] **Step 3:** Setting CSS vars on preview root updates with knobs.

---

## Phase D — Maqueta token pass (PR 4)

### Task D1: `previewTypography` token API

**Files:**
- Modify: `previewTypography.ts` and all consumers under `src/components/color/preview/*`

- [x] **Step 1:** Expand `PreviewFonts` (or replace with `PreviewTypeTokens`) to include weights + size vars (or rely purely on CSS vars on parent and use `var(--font-heading)` in styles).

Preferred approach:

```ts
// Styles prefer CSS variables set on ancestor:
fontFamily: 'var(--font-heading)'
fontWeight: 'var(--weight-heading)'
fontSize: 'var(--size-h1)' // for display/hero roles mapped appropriately
```

Map roles: display/hero/heading → heading family + heading weight + appropriate size token; body/title/label → body family + body or ui weight + size tokens.

- [x] **Step 2:** Set `--weight-ui: 600`. Labels/buttons/eyebrows use ui weight.

- [x] **Step 3:** Remove literal `fontFamily: fonts.headingFamily` / hard `fontSize` for brand text in dashboard, landing, media trees. Grep for leftovers:

```bash
rg "fontFamily: fonts\.|fontSize:|fontWeight: 7|fontWeight: 6|fontWeight: 4|fontWeight: 5" src/components/color/preview
```

Accept residual only where non-brand (e.g. icon glyph sizing in primitives).

- [ ] **Step 4:** Manual: change Base in Applied → landing H1 size changes; hover pair → families change without click.

---

## Phase E — Custom fonts (PR 5)

### Task E1: Browser adapters + modal

**Files:**
- Create: `src/lib/browser/customFonts.ts`
- Create: `src/components/font-pairing/CustomFontEntry.tsx`
- Wire CTA at list end

- [x] **Step 1:** GF: build CSS URL, inject link, fail clearly if family unavailable (best-effort check via fonts.googleapis or document.fonts.load timeout).
- [x] **Step 2:** Local file → `FontFace` → assign to heading or body role → update `applied` hybrid + `customFonts` session list.
- [x] **Step 3:** Session persistence (sessionStorage JSON).
- [ ] **Step 4:** Acceptance: load GF by name → maqueta shows it.

---

## Cross-cutting test plan

| Layer | Command / check |
|-------|-----------------|
| Unit | `pnpm test -- lib/typography/typeState.test.ts lib/typography/typeScale.test.ts lib/typography/pairingFilters.test.ts` |
| Size | `pnpm check:component-size` |
| Manual A | One scroll; chips; no expand; phrases |
| Manual B | Hover badge + revert; pins |
| Manual C–D | Base/ratio resize landing H1 |
| Manual E | Custom GF |

---

## Spec coverage

| Criterion | Phase |
|-----------|-------|
| Single scroll + sticky Applied | A + B shell |
| Chips only; no select | A |
| Search ≥20 | A |
| Constant row height | A |
| Hover preview / leave revert | B |
| Base/Ratio → maqueta + readout | C–D |
| Pin heading → body only; no selected when hybrid | B |
| Custom GF | E |
| 3 maquetas tokenized | D |

## Self-review notes

- Prior density plan expand/dropdown is intentionally abandoned for tools UX.  
- Side bar 3px selected marker is **explicit product choice** in this spec.  
- Weights on catalog entries may be defaults until populated; Applied overrides always win.
