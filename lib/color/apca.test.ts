import { describe, expect, it } from 'vitest';

import { apcaContrast, passesApcaBodyText } from './apca';

describe('APCA contrast', () => {
  it('keeps polarity and accepts strong text pairs', () => {
    expect(apcaContrast('#111827', '#F3F4F6')).toBeGreaterThan(60);
    expect(apcaContrast('#F3F4F6', '#111827')).toBeLessThan(-60);
    expect(passesApcaBodyText('#111827', '#F3F4F6')).toBe(true);
  });

  it('rejects nearly identical colors', () => {
    expect(Math.abs(apcaContrast('#777777', '#787878'))).toBeLessThan(10);
  });
});
