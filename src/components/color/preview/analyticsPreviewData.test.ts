import { describe, expect, it } from 'vitest';

import {
  ANALYTICS_CONTAINER_CLASS,
  ANALYTICS_CONTRAST_ROWS,
  ANALYTICS_DELIVERY_TYPES,
  ANALYTICS_GOALS,
  ANALYTICS_KPIS,
  ANALYTICS_WEEKLY_DELIVERIES,
  deliveryWeekTotal,
  getAnalyticsGreeting,
} from './analyticsPreviewData';

describe('Craftie analytics content', () => {
  it('uses its own preview width as the responsive breakpoint context', () => {
    expect(ANALYTICS_CONTAINER_CLASS).toContain('@container/analytics');
  });

  it('tracks design-studio KPIs', () => {
    expect(ANALYTICS_KPIS.map((kpi) => kpi.label)).toEqual([
      'Paletas',
      'Contraste AA',
      'Guías',
      'Pendientes',
    ]);
  });

  it('sets goals around the studio workflow', () => {
    expect(ANALYTICS_GOALS.map((goal) => goal.label)).toEqual([
      'Cerrar 50 paletas',
      'Pulir 20 guías',
      'Probar 40 parejas tipográficas',
      'Contraste AA en todos los roles',
    ]);
  });

  it('stacks weekly deliveries by type, one series color each', () => {
    expect(ANALYTICS_DELIVERY_TYPES.map((type) => type.label)).toEqual(['Guías', 'Paletas', 'Tokens']);
    expect(new Set(ANALYTICS_DELIVERY_TYPES.map((type) => type.slot)).size).toBe(3);
    expect(ANALYTICS_WEEKLY_DELIVERIES).toHaveLength(12);
    expect(deliveryWeekTotal({ week: 'S1', guides: 1, palettes: 2, tokens: 3 })).toBe(6);
  });

  it('never reports more passing contrast pairs than exist', () => {
    for (const row of ANALYTICS_CONTRAST_ROWS) {
      expect(row.passing).toBeLessThanOrEqual(row.total);
    }
  });

  it('greets the studio by time of day', () => {
    expect(getAnalyticsGreeting(9)).toBe('Buenos días, estudio');
    expect(getAnalyticsGreeting(21)).toBe('Buenas noches, estudio');
  });
});
