# 🎨 Palette & Type

Build accessible color palettes, curated font pairings, and cohesive brand systems.

---

## Overview

Palette & Type is a web application designed to help designers, developers, and creators build consistent visual identities.

The tool combines:

* Color palette generation
* WCAG accessibility validation
* Curated typography pairings
* Design inspiration workflows
* Brand guide previews

The goal is to provide a structured workflow for creating visually cohesive and accessible brand systems.

---

## Features

### 🎨 Color Palette Builder

* Curated color selection
* Smart palette generation
* Light and dark neutral systems
* Accent color recommendations

### ♿ Accessibility Testing

* WCAG 2.2 contrast calculations
* AA and AAA validation
* Real-world text previews
* Palette contrast analysis

### 🔤 Typography Pairings

* Curated font combinations
* Mood-based recommendations
* Palette-aware suggestions
* Google Fonts integration

### ✨ Inspiration System

* Design style presets
* Mood-based workflows
* Image palette extraction
* Visual inspiration boards

### 📘 Brand Preview

* Live typography previews
* Color system visualization
* Mini brand guide generation

---

## Tech Stack

### Frontend

* Next.js
* TypeScript
* Tailwind CSS

### Color Engine

* culori
* OKLCH
* WCAG 2.2 contrast calculations

### Typography

* Google Fonts CSS API

### Future

* Supabase
* Brand guide exports
* Project persistence

---

## Project Structure

```text
app/

components/
  color-engine/
  font-pairing/

lib/
  color/
  typography/
  styles/

public/
```

---

## Roadmap

### Phase 0

* Project setup

### Phase 1

* Color Engine
* WCAG Contrast
* Harmony Detection
* Smart Color Formulas

### Phase 2

* Select Colors UI
* Accessibility UI

### Phase 3

* Design Styles
* Image Palette Extraction

### Phase 4

* Font Pairings
* Google Fonts Integration

### Phase 5

* Save & Export
* Supabase Persistence

---

## Design Principles

### Accessibility First

Every palette should be evaluated against WCAG standards.

### Color Science

Color operations are based on perceptually uniform color spaces such as OKLCH.

### Separation of Concerns

Business logic remains independent from UI components.

### Small, Testable Modules

Core functionality is implemented as reusable and testable utilities.

---

## Development

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

Run tests:

```bash
npm run test
```

---

## Status

🚧 Active Development

The project is currently focused on the Color Engine and Accessibility modules.

---

## License

MIT

```
```
