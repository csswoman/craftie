import { describe, expect, it } from 'vitest';

import type { GeneratedPalette } from '../color/formulas';
import { generateDesignMd } from './generateDesignMd';

const palette: GeneratedPalette = {
  primary: '#2F5644',
  accent: '#3D6A8A',
  surface: '#F7F7F7',
  onSurface: '#2A2F2D',
  neutralLight: '#E3E5E4',
  neutralDark: '#5C6561',
};

describe('generateDesignMd', () => {
  it('includes palette roles and typography frontmatter', () => {
    const md = generateDesignMd({
      palette,
      pairing: null,
      kitName: 'Test Kit',
    });

    expect(md).toContain('name: Test Kit');
    expect(md).toContain('primary: "#2F5644"');
    expect(md).toContain('## Colors');
    expect(md).toContain('## Typography');
  });
});
