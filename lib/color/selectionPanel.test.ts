import { describe, expect, it } from 'vitest';

import { assignRolesFromExtracted } from './rolePalette';
import { getRolePalettePanelStatus } from './selectionPanel';

describe('selectionPanel', () => {
  it('reports not ready when palette is missing', () => {
    const status = getRolePalettePanelStatus(null);

    expect(status.ready).toBe(false);
  });

  it('reports ready state for a role palette', () => {
    const palette = assignRolesFromExtracted([
      { hex: '#F7F7F5', prominence: 0.35 },
      { hex: '#9ADBD6', prominence: 0.2 },
      { hex: '#E8D44D', prominence: 0.15 },
      { hex: '#2C3E50', prominence: 0.1 },
    ]);

    const status = getRolePalettePanelStatus(palette);

    expect(status.ready).toBe(true);
  });
});
