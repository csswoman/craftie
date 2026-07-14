import { describe, expect, it } from 'vitest';

import { contrastRatio, hexToOklchChannels } from '../utils/colorMath';
import {
  buildUiStatusColors,
  STATUS_COLORS_ON_DEMAND,
  statusAcceptsSource,
  statusColorCssVariables,
} from './uiStatusColors';

const earthPalette = [
  { hex: '#77733A', prominence: 0.45 },
  { hex: '#B96521', prominence: 0.35 },
  { hex: '#D8C99A', prominence: 0.2 },
];

describe('UI status colors', () => {
  it('is opt-in by default', () => {
    expect(STATUS_COLORS_ON_DEMAND).toBe(true);
  });

  it('finds an earthy warning and synthesizes a recognizable danger', () => {
    const statuses = buildUiStatusColors({ colors: earthPalette, backgroundHex: '#FAF7F2' });
    expect(statuses.warning.origin).toBe('found');
    expect(statuses.warning.sourceHex).toBe('#B96521');
    expect(statuses.danger.origin).toBe('synthetic');
    expect(statuses.danger.hueDrift).toBeLessThan(5);
    expect(hexToOklchChannels(statuses.danger.hex).h).toBeGreaterThanOrEqual(15);
    expect(hexToOklchChannels(statuses.danger.hex).h).toBeLessThanOrEqual(35);
    expect(contrastRatio(statuses.danger.onHex, statuses.danger.hex)).toBeGreaterThanOrEqual(4.5);
  });

  it('exposes status and foreground custom properties', () => {
    const statuses = buildUiStatusColors({ colors: earthPalette, backgroundHex: '#FAF7F2' });
    expect(statusColorCssVariables(statuses)).toMatchObject({
      '--c-success': statuses.success.hex,
      '--c-on-danger': statuses.danger.onHex,
    });
    expect(statusAcceptsSource('warning', '#B96521')).toBe(true);
    expect(statusAcceptsSource('danger', '#77733A')).toBe(false);
  });
});
