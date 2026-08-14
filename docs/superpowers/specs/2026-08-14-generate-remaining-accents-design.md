# Generate remaining accents — Design Spec

**Date:** 2026-08-14  
**Status:** Approved — awaiting implementation plan  
**Surface:** Panel Colores → pestaña Acentos (`UiDataSection`)  
**Approach:** New `/lib` filler with hue-spread + CVD gate; section CTA applies instantly

## Problem

When the accent family has empty slots, the user must pick candidates one slot at a time. The deuteranopia warning explains that source hues cluster (e.g. cyan–blue) and adjacent series may collapse, but it does not offer an automatic escape that chooses separated hues for the user.

## Goals

1. One section CTA that fills **all empty** accent slots it can, with copy tied to the real gap count (`Generar el 1 restante` / `Generar los N restantes`).
2. Apply **immediately** on click (no confirm modal / no pre-apply preview).
3. Prefer candidates that **escape the source hue cluster** and pass CVD + data fitness — not random fills that only warn afterward.
4. **Partial fill:** write only CVD-safe slots; leave the rest empty; keep/update the warning silently via existing gap UI.
5. Silent feedback: swatches and `X de 6 · N sin asignar` update; no toast or result banner.

## Non-goals

- Per-card `Generar` next to `Elegir`
- Modal, inline proposal picker, or “Aplicar / Ajustar manualmente” confirm step
- Toast / dismissible result banner
- Regenerating or replacing already-assigned accents
- Changing deuteranopia warning copy (aside from visibility when gaps hit zero)
- Removing or replacing `autoFillDataGaps` (CTA uses the new function)

## Decisions (locked)

| Topic | Choice |
|-------|--------|
| CTA surface | Section only (option A) |
| Confirm step | None — apply on click (option C) |
| Unsafe slots | Skip; leave empty (option A) |
| Feedback | Silent UI update (option A) |
| Algorithm | New `fillRemainingAccentGaps` with hue-offset synthetics + CVD gate (approach 2) |
| Button placement | Directly **above** the deuteranopia warning (when shown); still under the accents header/swatch row |
| Button style | Secondary (border / raised), Sparkles icon |
| Existing manual flow | Unchanged (`Elegir`, candidates, Derivar del primario) |

## UI

### Visibility

Show the button only when `gaps.length > 0`. Hide when the family is complete.

### Copy

- `gaps.length === 1` → `Generar el 1 restante`
- `gaps.length >= 2` → `Generar los {N} restantes`

### Layout (sketch)

```
Acentos · 4 de 6 · 2 sin asignar
[help text]
[swatch][swatch][swatch][swatch][empty][empty]

[✨ Generar los 2 restantes]          ← secondary

[⚠ deuteranopia warning…]            ← if gaps > 0 and not dismissed

Acento 5 de 6
[candidate list / Sin asignar…]
```

### Click behavior

1. Call `fillRemainingAccentGaps(tokens, colors)`.
2. For each returned `{ token, hex }`, call `onReplace(token, hex)`.
3. Advance active slot to the first remaining empty slot (same idea as today’s assign flow); if none empty, keep current selection.
4. No extra messaging.

## Library: `fillRemainingAccentGaps`

**Module:** `lib/color/uiColorCandidates.ts` (alongside `buildDataCandidates` / `autoFillDataGaps`; no new file unless the addition pushes the module past a clear single-purpose size — prefer extend-in-place for v1).

**Signature:**

```ts
fillRemainingAccentGaps(
  tokens: SemanticTokens,
  colors: SelectableColor[],
): Array<{ token: SemanticTokenName; hex: string }>
```

Returns only slots that were filled. Empty array if nothing safe was found.

### Algorithm

For each `data-1` … `data-6` that still has a gap, in order:

1. **Pool:** `buildDataCandidates(working, colors, token)` plus **synthetic hue-offset** variants from primary (same spirit as `deriveFromPrimary` / existing `DATA_DERIVE_HUE_OFFSETS`), so the generator can leave a clustered source family.
2. **Filter:** exclude hexes already occupied (assigned tokens + fills chosen earlier in this pass); require `fitness.asData.ok` (data contrast, separation, and `remainsDistinctWithColorVisionDeficiency` via existing fitness).
3. **Pick:** highest score among remaining valid candidates.
4. **Commit locally:** if a winner exists, push `{ token, hex }` and mark that hex occupied on the working copy; if not, skip the slot (stays empty).

### Guarantee

No written color may fail CVD distinctness against other occupied accent hexes under the existing `remainsDistinctWithColorVisionDeficiency` check (already part of `asData` fitness). Partial completion is success when at least one slot fills; total miss returns `[]` and leaves UI unchanged except for the no-op click.

## Files

| File | Change |
|------|--------|
| `lib/color/uiColorCandidates.ts` | Add `fillRemainingAccentGaps` (+ small helpers if needed) |
| `lib/color/uiColorCandidates.test.ts` | Clustered sources → separated fills; partial; empty; do not touch occupied |
| `src/components/color/UiDataSection.tsx` | Secondary button + apply handler (reuse existing `onReplace`, same as manual assign) |

## Testing

- **Unit:** source hues in one family → filled hexes are CVD-distinct from each other and from occupied slots.
- **Unit:** no safe candidate → `[]`.
- **Unit:** two gaps, only one safe → one entry; other token still gapped.
- **Unit:** already-assigned slots unchanged.
- **Smoke UI:** button appears iff gaps > 0; after a successful fill, swatch row and `X de 6` match; warning remains only while gaps remain (and not dismissed).

## Out of follow-ups (explicit)

Per-card generate, confirm preview, and toast feedback are deferred unless product reopens them.
