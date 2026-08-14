# Implementation Plans

Generated on 2026-08-14 against commit `0fa2409`. Execute in this order. Each executor must read its plan completely, preserve unrelated working-tree changes, and update this index when finished.

## Execution order & status

| Plan | Title | Priority | Effort | Depends on | Status |
|---|---|---|---|---|---|
| 001 | Preserve reliable source pixels | P1 | M | — | TODO |
| 002 | Publish diverse image candidates | P1 | L | 001 | TODO |
| 003 | Separate image-faithful and UI-ready palettes | P1 | L | 002 | TODO |
| 004 | Replace opaque regeneration with palette intents | P2 | M | 003 | TODO |
| 005 | Add a crop-based extraction scope | P2 | L | 001, 004 | TODO |

## Dependency notes

- 002 depends on 001 because its candidate scoring must consume alpha-aware, representative samples.
- 003 depends on 002 because both output modes need the same diversity-filtered candidate set.
- 004 exposes the two output modes from 003; do not attach new UI semantics to the existing random sampling behavior.
- 005 must use the finalized extraction request shape from 001 and 004.

## Findings considered and rejected

- Replacing all CIELAB clustering with OKLab now: defer. First establish image-corpus tests for representative sampling and diversity; changing distance spaces concurrently would make regressions impossible to attribute.
