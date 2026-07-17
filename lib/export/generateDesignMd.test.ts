import { describe, expect, it } from 'vitest';

import type { GeneratedPalette } from '../color/formulas';
import { PALETTE_ROLE_ORDER, type PaletteSeeds, type RolePalette } from '../color/rolePalette';
import {
  rolePaletteToCssCustomProperties,
  themePalettesToCssCustomProperties,
} from './designTokens';
import { buildBrandKit } from './brandKit';
import { buildExportTokenSet } from './exportTokenSet';
import { generateDesignMd } from './generateDesignMd';
import { assignRolesFromHexes } from '../color/rolePalette';

function mockRolePalette(hexByRole: Record<string, string>): RolePalette {
  return Object.fromEntries(
    PALETTE_ROLE_ORDER.map((role) => [
      role,
      {
        role,
        hex: hexByRole[role] ?? '#000000',
        name: role,
        source: 'extracted' as const,
      },
    ]),
  ) as RolePalette;
}

describe('designTokens', () => {
  it('exports pasteable css custom properties by role', () => {
    const rolePalette = mockRolePalette({
      fondo: '#F7F7F5',
      superficie: '#EFEFE8',
      texto: '#2C3E50',
      primario: '#9ADBD6',
      secundario: '#E8D44D',
      acento: '#F4A261',
      borde: '#D9D7D0',
    });

    const css = rolePaletteToCssCustomProperties(rolePalette);

    expect(css).toBe(`:root {
  --color-fondo: #F7F7F5;
  --color-superficie: #EFEFE8;
  --color-texto: #2C3E50;
  --color-primario: #9ADBD6;
  --color-secundario: #E8D44D;
  --color-acento: #F4A261;
  --color-borde: #D9D7D0;
}`);
  });

  it('exports light and dark theme css blocks', () => {
    const assigned = assignRolesFromHexes(['#F7F7F5', '#9ADBD6', '#F4A261']);
    const seeds = {
      primario: assigned.primario.hex,
      acento: assigned.acento.hex,
      neutralHue: 180,
    };
    const css = themePalettesToCssCustomProperties(seeds);
    const darkSection = css.split('[data-theme="dark"]')[1] ?? '';

    expect(css).toContain(':root {');
    expect(css).toContain('[data-theme="dark"] {');
    expect(darkSection).not.toContain(`--color-fondo: ${assigned.fondo.hex.toUpperCase()};`);
  });
});

describe('generateDesignMd', () => {
  it('includes English semantic tokens and pasteable css', () => {
    const set = buildExportTokenSet({
      rolePalette: mockRolePalette({
        fondo: '#F7F7F5',
        superficie: '#EFEFE8',
        texto: '#2C3E50',
        primario: '#9ADBD6',
        secundario: '#E8D44D',
        acento: '#F4A261',
        borde: '#D9D7D0',
      }),
      tokenOverridesByTheme: {
        light: {},
        dark: { primary: '#4E8F8B' },
      },
      pairing: null,
      name: 'Test Kit',
      exportedAt: '2026-07-16T00:00:00.000Z',
    });
    const md = generateDesignMd(set);

    expect(md).toContain('name: Test Kit');
    expect(md).toContain('light:');
    expect(md).toContain('dark:');
    expect(md).toContain('primary: "#9ADBD6"');
    expect(md).toContain('```css');
    expect(md).toContain(':root {');
    expect(md).toContain('[data-theme="dark"] {');
    expect(md).toContain('--color-primary: #9ADBD6;');
    expect(md).not.toContain('--color-primario');
    expect(md).toContain('| `--color-primary` | primary | `#9ADBD6` | `#4E8F8B` |');
    expect(md).toContain('## Tokens de color (CSS)');
    expect(md).toContain('## Typography');
    expect(md).toContain('- **Display / Headline:** —');
    expect(md).toContain('`--color-on-background`');
    expect(md).toContain('data-theme="dark"');
  });

  it('omits dark frontmatter when the set has no dark values', () => {
    const set = buildExportTokenSet({
      rolePalette: mockRolePalette({}),
      tokenOverridesByTheme: { light: {}, dark: {} },
      pairing: null,
      name: 'Light Kit',
      exportedAt: '2026-07-16T00:00:00.000Z',
    });

    const md = generateDesignMd(set);
    const frontmatter = md.split('---')[1] ?? '';

    expect(frontmatter).not.toContain('  dark:');
    expect(md).toContain('| `--color-primary` | primary | `#000000` | `—` |');
  });

  it('supports legacy seeds/themes overload with English tokens and dark', () => {
    const seeds: PaletteSeeds = {
      primario: '#9ADBD6',
      acento: '#F4A261',
      neutralHue: 180,
    };
    const md = generateDesignMd({
      seeds,
      pairing: null,
      kitName: 'Legacy Kit',
    });

    expect(md).toContain('name: Legacy Kit');
    expect(md).toContain('primary:');
    expect(md).toContain('--color-primary:');
    expect(md).toContain('[data-theme="dark"]');
    expect(md).not.toContain('--color-primario');
  });
});

describe('buildBrandKit', () => {
  it('embeds dark theme in designMd when given legacy seeds/themes', () => {
    const palette: GeneratedPalette = {
      primary: '#9ADBD6',
      accent: '#F4A261',
      surface: '#F7F7F5',
      onSurface: '#2C3E50',
      neutralLight: '#EFEFE8',
      neutralDark: '#2C3E50',
    };
    const rolePalette = mockRolePalette({
      fondo: '#F7F7F5',
      superficie: '#EFEFE8',
      texto: '#2C3E50',
      primario: '#9ADBD6',
      secundario: '#E8D44D',
      acento: '#F4A261',
      borde: '#D9D7D0',
    });
    const seeds: PaletteSeeds = {
      primario: '#9ADBD6',
      acento: '#F4A261',
      neutralHue: 180,
    };

    const kit = buildBrandKit(palette, rolePalette, null, 'Craftie Kit', {
      seeds,
      themes: { light: { overrides: {} }, dark: { overrides: {} } },
    });

    expect(kit.designMd).toContain('[data-theme="dark"]');
    expect(kit.designMd).toContain('--color-primary:');
    expect(kit.designMd).not.toContain('--color-primario');
  });
});
