# Changelog

All notable changes to Craftie are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added
- `LICENSE` (MIT), `CONTRIBUTING.md`, issue and pull request templates, `.editorconfig`, `.nvmrc`.
- Coverage reporting (`pnpm test:coverage`) with thresholds enforced in CI.
- Playwright end-to-end tests (`pnpm test:e2e`) run in CI, and README screenshots.
- Security headers, richer metadata, `robots` and web manifest.

### Changed
- Package renamed to `craftie`; `engines` and `packageManager` are now declared.
- `RolePaletteContext` split into focused hooks and pure `lib/color/editablePalette` logic.
- `check:component-size` now also covers `src/context`.
- `/select-colors` redirect is now permanent.

### Fixed
- The Colores panel was empty after starting from a custom HEX, and for the example, autosaved or shared palettes. Source colors are now built from any valid HEX.

### Removed
- Unused `ntcjs` dependency and the tracked copy of its package in `package/`.
- Locally generated tooling reports (`.superpowers/`) from version control.
