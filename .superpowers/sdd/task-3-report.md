# Task 3 report: muted text role and projected text safety

## Status

DONE

## Scope implemented

- Added the `on-background-muted` semantic token.
- Added the `texto-secundario` palette role to role types, ordering, labels, derived roles, projection, contrast inspection, theme counterparts, exports, randomization, and source-role assignment.
- Added optional `RoleSlot.textSafe` and populated it only for `primario`, `secundario`, and `acento`.
- Computed `textSafe` with `isTextSafe(normalized, tokens.surface.hex)`.
- Kept muted text calibrated to a 3:1 target against the separated `surface`.
- Added the required AA-large documentation: muted text is intended for text at least 18px, or at least 14px bold.
- Did not implement Task 4 or add `usageColor`.

## TDD RED

Created `lib/color/semanticTokens.mutedText.test.ts` before production changes, using the exact cases from the brief.

Command:

```text
npm test -- lib/color/semanticTokens.mutedText.test.ts
```

Observed expected failure:

- 1 test file failed.
- 2 tests failed.
- `tokens['on-background-muted']` was undefined.
- `palette.primario.textSafe` was undefined.

This confirmed both missing behaviors were exercised by the new tests.

## TDD GREEN

Implemented the smallest role/token projection changes, then ran the focused test.

Initial GREEN attempt exposed an important behavior of the existing `adjustLightnessForContrast`: it returns an already-higher-contrast foreground unchanged. Starting from primary text therefore produced approximately 13.61:1 instead of muted text near 3:1.

To preserve the required 3:1 result, added the framework-agnostic `deriveMutedTextHex` helper. It moves from the surface toward the primary text in OKLCH lightness and binary-searches for the nearest realization meeting the target. All callers use the exact ratio `3`.

Focused GREEN result:

```text
Test Files  1 passed (1)
Tests       2 passed (2)
```

## Ripple fixes

The new exhaustive role/token unions surfaced required compiler ripples. Updated:

- `randomRoleColor.ts`
- `rolePaletteMutations.ts`
- `roleSourceAssignment.ts`
- `semanticTokenTargets.ts`
- `designTokens.ts`
- Full `RolePalette` fixtures and export expectations in affected tests

Theme counterpart targets use the brief's exact values:

- Light `texto-secundario`: `0.45`
- Dark `texto-secundario`: `0.72`

## Verification

Brief regression command:

```text
npm test -- lib/color/semanticTokens.mutedText.test.ts lib/color/rolePalette.test.ts lib/color/roleInspectorContrast.ts
Test Files  2 passed (2)
Tests       15 passed (15)
```

Full verification:

```text
npm test
Test Files  88 passed (88)
Tests       491 passed (491)

npx tsc --noEmit
Exit code 0

npm run lint
Exit code 0

npm run check:component-size
Component size check passed (180 files, max 250 lines).
```

`git diff --check` completed without whitespace errors. Git emitted only normal Windows LF-to-CRLF conversion warnings.

## Concerns

None. The npm commands emit a pre-existing warning about the unknown `devdir` npm environment config; it does not affect test, typecheck, lint, or component-size results.

## Review findings fix

- Regenerated unlocked `texto-secundario` from the final `texto` and `superficie` at the 3:1 target after randomization.
- Centralized expressive-role `textSafe` refresh and applied it in slot creation, direct role replacement, and derived-role recomputation.
- Did not implement Task 4.

TDD RED:

```text
pnpm test lib/color/randomUnlockedRolePalette.test.ts lib/color/rolePalette.test.ts
Test Files  2 failed (2)
Tests       2 failed | 18 passed (20)
```

Focused GREEN:

```text
pnpm test lib/color/randomUnlockedRolePalette.test.ts lib/color/rolePalette.test.ts lib/color/semanticTokens.mutedText.test.ts
Test Files  3 passed (3)
Tests       22 passed (22)
```

Full verification:

```text
git diff --check
Exit code 0 (normal Windows LF-to-CRLF warnings only)

pnpm typecheck
Exit code 0

pnpm test
Test Files  88 passed (88)
Tests       493 passed (493)

pnpm lint
Exit code 0
```
