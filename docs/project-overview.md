# Project Overview

## Vision

Craftie is a personal web application for generating color palettes, validating accessibility, recommending font pairings, and exporting lightweight brand guides.

The project is inspired by the general workflow used in professional branding and color tools, but it is not intended to replicate any commercial product. All color harmony rules, font pairing recommendations, design styles, and generation logic are original and curated specifically for this project.

The primary goal is to create a useful design tool for personal use and portfolio purposes while maintaining a clean architecture, testable business logic, and a scalable foundation for future features.

---

# Product Goals

The application should help users:

* Build cohesive color palettes.
* Understand accessibility implications of their color choices.
* Discover compatible font combinations.
* Create consistent visual systems.
* Export branding decisions into reusable formats.

The focus is simplicity, clarity, and practical design guidance rather than overwhelming users with advanced design terminology.

---

# Core User Flow

The product is designed around a five-step workflow.

## 1. Choose Inspiration

Users begin by selecting a creative direction.

Possible inputs include:

* Curated design styles.
* Mood boards.
* Reference images.

The initial implementation focuses on curated design styles because they are easier to control and test.

Image-based palette extraction is intentionally postponed to a later phase because it introduces significantly more technical complexity than the rest of the application.

---

## 2. Select Colors

Users can either:

* Build a palette manually.
* Use the Smart Color Formulas engine.

The Smart Color Formulas engine generates suggested colors based on one or more user-selected colors.

Potential outputs include:

* Light neutrals.
* Dark neutrals.
* Accent colors.
* Supporting colors.

Color generation should prioritize perceptually uniform color spaces such as OKLCH rather than relying exclusively on RGB or traditional HSL manipulation.

The goal is to produce visually balanced results that behave more predictably across different hues.

---

## 3. Test Accessibility

The accessibility engine evaluates color combinations using WCAG contrast requirements.

This feature is intentionally developed first because:

* The formulas are publicly documented.
* Results can be validated against known reference values.
* The logic is entirely deterministic.
* It requires no UI assumptions.

The accessibility system should clearly indicate:

* Contrast ratio.
* WCAG compliance level.
* Pass or fail status.

Accessibility calculations represent the most testable part of the application and serve as the foundation for the color engine.

---

## 4. Font Pairings

Once a palette is selected, the user can explore typography recommendations.

The font pairing system is based on a curated collection of heading and body combinations.

Recommendations are generated using practical heuristics such as:

* Visual contrast.
* Complementary personality.
* Compatible proportions.
* Readability.

The objective is not to automate typography completely but to provide sensible starting points that users can confidently adopt or customize.

Google Fonts integration will be used for previews and metadata.

---

## 5. Save and Export

Users can save approved palettes and typography combinations.

Potential export formats may include:

* Brand summary pages.
* Style guides.
* Design token exports.
* Palette reference sheets.

Persistence is optional during early development.

If project storage is introduced, Supabase will be used with Row Level Security enabled from the start.

---

# Technical Philosophy

The project prioritizes correctness, maintainability, and testability.

Key principles include:

* Pure business logic separated from UI.
* Small, focused modules.
* Incremental development.
* Strong automated testing.
* Predictable behavior.

Color calculations, harmony analysis, accessibility evaluation, and typography recommendation logic should remain independent from React components whenever possible.

This separation makes validation easier and reduces long-term maintenance costs.

---

# Development Strategy

The application is built incrementally.

Instead of implementing the entire product at once, development is divided into small, focused tasks with clear acceptance criteria.

Each feature should be completed, tested, and reviewed before the next feature begins.

The preferred workflow is:

1. Define a small ticket.
2. Implement the feature.
3. Add tests.
4. Validate acceptance criteria.
5. Move to the next ticket.

This approach reduces complexity and keeps development predictable.

---

# Roadmap

## Phase 0 — Project Setup

Initial project structure, tooling, configuration, and development environment.

## Phase 1 — Color Engine

Accessibility calculations, contrast analysis, harmony evaluation, and supporting color utilities.

## Phase 2 — Select Colors UI

Manual color selection and palette generation interface.

## Phase 3 — Choose Inspiration

Curated design styles followed by image-based inspiration workflows.

## Phase 4 — Font Pairings

Typography recommendations and Google Fonts integration.

## Phase 5 — Save & Export

Project persistence, exports, and optional Supabase integration.

---

# Copyright and Originality

This project must not contain copied proprietary content from third-party tools, books, courses, or websites.

External resources may be used for learning and research, but all implemented rules, curated data, recommendations, and design decisions must be original to this project.

The objective is to build an original tool informed by design principles, not a reproduction of existing products.

---

# Current Status

The project structure and roadmap have been defined.

The first implementation target is the WCAG contrast engine, including:

* Relative luminance calculation.
* Contrast ratio calculation.
* WCAG level evaluation.
* Unit tests based on public reference values.

Once the accessibility engine is complete and validated, development will continue with harmony analysis and additional color engine features.
