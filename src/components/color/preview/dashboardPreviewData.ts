import type { PreviewIconName } from './previewIcons';

export const DASHBOARD_NAV: Array<{ label: string; icon: PreviewIconName }> = [
  { label: 'Estudio', icon: 'grid' },
  { label: 'Proyectos', icon: 'activity' },
  { label: 'Paletas', icon: 'layers' },
  { label: 'Entregables', icon: 'check' },
];

export const DASHBOARD_RANGES = ['7d', '30d', '90d'] as const;

export type DashboardRange = (typeof DASHBOARD_RANGES)[number];

export const DASHBOARD_METRICS = [
  { label: 'Proyectos', value: '12', trend: '2', dir: 'up' as const, trendSlot: 'data1', spark: [6, 8, 7, 9, 8, 11, 12] },
  { label: 'Paletas', value: '28', trend: '14%', dir: 'up' as const, trendSlot: 'data2', spark: [12, 15, 14, 18, 21, 24, 28] },
  { label: 'Contraste AA', value: '96%', trend: '4%', dir: 'up' as const, trendSlot: 'data3', spark: [76, 82, 85, 87, 91, 94, 96] },
  { label: 'Entregas', value: '7', trend: '1', dir: 'down' as const, trendSlot: 'data4', spark: [12, 11, 10, 10, 9, 8, 7] },
] as const;

export function getStudioGreeting(hour: number): string {
  if (hour < 6) return 'Buenas noches, diseñadora';
  if (hour < 12) return 'Buenos días, diseñadora';
  if (hour < 19) return 'Buenas tardes, diseñadora';
  return 'Buenas noches, diseñadora';
}

export const STUDIO_GREETING_FALLBACK = 'Buenas tardes, diseñadora';

export const STUDIO_SUBTITLE = 'Hay color por secar en el estudio.';

export function getWeeklyRhythmNote(percent: number): string {
  if (percent >= 90) return 'Casi en el lienzo.';
  if (percent >= 70) return 'El estudio va con buen ritmo.';
  return 'Sigue mezclando.';
}

export function getPaletteProgressNote(percent: number): string {
  if (percent >= 80) return 'Lista para exportar pronto.';
  if (percent >= 50) return 'Naming y color ya conversan.';
  return 'Aún en boceto.';
}

export function previewStaggerDelay(index: number, stepMs = 55): string {
  return `${index * stepMs}ms`;
}

export const PALETTE_REVIEW_ROLES = [
  { label: 'Primario', slot: 'data1', pending: false },
  { label: 'Acento', slot: 'data2', pending: false },
  { label: 'Fondo', slot: 'data3', pending: true },
  { label: 'Apoyo', slot: 'data4', pending: false },
] as const;

export function getPaletteReviewStatus(pendingCount: number): string {
  if (pendingCount === 0) return 'Lista para exportar';
  if (pendingCount === 1) return '1 ajuste pendiente';
  return `${pendingCount} ajustes pendientes`;
}

export function buildDashboardActivity(colors: {
  data1: string;
  data2: string;
  data3: string;
}) {
  return [
    { label: 'Paleta Bosque aprobada', detail: 'Marca Lupo · hace 2 min', initials: 'LB', color: colors.data1, slot: 'data1' as const },
    { label: 'Guía de marca exportada', detail: 'Estudio Nube · hace 18 min', initials: 'EN', color: colors.data2, slot: 'data2' as const },
    { label: 'Contraste ajustado a AAA', detail: 'Atelier Pigmento · hace 1 h', initials: 'AP', color: colors.data3, slot: 'data3' as const },
  ] as const;
}
