import { describe, expect, it } from 'vitest';

import { contrastRatio, hexToOklchChannels } from '../utils/colorMath';
import {
  buildUiStatusColors,
  buildUiStatusCandidates,
  STATUS_CHROMA_FLOORS,
  STATUS_ON_COLOR_MIN_CONTRAST,
  STATUS_COLORS_ON_DEMAND,
  statusAcceptsSource,
  statusColorCssVariables,
} from './uiStatusColors';

const earthPalette = [
  { hex: '#77733A', prominence: 0.45 },
  { hex: '#B96521', prominence: 0.35 },
  { hex: '#D8C99A', prominence: 0.2 },
];

const mutedOlivePalette = [
  { hex: '#8D928A', prominence: 0.34 },
  { hex: '#8A704E', prominence: 0.33 },
  { hex: '#B5817D', prominence: 0.33 },
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

  it('offers source and derived inline candidates inside the status hue range', () => {
    const statuses = buildUiStatusColors({ colors: earthPalette, backgroundHex: '#FAF7F2' });
    const candidates = buildUiStatusCandidates({
      role: 'warning',
      colors: earthPalette,
      backgroundHex: '#FAF7F2',
      current: statuses.warning,
    });

    expect(candidates.some((candidate) => candidate.origin === 'found')).toBe(true);
    expect(candidates.some((candidate) => candidate.origin === 'synthetic')).toBe(true);
    expect(candidates.every((candidate) => candidate.hueDrift <= 25)).toBe(true);
  });

  it('preserves the chosen status origin when an inline candidate is forced', () => {
    const statuses = buildUiStatusColors({
      colors: earthPalette,
      backgroundHex: '#FAF7F2',
      forcedColors: { warning: { hex: '#8A7028', origin: 'synthetic' } },
    });

    expect(statuses.warning.origin).toBe('synthetic');
    expect(hexToOklchChannels(statuses.warning.hex).c).toBeGreaterThanOrEqual(
      STATUS_CHROMA_FLOORS.warning,
    );
  });

  it('enforces per-role chroma floors and roomy on-color contrast for a muted olive palette', () => {
    const statuses = buildUiStatusColors({ colors: mutedOlivePalette, backgroundHex: '#FAF7F2' });

    for (const role of ['success', 'warning', 'danger'] as const) {
      expect(hexToOklchChannels(statuses[role].hex).c).toBeGreaterThanOrEqual(
        STATUS_CHROMA_FLOORS[role],
      );
      expect(contrastRatio(statuses[role].onHex, statuses[role].hex)).toBeGreaterThanOrEqual(
        STATUS_ON_COLOR_MIN_CONTRAST,
      );
      expect(statuses[role].contrastWithOnColor).toBeGreaterThanOrEqual(
        STATUS_ON_COLOR_MIN_CONTRAST,
      );
      expect(statuses[role].origin).toBe('found-adjusted');
    }
  });

  it('adjusts washed-out source candidates and always includes a full-chroma synthetic', () => {
    const statuses = buildUiStatusColors({ colors: mutedOlivePalette, backgroundHex: '#FAF7F2' });
    const candidates = buildUiStatusCandidates({
      role: 'danger',
      colors: mutedOlivePalette,
      backgroundHex: '#FAF7F2',
      current: statuses.danger,
    });

    expect(candidates.every((candidate) =>
      hexToOklchChannels(candidate.hex).c >= STATUS_CHROMA_FLOORS.danger,
    )).toBe(true);
    expect(candidates.some((candidate) => candidate.origin === 'found-adjusted')).toBe(true);
    expect(candidates.some((candidate) =>
      candidate.id === 'synthetic-anchor-danger'
      && candidate.origin === 'synthetic'
      && hexToOklchChannels(candidate.hex).c > STATUS_CHROMA_FLOORS.danger,
    )).toBe(true);
  });
});
