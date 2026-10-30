# Contributing to Craftie

Thanks for helping improve Craftie. Please read `AGENTS.md` first: it defines the architecture rules this project follows.

## Setup

Requirements: Node.js 24 (see `.nvmrc`) and pnpm (version pinned in `package.json`).

```bash
pnpm install
pnpm dev
```

## Ground rules

- One task per pull request.
- Components stay under 250 lines (`pnpm check:component-size`, also applied to `src/context`).
- Business logic belongs in `lib/` and must be framework-agnostic. Browser-only adapters live in `src/lib/browser/`.
- One responsibility per module.
- Do not implement future roadmap phases unless the issue asks for it.
- Do not copy copyrighted content, datasets, tables, or text from third-party products, books, or websites.

## Before opening a pull request

```bash
pnpm verify          # lint, component size, typecheck, tests
pnpm test:coverage   # enforces coverage thresholds for lib/
pnpm build
```

CI runs the same checks plus `pnpm audit`.

## Commits and pull requests

- Use conventional prefixes: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`.
- Keep PR titles under 70 characters and fill in the PR template.
- Update `CHANGELOG.md` for user-visible changes.
