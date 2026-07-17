import { describe, expect, it } from 'vitest';

import {
  DASHBOARD_METRICS,
  DASHBOARD_NAV,
  PALETTE_REVIEW_ROLES,
  buildDashboardActivity,
  getPaletteReviewStatus,
  getPaletteProgressNote,
  getStudioGreeting,
  getWeeklyRhythmNote,
} from './dashboardPreviewData';
import { DASHBOARD_CONTAINER_CLASS } from './DashboardLayoutPreview';

describe('Craftie dashboard content', () => {
  it('uses its own preview width as the responsive breakpoint context', () => {
    expect(DASHBOARD_CONTAINER_CLASS).toContain('@container/dashboard');
  });

  it('models a dog designer studio instead of a generic revenue dashboard', () => {
    expect(DASHBOARD_NAV.map((item) => item.label)).toEqual([
      'Estudio',
      'Proyectos',
      'Paletas',
      'Entregables',
    ]);
    expect(DASHBOARD_METRICS.map((metric) => metric.label)).toEqual([
      'Proyectos',
      'Paletas',
      'Contraste AA',
      'Entregas',
    ]);
  });

  it('greets the studio with time-aware copy', () => {
    expect(getStudioGreeting(9)).toBe('Buenos días, diseñadora');
    expect(getStudioGreeting(15)).toBe('Buenas tardes, diseñadora');
    expect(getStudioGreeting(21)).toBe('Buenas noches, diseñadora');
  });

  it('offers encouraging studio notes at milestone thresholds', () => {
    expect(getWeeklyRhythmNote(92)).toBe('Casi en el lienzo.');
    expect(getPaletteProgressNote(68)).toBe('Naming y color ya conversan.');
  });

  it('reviews the palette by named roles, one per data color', () => {
    expect(PALETTE_REVIEW_ROLES.map((role) => role.label)).toEqual([
      'Primario',
      'Acento',
      'Fondo',
      'Apoyo',
    ]);
    expect(PALETTE_REVIEW_ROLES.map((role) => role.slot)).toEqual([
      'data1',
      'data2',
      'data3',
      'data4',
    ]);
  });

  it('summarizes the review status from pending role adjustments', () => {
    expect(getPaletteReviewStatus(0)).toBe('Lista para exportar');
    expect(getPaletteReviewStatus(1)).toBe('1 ajuste pendiente');
    expect(getPaletteReviewStatus(2)).toBe('2 ajustes pendientes');
  });

  it('uses studio activity that exercises three data colors', () => {
    const activity = buildDashboardActivity({
      data1: '#111111',
      data2: '#222222',
      data3: '#333333',
    });

    expect(activity.map((item) => item.color)).toEqual([
      '#111111',
      '#222222',
      '#333333',
    ]);
    expect(activity.every((item) => item.label.length > 0)).toBe(true);
  });
});
