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
| 006 | Craftie product and experience roadmap | Evaluation | Per delivery | Reconcile 001–004 before delivery E | PROPOSED |

## Product and experience proposal

Plan [006](006-craftie-product-and-experience-roadmap.md), written on 2026-10-06 against `987f1bc`, gathers the proposed project saving, visual alternatives, comparison, goal-based start, contextual editor, palette intents, actionable accessibility review, faithful exports, consumer example, browser validation, and case study.

It is a roadmap for evaluation, not authorization to implement every delivery. Its evaluation table selects which deliveries become independent implementation plans/PRs. Existing 001–005 statuses were preserved and have not been revalidated by this planning task. Delivery E overlaps 004 and requires reconciliation instead of a second palette-intent system.

## Dependency notes

- 002 depends on 001 because its candidate scoring must consume alpha-aware, representative samples.
- 003 depends on 002 because both output modes need the same diversity-filtered candidate set.
- 004 exposes the two output modes from 003; do not attach new UI semantics to the existing random sampling behavior.
- 005 must use the finalized extraction request shape from 001 and 004.

## Findings considered and rejected

- Replacing all CIELAB clustering with OKLab now: defer. First establish image-corpus tests for representative sampling and diversity; changing distance spaces concurrently would make regressions impossible to attribute.
