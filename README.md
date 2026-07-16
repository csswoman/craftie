# Craftie

Craftie is a web studio for building brand systems from color, inspiration, and typography. The current workflow takes users from an image or curated style to an editable palette, validates it for legibility, and exports a reusable guide.

## What it currently does

### Inspiration and color extraction

- Choose from curated inspiration styles with names, descriptions, seed colors, and moods.
- Upload a local image to extract dominant colors in the browser.
- Validate image inputs and show a preview with the file name.
- Classify extracted palettes as pastel, vivid, dark, or neutral.
- Regenerate extraction for the same image and manually change the palette type.
- Add colors manually using HEX values.

### Color system

- Derive a semantic palette from selected colors.
- Work with system roles such as background, surface, text, primary, accent, and status colors.
- Generate neutrals, accents, and variants using OKLCH-based formulas.
- Edit colors, names, and role assignments from the inspector.
- Adjust hue, lightness, chroma, and vibrancy with non-destructive controls.
- Keep source colors, semantic tokens, and derived roles separate.
- Configure light and dark themes with per-role overrides.
- View the palette through system, paint, typography, and UI composition views.
- Inspect shades, candidates, data series, and color compositions to understand how the system behaves.

### Accessibility

- Calculate relative luminance and contrast ratios.
- Evaluate semantic color pairs against WCAG 2.2.
- Show compliance states for normal and large text at AA and AAA levels.
- Suggest OKLCH lightness adjustments to move a color toward the target contrast level.
- Show a complementary APCA reading and warn when WCAG and APCA disagree.
- Preview real text with the palette combinations.

### Typography

- Browse a curated catalog of heading and body font pairings.
- Recommend pairings based on the selected style's mood.
- Filter pairings by characteristics and inspect their metadata.
- Preview applied typography on the current palette.
- Pin the heading or body font independently while previewing other pairings.
- Adjust the base type scale, scale ratio, and heading weight.
- Load font families from Google Fonts or upload local fonts for headings or body text.
- Temporarily retain custom fonts and the selected pairing in the browser.

### Guide and export

- Follow a four-step guided flow: inspiration, role adjustment, generation, and review.
- Generate a brand guide once the palette is complete and ready for review.
- Review the palette, contrast, roles, themes, and typography before exporting.
- Download a `brand-kit.json` containing the palette, roles, typography, metadata, and associated guide.
- Download a `DESIGN.md` containing YAML tokens, light/dark CSS custom properties, a role reference table, and usage instructions.
- Use the workspace with resizable panels, responsive views, light/dark mode, and keyboard shortcut help.

## Main workflow

1. Choose a curated style or upload an image.
2. Review and adjust source colors and semantic roles.
3. Customize roles, themes, and vibrancy as needed.
4. Select a font pairing or apply custom fonts.
5. Generate the brand guide.
6. Review contrast and typography, then export `brand-kit.json` or `DESIGN.md`.

## Persistence and current limitations

- The application currently runs in the browser and does not require an account or backend.
- Project persistence, cross-device synchronization, and Supabase integration are not implemented yet.
- Images and local fonts are processed locally; this application does not upload them to a server.
- Interface preferences, such as dismissing the guide and panel layout, are stored in `localStorage`.
- Custom fonts and the selected font pairing are retained in the browser's session storage.

## Tech stack

- Next.js 16 and React 19
- TypeScript
- Tailwind CSS 4
- `culori` for color conversions and operations, including OKLCH
- `ntcjs` and original curated data for color names and styles
- `lucide-react` for icons
- Vitest for unit tests

## Project structure

```text
src/
  app/                         Next.js entry point, layout, and global styles
  components/
    color/                     Workspace, role editor, and color views
    color-engine/              Palette generation, selection, and extraction
    font-pairing/              Typography catalog and application
    layout/                    Shell, navigation, panels, shortcuts, and exports
    theme/                     Theme provider and toggle
  context/                     Shared role-palette state
  lib/browser/                 Browser-dependent adapters

lib/
  a11y/                        Accessibility utilities
  color/                       Color engine, roles, themes, contrast, and previews
  export/                      Brand kit, tokens, and DESIGN.md generation
  studio/                      Studio flow and shortcuts
  styles/                      Curated inspiration styles
  typography/                  Pairings, filters, scales, and custom fonts
  utils/                       Reusable pure utilities

docs/                          Product documentation and design decisions
scripts/                       Project validation scripts
```

Business logic lives in `lib/` and remains independent from React. Adapters that require browser APIs live in `src/lib/browser/`.

## Development

Requirements: Node.js compatible with Next.js 16 and pnpm.

```bash
pnpm install
pnpm dev
```

Available commands:

```bash
pnpm build                 # Build the application for production
pnpm start                 # Start the production build
pnpm lint                  # Run ESLint
pnpm typecheck             # Check TypeScript types
pnpm test                  # Run Vitest tests
pnpm test:watch            # Run Vitest in watch mode
pnpm check:component-size  # Check the 250-line component limit
pnpm verify                # Run all checks above
```

## Project status

Craftie is in active development. The color engine, role selection and editing, image extraction, typography, accessibility review, and core exports are implemented. The next pending stage is adding project saving and persistence.

## Originality and license

The project's rules, curated styles, recommendations, and original data are maintained independently. Content, tables, datasets, or text protected by third parties must not be copied from products, books, or websites.

This project is distributed under the MIT license.
