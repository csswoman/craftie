import { describe, expect, it } from 'vitest';

import {
  ANALYTICS_CHAT,
  ANALYTICS_CONTAINER_CLASS,
  ANALYTICS_ENERGY_INSIGHTS,
  ANALYTICS_GOALS,
  ANALYTICS_KPIS,
  ANALYTICS_TREAT_BREAKDOWN,
  ANALYTICS_RECENT_TREATS,
  getAnalyticsGreeting,
} from './analyticsPreviewData';

describe('Craftie analytics content', () => {
  it('uses its own preview width as the responsive breakpoint context', () => {
    expect(ANALYTICS_CONTAINER_CLASS).toContain('@container/analytics');
  });

  it('tracks dog-day KPIs instead of SaaS traffic metrics', () => {
    expect(ANALYTICS_KPIS.map((kpi) => kpi.label)).toEqual([
      'Croquetas',
      'Km corridos',
      'Pelota',
      'Siestas',
    ]);
  });

  it('sets goals around Craftie dog activities', () => {
    expect(ANALYTICS_GOALS.map((goal) => goal.label)).toEqual([
      'Comer 1000 croquetas',
      'Correr 10 km',
      'Jugar a la pelota',
      'Chat contigo',
    ]);
  });

  it('breaks down premios into Craftie treat types', () => {
    expect(ANALYTICS_TREAT_BREAKDOWN.map((item) => item.label)).toEqual([
      'Croquetas',
      'Juguetes',
      'Caricias',
    ]);
  });

  it('fills weekly energy with peak and comparison insights', () => {
    expect(ANALYTICS_ENERGY_INSIGHTS.map((item) => item.label)).toEqual([
      'Pico',
      'Media',
      'Vs anterior',
    ]);
  });

  it('lists recent Craftie treats under Premios', () => {
    expect(ANALYTICS_RECENT_TREATS.map((item) => item.title)).toEqual([
      'Croqueta dorada',
      'Pelota nueva',
      'Siesta premium',
    ]);
  });

  it('opens a chat with Craftie, not a generic teammate', () => {
    expect(ANALYTICS_CHAT.name).toBe('Craftie');
    expect(ANALYTICS_CHAT.messages.some((message) => message.incoming)).toBe(true);
  });

  it('greets Craftie by time of day', () => {
    expect(getAnalyticsGreeting(9)).toBe('Buenos días, Craftie');
    expect(getAnalyticsGreeting(21)).toBe('Buenas noches, Craftie');
  });
});
