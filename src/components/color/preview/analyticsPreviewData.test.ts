import { describe, expect, it } from 'vitest';

import {
  ANALYTICS_CHAT,
  ANALYTICS_CONTAINER_CLASS,
  ANALYTICS_ENERGY_INSIGHTS,
  ANALYTICS_GOALS,
  ANALYTICS_KPIS,
  ANALYTICS_RECENT_TREATS,
  ANALYTICS_SETTINGS,
  ANALYTICS_TREAT_BREAKDOWN,
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

  it('breaks down deliveries by type', () => {
    expect(ANALYTICS_TREAT_BREAKDOWN.map((item) => item.label)).toEqual([
      'Guías',
      'Paletas',
      'Tokens',
    ]);
  });

  it('fills weekly activity with peak and comparison insights', () => {
    expect(ANALYTICS_ENERGY_INSIGHTS.map((item) => item.label)).toEqual([
      'Pico',
      'Media',
      'Vs anterior',
    ]);
  });

  it('lists recent deliveries', () => {
    expect(ANALYTICS_RECENT_TREATS.map((item) => item.title)).toEqual([
      'Guía Terracota entregada',
      'Paleta Salvia aprobada',
      'Pareja tipográfica elegida',
    ]);
  });

  it('opens a review thread with a reviewer', () => {
    expect(ANALYTICS_CHAT.name).toBe('Lucía Ríos');
    expect(ANALYTICS_CHAT.messages.some((message) => message.incoming)).toBe(true);
  });

  it('keeps settings ids unique', () => {
    const ids = ANALYTICS_SETTINGS.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('greets the studio by time of day', () => {
    expect(getAnalyticsGreeting(9)).toBe('Buenos días, estudio');
    expect(getAnalyticsGreeting(21)).toBe('Buenas noches, estudio');
  });
});
