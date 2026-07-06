import { describe, expect, it } from 'vitest';

import { PALETTE_ROLE_ORDER, type PaletteSeeds, type RolePalette } from '../color/rolePalette';
import {
  rolePaletteToCssCustomProperties,
  themePalettesToCssCustomProperties,
} from './designTokens';
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

const mockSeeds: PaletteSeeds = {
  primario: '#9ADBD6',
  acento: '#F4A261',
  neutralHue: 180,
};

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
  it('includes role tokens in frontmatter and a pasteable css block', () => {
    const md = generateDesignMd({
      seeds: mockSeeds,
      pairing: null,
      kitName: 'Test Kit',
    });

    expect(md).toContain('name: Test Kit');
    expect(md).toContain('light:');
    expect(md).toContain('dark:');
    expect(md).toContain('primario: "#9ADBD6"');
    expect(md).toContain('```css');
    expect(md).toContain(':root {');
    expect(md).toContain('[data-theme="dark"] {');
    expect(md).toContain('--color-primario: #9ADBD6;');
    expect(md).toContain('## Tokens de color (CSS)');
    expect(md).toContain('## Typography');
    expect(md).toContain('`--color-texto`');
    expect(md).toContain('data-theme="dark"');
  });
});
