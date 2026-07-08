import { describe, expect, it } from 'vitest';

import { getLayoutMode, layoutModeTokenEntries, type LayoutModeId, type LayoutSlot } from '@lib/color/layoutModes';

import { ANALYTICS_VISUAL_SLOTS } from './AnalyticsLayoutPreview';
import { DASHBOARD_VISUAL_SLOTS } from './DashboardLayoutPreview';
import { LANDING_VISUAL_SLOTS } from './LandingLayoutPreview';
import { MEDIA_VISUAL_SLOTS } from './MediaLayoutPreview';

const MODE_VISUAL_SLOTS: Record<LayoutModeId, readonly LayoutSlot[]> = {
  dashboard: DASHBOARD_VISUAL_SLOTS,
  landing: LANDING_VISUAL_SLOTS,
  media: MEDIA_VISUAL_SLOTS,
  analytics: ANALYTICS_VISUAL_SLOTS,
};

describe('layout preview slot wiring', () => {
  it('resolves every visually used slot to a semantic token through the mode mapping', () => {
    for (const [modeId, slots] of Object.entries(MODE_VISUAL_SLOTS) as Array<[LayoutModeId, readonly LayoutSlot[]]>) {
      const mode = getLayoutMode(modeId);
      const mappedSlots = new Map(layoutModeTokenEntries(mode));

      for (const slot of slots) {
        expect(mappedSlots.get(slot), `${modeId}:${slot}`).toBeTruthy();
      }
    }
  });
});
