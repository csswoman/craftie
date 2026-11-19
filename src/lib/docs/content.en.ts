import { page, type DocsGroup } from './content.types';

export const DOCS_GROUPS_EN: DocsGroup[] = [
  {
    title: 'About Craftie',
    pages: [
      page(
        '',
        'About Craftie',
        'What is Craftie',
        'Create, test, and document visual identity before implementing it in your product.',
        'Colors and typography may work well in isolation yet produce unexpected results when applied to a real interface. Craftie is a tool to experiment with palettes, semantic roles, and fonts while observing the result on sample components and interfaces — in a single studio at `/`, with no wizard and no account: everything is saved in your browser.',
        [
          'Roles with light/dark themes and statuses (Success, Warning, Danger).',
          'WCAG contrast and APCA reading, with tips to fix issues.',
          'Font pairings, text roles, and 7 mockups (Dashboard, Landing, Mobile app, Editorial, Store…).',
          'Export: CSS, JSON tokens, DESIGN.md, brand kit, PNG image, and shareable link.',
        ],
        [
          'Open `/` → curated style, image, or custom HEX.',
          'Assign roles in Colors panel → "View brand guide".',
          'Review typography and mockups → save to My projects → Export.',
        ],
        [
          'Mockups use sample content, not your complete application.',
          'Suggests values; you confirm the intent of each role.',
          'Projects live in this browser: there is no cross-device sync.',
        ],
        [
          {
            heading: 'The problem',
            paragraphs: [
              'A palette alone does not show how a product will look. A color might look right in a swatch and fail on a button, text, surface, or interactive state. A font pairing might look great in a short headline and lose readability in tables, forms, or long paragraphs.',
              'Testing all those combinations in your app, Figma, or a design system typically takes repetitive time and effort.',
            ],
          },
          {
            heading: 'The proposal',
            paragraphs: [
              'Craftie lets you explore these decisions before implementing them. Start with a curated style, your own colors, or a palette extracted from an image. Assign colors to semantic roles, derive light and dark themes, check accessibility, and pair font families.',
              'Changes are reflected across sample interfaces to evaluate the whole system, not just isolated swatches.',
            ],
          },
          {
            heading: 'What you can do',
            bullets: [
              'Create a visual foundation — curated style, image, or custom HEX.',
              'Assign semantic roles — background, text, surface, primary action, border, and statuses.',
              'Work in OKLCH — lightness, chroma, and hue for variants and scales.',
              'Check accessibility — WCAG contrast, complementary APCA, and actionable tips with suggested corrections.',
              'Test typography — popular and curated pairings, Google Fonts, or local fonts in real content.',
              'Fine-tune typography — 10 typographic roles (Hero, Headline, Body, Button…) with editable weight, size, line height, and letter spacing.',
              'Preview interfaces — 7 mockups where you can click to edit color or text.',
              'Save and share — My projects, autosave, and a link that restores the palette.',
              'Export the system — CSS, design tokens, Tokens Studio, DESIGN.md, brand kit, and PNG image.',
            ],
          },
          {
            heading: 'Recommended workflow',
            bullets: [
              'Choose inspiration, upload an image, or enter a HEX.',
              'Assign key colors to semantic roles.',
              'Review light and dark themes.',
              'Fix contrast issues using editor tips.',
              'Select and tune typography and its roles.',
              'Check different mockups and viewport widths.',
              'Save project, export, or share link.',
            ],
          },
          {
            heading: 'Craftie does not replace your product',
            paragraphs: [
              'Studio interfaces help explore and spot issues quickly. Before shipping a visual identity, test it with your real components, content, devices, and actual conditions.',
            ],
          },
          {
            heading: 'What it is not',
            bullets: [
              'Not a Coolors or Adobe Color clone.',
              'No Figma plugin or automatic cloud sync.',
              'No accounts or cloud: projects are stored only in this browser.',
            ],
          },
        ],
        'home',
      ),
      page(
        'flow',
        'About Craftie',
        'Studio workflow',
        'Four stages in the same workspace.',
        'Inspiration → adjustment in Colors panel → brand guide → review and export. After creating the guide, the button disappears and Ctrl/⌘+Enter no longer applies: the snapshot is locked for previews and export.',
        [],
        [],
        [],
        [
          {
            heading: '1. Inspiration',
            bullets: [
              'Empty state ("Start here"): "Explore styles", upload image (JPG/PNG/WebP, max 5 MB, local only), or "Start from a color (HEX)".',
              'If you previously saved projects, the home screen displays "Pick up where you left off" with the last three.',
              'Switch between style and image from the Colors panel.',
            ],
          },
          {
            heading: '2. Adjustment',
            bullets: [
              'Colors sidebar panel: System and Accents tabs; image block at top.',
              'Canvas: column palette, system views, and mockups.',
              'Footer "View brand guide" with progress (X of 7 roles ready).',
            ],
          },
          {
            heading: '3. Brand guide',
            paragraphs: [
              'Freezes the derived system (tokens, scales, statuses). Time to review typography and mockups before exporting.',
            ],
          },
          {
            heading: '4. Save and export',
            bullets: [
              'The header displays project name and save status (Draft, Saving…, Saved). Click to open My projects.',
              'Export menu in header when primary, background, and on-background exist.',
              'If any is missing, the button remains disabled and explains what is missing.',
            ],
          },
          {
            heading: 'Layout',
            bullets: [
              'Desktop (≥1280px): fixed sidebar for Colors / Typography.',
              'Mobile/tablet: bottom dock with Image, Colors, and Typography.',
            ],
          },
        ],
      ),
      page(
        'inspiration',
        'About Craftie',
        'Inspiration',
        'Curated style or image: the two primary inputs.',
        'There are three inputs: a curated style, a photo, or a single HEX color. Craftie loads candidates and you assign roles. If nothing is saved, the studio welcomes you with an example palette.',
        [],
        [],
        [],
        [
          {
            heading: 'Curated styles (20)',
            bullets: [
              'Twenty curated styles (Serene forest, Neon night, Concrete…) with filters by vibe.',
              'Each includes 3 seed colors and mood tags for typography.',
            ],
          },
          {
            heading: 'From a color (HEX)',
            bullets: [
              'In "Start from a color (HEX)" enter a value like #1F6F54 (one-click example included).',
              'Craftie builds source colors from that HEX and you assign the roles.',
            ],
          },
          {
            heading: 'From an image',
            bullets: [
              'Drag-and-drop or file selector.',
              'Extraction of ~10 dominant colors; "Regenerate" resamples.',
              'Palette type: Automatic or force Pastel / Vivid / Dark / Neutral.',
              'Thumbnail in canvas toolbar; "Change image" in the panel.',
            ],
          },
          {
            heading: 'Tips',
            bullets: [
              'Use photos with intentional color, not screenshots of another UI.',
              'Regenerate once if it looks muted; if it still does not work, edit roles manually.',
            ],
          },
        ],
      ),
      page(
        'panel-system',
        'About Craftie',
        'Colors panel: System',
        'Brand, foundations, statuses, and source colors.',
        'The System tab in the Colors panel is the hub for semantic editing. "Edit" opens focused views with image candidates, L/C derivation, and live contrast.',
        [],
        [],
        [],
        [
          {
            heading: 'Brand color',
            bullets: [
              'Primary, Secondary, Accent — 3 roles with "Edit".',
            ],
          },
          {
            heading: 'Foundations',
            bullets: [
              'Background, Surface, Border, Text — white, grays, and near-black with a subtle touch of brand hue, plus the full neutral scale (neutral-0 to neutral-1000).',
            ],
          },
          {
            heading: 'Status colors',
            bullets: [
              'Success, Warning, Danger (functional, not just decorative red/green).',
              '"Generate" populates the three statuses in the panel. "Edit" opens fine-tuning.',
              'Visible origin: Image, Adjusted, or Generated.',
            ],
          },
          {
            heading: 'Source colors',
            paragraphs: [
              'List of colors extracted from the image. Assign a HEX to a brand, accent, or status role from the context menu.',
            ],
          },
          {
            heading: 'Focused views',
            bullets: [
              'Tagged candidates (source / synthetic), "Unassigned" option.',
              'Inline L/C editor with preview on canvas.',
              'Progress counter toward "View brand guide".',
            ],
          },
        ],
      ),
      page(
        'panel-accents',
        'About Craftie',
        'Colors panel: Accents',
        'Six slots for graphics and highlights.',
        'The Accents tab manages 6 colors (Accent 1–6). The first is typically used in UI; 2–6 in charts and data. In export they can appear as data-1…data-6.',
        [],
        [],
        [],
        [
          {
            heading: 'Controls',
            bullets: [
              'Counter "X of 6" and warning if slots are missing.',
              'Candidates scored by usage: Text, Fill, Accent, Surface, Data.',
              '"Clear Accent N" or derive from primary.',
            ],
          },
          {
            heading: 'Color vision',
            paragraphs: [
              'When picking candidates, Craftie penalizes pairs that collapse under deuteranopia (educational tooltip). To see the whole canvas under another vision profile, use the "Vision" dropdown in the toolbar.',
            ],
          },
          {
            heading: 'Canvas',
            paragraphs: [
              'In the Colors canvas view, the "View accents" / "View roles" toolbar toggle switches views: 1 is used in UI; 2–6 in graphics. On mobile, switch canvas views with the View tab in the bottom dock.',
            ],
          },
        ],
      ),
      page(
        'canvas-palette',
        'About Craftie',
        'Canvas: role palette',
        'Columns, tools, and history on the canvas.',
        'The Colors view of the canvas displays columns per role (background, surface, text, primary, secondary, border; accent in a separate strip). It is a parallel model to the System panel: handy for comparing tones and using quick tools.',
        [],
        [],
        [],
        [
          {
            heading: 'Per-column toolbar',
            bullets: [
              'Lock — role does not change when regenerating (separately for light/dark theme).',
              'Copy HEX.',
              'Shades — 10 derived tones of the color.',
              'Info — drawer with NTC name, harmonies, copy, and replace color.',
              'Random color.',
            ],
          },
          {
            heading: 'Contrast on columns',
            bullets: [
              'Pass / Partial / Fail badges on each column.',
              'Floating alert if the role palette fails AA.',
            ],
          },
          {
            heading: 'History',
            bullets: [
              'Undo / Redo in toolbar (Ctrl/⌘+Z, Ctrl/⌘+Shift+Z, Ctrl/⌘+Y).',
              'Applies only to semantic palette edits, not typography or image.',
            ],
          },
        ],
      ),
      page(
        'semantic-roles',
        'About Craftie',
        'Semantic roles',
        'Stable function, interchangeable value.',
        'Panel roles (Background, Text, Primary…) export to tokens in English. Components consume the token; the HEX value can change without renaming anything.',
        [],
        [],
        [],
        [
          {
            heading: 'Panel → export',
            bullets: [
              'Background → background · Surface → surface · Text → on-background',
              'Primary → primary · Secondary → secondary · Accent → accent · Border → border',
              'Derived in export: on-primary, surface-elevated, success, warning, error, data-*…',
            ],
          },
          {
            heading: 'Practical rule',
            paragraphs: [
              'If changing the HEX forces you to rename the token, the name described appearance, not function.',
            ],
          },
        ],
        'semantic-roles',
      ),
      page(
        'contrast',
        'About Craftie',
        'Contrast and OKLCH',
        'Where to find WCAG, APCA, and L/C sliders.',
        'There is no dedicated side "inspector". Contrast is displayed on canvas badges, panel editors (focused views), popovers when editing inside mockups, and the semantic token editor.',
        [],
        [],
        [],
        [
          {
            heading: 'WCAG 2.2',
            bullets: [
              'Ratio, AA/AAA level, and pass/fail for the pair you are editing.',
              'Normal text ≥4.5:1 · large text ≥3:1.',
            ],
          },
          {
            heading: 'Tips when contrast fails',
            bullets: [
              'If a pair falls short of AA, the editor displays "X points needed for AA", a progress bar, and sample text.',
              'Suggests corrections in OKLCH (lighten or darken text or background) with the resulting ratio.',
              'You can only apply the correction for the side you are currently editing; the other side is a hint.',
              'When two or more roles fail, «Fix all» solves the whole palette: it looks for the smallest combined lightness change, keeps the hue and leaves locked roles alone. One undo reverts it.',
            ],
          },
          {
            heading: 'APCA',
            bullets: [
              'Complementary Lc score; warning if it diverges from WCAG.',
              '"Passes WCAG AA" and "APCA suggests…" are distinct criteria.',
            ],
          },
          {
            heading: 'OKLCH',
            bullets: [
              'L — lightness; primary control to fix contrast.',
              'C — chroma (saturation/intensity).',
              'H — hue; keep related roles in the same family.',
              'HEX as reference and for copying.',
              '"Why this color?" in the role editor explains the color with measured facts: origin, hue relative to the primary, lightness relative to its layer, chroma against the area it covers, required contrast and applied adjustments.',
            ],
          },
          {
            heading: 'Color vision simulation',
            bullets: [
              'The "Vision" selector in the canvas toolbar applies protanopia, deuteranopia, tritanopia, or grayscale across the active view.',
              'Helpful for detecting pairs distinguished only by hue, such as statuses or data series.',
              'Switch back to "Normal" to view true colors.',
            ],
          },
          {
            heading: 'Limitations',
            bullets: [
              'Does not audit keyboard navigation, ARIA, motion, or screen readers.',
              'Color vision simulation is approximate and view-only; it does not alter the palette or export.',
            ],
          },
        ],
      ),
      page(
        'typography',
        'About Craftie',
        'Typography',
        'Pairings, scale, and custom fonts.',
        'Typography tab in sidebar: popular and curated pairings, style mood recommendations, category filters, editable text roles, and custom font support (Google Fonts or local session file).',
        [],
        [],
        [],
        [
          {
            heading: 'Explore and apply',
            bullets: [
              '"Applied" zone with headline + body preview.',
              'Pin headline or body while browsing catalog.',
              'Hover: "Preview — click to apply".',
              'Top 3 recommended pairings tailored to active style mood.',
              'Most popular pairings bear a "Popular" badge and appear first.',
            ],
          },
          {
            heading: 'Scale',
            bullets: [
              'Base, ratio, and headline weight (500/600/700).',
              '"Type scale" canvas view, presented as a specimen sheet.',
              'Click a level to tweak weight, line height, and tracking for that level alone.',
            ],
          },
          {
            heading: 'Typographic roles',
            bullets: [
              'Ten roles: Hero, Display, Headline, Title, Body, Label, Caption, Button, Brand, and Overline.',
              'Each role maps to a scale step and either the headline or body font.',
              'Edit weight, size, line height, and tracking from the scale or by clicking text in a mockup ("Text" mode).',
              'By default edits apply to the entire role; toggle "This role only" to scope to one.',
              'Readability warnings if an adjustment hurts legibility; reset button available.',
              'Roles are exported into CSS, tokens, DESIGN.md, and brand kit.',
            ],
          },
          {
            heading: 'Custom fonts',
            bullets: [
              'Google Fonts by name or upload a local font file.',
              'Apply to Headline or Body; persists in sessionStorage (not in exported files).',
              'Export preserves family names; load them in your app (@import, next/font, @font-face).',
            ],
          },
        ],
      ),
      page(
        'canvas-views',
        'About Craftie',
        'Canvas views',
        'System, seven mockups, illustration, and Paint.',
        'The view selector groups: Palette (Colors, Paint), Design system, Mockups, and Exploration (Illustration). Switch views to find conflicts an isolated swatch never reveals.',
        [],
        [],
        [],
        [
          {
            heading: 'System',
            bullets: [
              'Style guide — color swatches + typography.',
              'Type scale — applied typographic hierarchy.',
              'Tonal scales — 50 to 900 ramps for Primary, Secondary, and Accent; click a step to adjust lightness and chroma with background contrast.',
              'Colors — roles, derived colors, and full system.',
            ],
          },
          {
            heading: 'Mockups',
            bullets: [
              'Dashboard · Landing · Player · Analytics (dark context) · Mobile app · Editorial · Store.',
              'Each mockup uses a browser or phone frame with realistic sample content.',
            ],
          },
          {
            heading: 'Edit from mockup',
            bullets: [
              'The "Click edits" toggle offers three modes: Locked, Color, and Text.',
              'Color: click an element → popover to edit semantic token (OKLCH + contrast with tips).',
              'Text: click any text → typographic role popover (weight, size, line height, tracking).',
              'Locked: browse mockup safely without triggering editors.',
            ],
          },
          {
            heading: 'Previews',
            bullets: [
              'Illustration — generative SVG composition; "Shuffle composition".',
              'Paint — palette treated as pigment (Gouache, Watercolor, Oil); exploratory, no roles or contrast.',
            ],
          },
          {
            heading: 'What to look for',
            bullets: [
              'Background/surface hierarchy, text legibility, primary action prominence.',
              'Dashboard vs. Landing for density contrast; Editorial for long-form reading, Store for product and pricing.',
              'Mobile app to check small screens and touch targets.',
            ],
          },
        ],
      ),
      page(
        'theme',
        'About Craftie',
        'Light and dark theme',
        'Header toggle and derived tokens.',
        'The Light/Dark toggle in the header switches studio UI and active palette theme. Craftie derives light and dark values for compatible tokens.',
        [],
        [],
        [],
        [
          {
            heading: 'In the studio',
            bullets: [
              'Sun/Moon toggle alongside Docs and Export.',
              'Analytics mockup to review layout in dark context.',
              'Role locking can differ between light and dark.',
            ],
          },
          {
            heading: 'In your app',
            bullets: [
              'CSS export includes `:root` and `[data-theme="dark"]`.',
              'Enable dark theme with `data-theme="dark"` on `<html>` or root container.',
            ],
          },
        ],
      ),
      page(
        'projects',
        'About Craftie',
        'Projects and links',
        'Autosave, My projects, and shareable link.',
        'Your work is not lost when you reload. Craftie autosaves a draft and lets you save multiple named versions as local projects, without an account.',
        [],
        [],
        [],
        [
          {
            heading: 'Autosaved draft',
            bullets: [
              'Changes save automatically in the browser; upon return, the studio restores the palette.',
              'The header indicates "Draft" until saved as a project.',
            ],
          },
          {
            heading: 'My projects',
            bullets: [
              'Open panel from header: save with name, rename, duplicate, or delete.',
              'Each project stores palette, typography, and thumbnail.',
              'Header status changes between Saving…, Saved, and "Failed to save".',
              'Home screen shows the last three projects under "Pick up where you left off".',
            ],
          },
          {
            heading: 'Shareable link',
            bullets: [
              'Export → Copy link generates a URL containing the palette in the hash.',
              'Whoever opens the link sees the exact same palette; no account or server needed.',
              'Damaged or overly long links are ignored and the normal studio opens.',
            ],
          },
          {
            heading: 'Limitations',
            bullets: [
              'Projects are local: they do not sync across browsers or devices.',
              'Clearing site data deletes draft and projects; export a brand kit if you want a backup.',
            ],
          },
        ],
      ),
      page(
        'export',
        'About Craftie',
        'Export',
        'Snapshot of the current selection.',
        'Export menu in header. Requires primary, background, and on-background. Downloads production-ready files; does not sync subsequent changes.',
        [],
        [],
        [],
        [
          {
            heading: 'Formats',
            bullets: [
              'Copy link — URL that restores this palette upon opening.',
              'Copy CSS — variables to clipboard, without downloading a file.',
              'CSS variables — light/dark custom properties.',
              'Design tokens (JSON) — W3C / Style Dictionary format.',
              'Figma (Tokens Studio) — JSON for manual import (not a plugin).',
              'Tailwind CSS v4 — `@theme` block with colors, fonts, and text roles; dark mode enabled with `data-theme="dark"`.' ,
              'shadcn/ui — `:root` and `.dark` variables mapped from roles, plus `@theme inline` bridge.',
              'DESIGN.md — Markdown guidelines for the repository.',
              'Brand kit (.json) — palette, roles, typography, and embedded DESIGN.md.',
              'Image (.png) — share card showcasing active palette and typography.',
            ],
          },
          {
            heading: 'What it includes',
            bullets: [
              'Semantic roles with their `on-*` counterpart, neutral scale, data series, and confirmed statuses.',
              'Tonal 50–900 ramps for Primary, Secondary, and Accent (`primary-500`, `accent-200`…), including any custom-tuned steps.',
              'Derived values for light and dark themes, so `[data-theme="dark"]` and `.dark` are complete.',
              'Typographic roles (Hero, Headline, Body…) with customizations in CSS, tokens, Tokens Studio, DESIGN.md, and brand kit.',
            ],
          },
          {
            heading: 'After download',
            bullets: [
              'Confirmation toast (e.g. "tokens.css downloaded").',
              'Commit the file alongside code that consumes it.',
              '"Test the shadcn/ui theme" opens the exported theme in the tester (/tools/theme-tester): a sample page painted only with those variables, plus the WCAG audit of each pair in light and dark.',
            ],
          },
          {
            heading: 'Example',
            code: '.button-primary {\n  background: var(--color-primary);\n  color: var(--color-on-primary);\n}',
          },
        ],
        'export',
      ),
      page(
        'help-shortcuts',
        'About Craftie',
        'Help, shortcuts, and reset',
        'Header, keyboard, and starting over.',
        'Beyond these docs, the studio includes Quick Guide in the header and shortcuts for brand guide and color history.',
        [],
        [],
        [],
        [
          {
            heading: 'Quick guide (header)',
            paragraphs: [
              'Help button: summary of Inspiration, Colors, Accessibility, Typography, and Export. Distinct from `/docs`.',
            ],
          },
          {
            heading: 'Shortcuts',
            bullets: [
              'Ctrl/⌘+Enter — View brand guide.',
              'Ctrl/⌘+Z — Undo palette edit.',
              'Ctrl/⌘+Shift+Z or Ctrl/⌘+Y — Redo.',
              'Alt+R (⌥+R on Mac) — try another palette; respects locked roles.',
              'Esc — close open menus or modals.',
            ],
          },
          {
            heading: 'Reset',
            paragraphs: [
              'Click Craftie logo with active progress → confirmation dialog to start over. Current draft is discarded; projects saved in My projects are preserved.',
            ],
          },
          {
            heading: 'Currently unavailable',
            bullets: [
              '? shortcut for shortcuts panel (defined in code, not mounted).',
              'Vibrancy calibrator in UI (logic exists, no visible control).',
            ],
          },
        ],
      ),
      page(
        'faq',
        'About Craftie',
        'FAQ and limitations',
        'Persistence, frequently asked questions, and honest limits.',
        'Craftie is an in-browser studio. Some engine capabilities have no UI control; other views in code are not in the canvas selector.',
        [],
        [],
        [],
        [
          {
            heading: 'What is stored locally',
            bullets: [
              'localStorage: autosaved palette draft, panel layout, font pairing, and workspace session preferences.',
              'IndexedDB: My projects (palette, typography, and thumbnail).',
              'sessionStorage: custom fonts for the session.',
              'Not stored: original image file or local font files.',
              'Everything stays in your browser; clearing site data wipes it.',
            ],
          },
          {
            heading: 'Frequently asked questions',
            bullets: [
              'Studio vs. docs? `/` builds · `/docs` documents.',
              'Can I start from a single color? Yes: "Start from a color (HEX)" on the home screen.',
              'How do I share a palette? Export → Copy link.',
              'Can I install or use offline? Yes: browser offers installation and, after first visit, studio and tools load offline (in production build).',
              'Are there standalone tools? Yes: `/tools/contrast-checker`, `/tools/palette-from-image`, and `/palettes`.',
              'Is English available? Yes: the ES/EN button in the header (or mobile menu) switches language and remembers your preference in this browser across the studio, docs, and tools.',
              'Is work lost when closing tab? No: autosaved as draft; save as project to keep multiple versions.',
              'Export disabled? Missing primary, background, or on-background.',
              'Tonal 50–900 scales in UI? Yes: "Tonal scales" view in canvas selector. Adjustments export as primary-500, accent-200…',
              'Figma plugin? No; manual Tokens Studio JSON import only.',
            ],
          },
        ],
      ),
    ],
  },
];
