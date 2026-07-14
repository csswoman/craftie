# Font pairings catalog expansion

**Date:** 2026-07-13  
**Status:** Approved (approach 1)  
**Scope:** Expand curated Google Fonts pairs shown by `PairingList`

## Goal

Grow the pairing catalog with the user’s curated list, keeping only pairs where both heading and body load from Google Fonts. Preserve existing pairs and current filter semantics.

## Non-goals

- New UI filter chips or category taxonomy in `PairingList`
- Self-hosted / commercial fonts (Geist, Satoshi, General Sans, Clash Display/Grotesk, Cabinet Grotesk, Switzer)
- Changing recommendation scoring beyond new `mood` tags that already fit the existing convention
- Redesigning `PairCard` or typography preview

## Data source

- Canonical catalog: `lib/typography/fontPairLibrary.ts` (`CURATED_FONT_PAIRS`)
- Re-exported as `FONT_PAIRS` in `lib/typography/pairings.ts`
- `PairingList` receives `pairings` as props; no hard-coded list there

## Inclusion rules

1. Both `heading.family` and `body.family` must exist on Google Fonts.
2. Skip pairs that need Geist, Satoshi, General Sans, Clash*, Cabinet*, or Switzer.
3. Do not add a new entry if the same heading+body families already exist (order-insensitive match on family names).
4. Keep all current ~20 pairs.
5. Single-family recommendations (Inter, Manrope, etc. used as both heading and body) are valid pairs when the family is on Google Fonts.

## Entry shape (unchanged)

Each `FontPair` keeps the existing fields:

- `id`: kebab-case, unique, descriptive (`sans-manrope-inter`)
- `displayName`: short Spanish label from estilo / ideal-para (e.g. “Premium”, “Tech limpio”)
- `heading` / `body`: `FontMeta` with `googleFontsRef` specimen URL
- `rationale`: one short Spanish sentence
- `mood`: tags for style matching
- `character`: tags used by current filters (`editorial`, `technical`, `warm`, `minimal`, plus existing secondary tags when useful)

## Filter mapping (no UI change)

Map list sections to existing `character` tags:

| Source section | Primary `character` |
| --- | --- |
| Sans + Sans | `technical`, `minimal`, and/or `geometric` |
| Sans + Serif | `editorial` (add `elegant` / `warm` when estilo implies it) |
| Display + Sans | `bold` (often also `warm` or `technical`) |
| Mono + Sans | `technical` |
| Friendly / Rounded | `warm` |
| Accesibilidad | `accessible` (+ `warm` or `minimal` as fits) |
| Una sola familia | `minimal` or `technical` by personality |
| Premium (GF-only subset) | Prefer `technical` / `minimal` / `editorial` per pair |

`PairingList` filters stay: Todos / Editorial / Técnico / Cálido / Minimal.

## Excluded (not Google Fonts / unavailable pairs)

Examples (non-exhaustive): Instrument Sans + Geist, Plus Jakarta Sans + Geist, General Sans + Inter, Satoshi + Inter, Cabinet/Clash/Switzer pairs, Space Mono + Geist, Geist Mono + Geist, IBM Plex Sans + Geist, Clash Display + Geist.

Instrument Sans alone is allowed (already used in the catalog).

## Tests

Update `lib/typography/pairings.test.ts`:

- Remove/relax the upper bound of 22 pairs
- Keep assertions that every pair has `displayName`, non-empty `character`, and both `googleFontsRef` URLs
- Optionally assert no duplicate heading+body family pairs

## Out of file scope

No changes required to `PairingList.tsx` unless a follow-up adds filters. Behavior updates solely via larger `pairings` input from the library.
