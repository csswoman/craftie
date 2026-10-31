import type { UiLayoutSlot } from '@lib/color/layoutModes';

export const ANALYTICS_CONTAINER_CLASS = 'preview-root @container/analytics';

/** One two-column split for every row, so panel edges line up down the whole page. */
export const ANALYTICS_SPLIT_CLASS = '@min-[800px]/analytics:grid-cols-[minmax(0,1.5fr)_minmax(17rem,1fr)]';

export const ANALYTICS_TABS = ['Resumen', 'Paletas', 'Contraste', 'Entregas'] as const;
export const ANALYTICS_RANGES = ['7d', '30d', '90d'] as const;

export const ANALYTICS_KPIS = [
  { label: 'Paletas', value: '42', trend: '6', dir: 'up' as const, slot: 'data1' as const, spark: [24, 28, 27, 33, 36, 39, 42] },
  { label: 'Contraste AA', value: '96%', trend: '4%', dir: 'up' as const, slot: 'data2' as const, spark: [78, 82, 85, 88, 91, 94, 96] },
  { label: 'Guías', value: '18', trend: '3', dir: 'up' as const, slot: 'data3' as const, spark: [4, 6, 5, 9, 11, 14, 18] },
  { label: 'Pendientes', value: '3', trend: '1', dir: 'down' as const, slot: 'data6' as const, spark: [5, 4, 4, 3, 3, 3, 3] },
] as const;

/** Delivery types, stacked bottom to top in the weekly chart. */
export const ANALYTICS_DELIVERY_TYPES = [
  { key: 'guides', label: 'Guías', slot: 'data1' as const },
  { key: 'palettes', label: 'Paletas', slot: 'data2' as const },
  { key: 'tokens', label: 'Tokens', slot: 'data3' as const },
] as const;

export type DeliveryWeek = { week: string; guides: number; palettes: number; tokens: number };

export const ANALYTICS_WEEKLY_DELIVERIES: DeliveryWeek[] = [
  { week: 'S1', guides: 8, palettes: 6, tokens: 4 },
  { week: 'S2', guides: 10, palettes: 5, tokens: 6 },
  { week: 'S3', guides: 7, palettes: 8, tokens: 5 },
  { week: 'S4', guides: 12, palettes: 7, tokens: 6 },
  { week: 'S5', guides: 11, palettes: 9, tokens: 8 },
  { week: 'S6', guides: 9, palettes: 6, tokens: 7 },
  { week: 'S7', guides: 14, palettes: 8, tokens: 9 },
  { week: 'S8', guides: 13, palettes: 10, tokens: 8 },
  { week: 'S9', guides: 15, palettes: 9, tokens: 11 },
  { week: 'S10', guides: 12, palettes: 11, tokens: 10 },
  { week: 'S11', guides: 17, palettes: 10, tokens: 12 },
  { week: 'S12', guides: 19, palettes: 12, tokens: 13 },
];

export function deliveryWeekTotal(week: DeliveryWeek): number {
  return week.guides + week.palettes + week.tokens;
}

export const ANALYTICS_ACTIVITY_MIX = [
  { label: 'Color', value: 32, display: '32%', slot: 'data1' as const },
  { label: 'Tipografía', value: 24, display: '24%', slot: 'data2' as const },
  { label: 'Contraste', value: 20, display: '20%', slot: 'data3' as const },
  { label: 'Maquetas', value: 14, display: '14%', slot: 'data4' as const },
  { label: 'Exportar', value: 10, display: '10%', slot: 'data5' as const },
] as const;

/** Palettes under review: which colors they use and how many text pairs pass AA. */
export const ANALYTICS_CONTRAST_ROWS: Array<{
  name: string;
  swatches: readonly UiLayoutSlot[];
  passing: number;
  total: number;
}> = [
    { name: 'Terracota en seco', swatches: ['brand2', 'brand3', 'brand1', 'brand5'], passing: 14, total: 14 },
    { name: 'Salvia tranquila', swatches: ['brand4', 'brand1', 'brand6', 'brand2'], passing: 12, total: 14 },
    { name: 'Ocre de taller', swatches: ['brand3', 'brand6', 'brand2', 'brand1'], passing: 9, total: 14 },
    { name: 'Azul de tinta', swatches: ['brand1', 'brand4', 'brand3', 'brand5'], passing: 13, total: 14 },
  ];

export const ANALYTICS_GOALS = [
  { label: 'Cerrar 50 paletas', value: 74, total: '37 / 50', slot: 'data1' as const },
  { label: 'Pulir 20 guías', value: 62, total: '12 / 20', slot: 'data2' as const },
  { label: 'Probar 40 parejas tipográficas', value: 90, total: '36 / 40', slot: 'data3' as const },
  { label: 'Contraste AA en todos los roles', value: 55, total: '11 / 20', slot: 'data4' as const },
] as const;

export const ANALYTICS_DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'] as const;

/** Weeks of studio activity, oldest first. Each cell is an intensity from 0 to 4. */
export const ANALYTICS_HEATMAP = [
  [1, 2, 2, 3, 2, 0, 0],
  [2, 3, 3, 4, 3, 1, 0],
  [2, 3, 4, 4, 3, 1, 1],
  [3, 4, 4, 3, 4, 2, 0],
] as const;

export function getAnalyticsGreeting(hour: number): string {
  if (hour < 12) return 'Buenos días, estudio';
  if (hour < 19) return 'Buenas tardes, estudio';
  return 'Buenas noches, estudio';
}
