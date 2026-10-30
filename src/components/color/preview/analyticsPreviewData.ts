import type { PreviewIconName } from './previewIcons';

export const ANALYTICS_CONTAINER_CLASS = 'preview-root @container/analytics';

export const ANALYTICS_KPIS = [
  { label: 'Paletas', value: '42', trend: '6', dir: 'up' as const, slot: 'data1' as const, spark: [24, 28, 27, 33, 36, 39, 42] },
  { label: 'Contraste AA', value: '96%', trend: '4%', dir: 'up' as const, slot: 'data2' as const, spark: [78, 82, 85, 88, 91, 94, 96] },
  { label: 'Guías', value: '18', trend: '3', dir: 'up' as const, slot: 'data3' as const, spark: [4, 6, 5, 9, 11, 14, 18] },
  { label: 'Pendientes', value: '3', trend: '1', dir: 'down' as const, slot: 'data6' as const, spark: [5, 4, 4, 3, 3, 3, 3] },
] as const;

export const ANALYTICS_ACTIVITY_MIX = [
  { label: 'Color', value: 32, display: '32%', slot: 'data1' as const },
  { label: 'Tipografía', value: 24, display: '24%', slot: 'data2' as const },
  { label: 'Contraste', value: 20, display: '20%', slot: 'data3' as const },
  { label: 'Maquetas', value: 14, display: '14%', slot: 'data4' as const },
  { label: 'Exportar', value: 10, display: '10%', slot: 'data5' as const },
] as const;

export const ANALYTICS_DAY_STATS = [
  { label: 'Foco', value: '86%', trend: '8%', dir: 'up' as const },
  { label: 'Ritmo', value: '92%', trend: '4%', dir: 'up' as const },
  { label: 'Retoques', value: '28%', trend: '6%', dir: 'down' as const },
] as const;

export const ANALYTICS_TOP_ACTIVITIES = [
  { label: 'Terracota en seco', share: 82, slot: 'data1' as const },
  { label: 'Salvia tranquila', share: 64, slot: 'data2' as const },
  { label: 'Ocre de taller', share: 51, slot: 'data3' as const },
  { label: 'Azul de tinta', share: 37, slot: 'data4' as const },
] as const;

export const ANALYTICS_GOALS = [
  { label: 'Cerrar 50 paletas', value: 74, total: '37 / 50 paletas', slot: 'data1' as const },
  { label: 'Pulir 20 guías', value: 62, total: '12 / 20 guías', slot: 'data2' as const },
  { label: 'Probar 40 parejas tipográficas', value: 90, total: '36 / 40 parejas', slot: 'data3' as const },
  { label: 'Contraste AA en todos los roles', value: 55, total: '11 / 20 roles', slot: 'data4' as const },
] as const;

export const ANALYTICS_WEEK_ENERGY = [42, 58, 51, 65, 61, 77, 70] as const;
export const ANALYTICS_WEEK_ENERGY_PREV = [38, 49, 55, 48, 52, 61, 58] as const;
export const ANALYTICS_DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'] as const;
export const ANALYTICS_MOMENTUM = [28, 34, 31, 45, 42, 57, 51, 66, 61, 74, 69, 82] as const;
export const ANALYTICS_TREATS = [44, 59, 38, 67, 52, 73] as const;
export const ANALYTICS_MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'] as const;

export const ANALYTICS_TREAT_BREAKDOWN = [
  { label: 'Guías', value: '486', share: '39%', slot: 'data1' as const },
  { label: 'Paletas', value: '312', share: '25%', slot: 'data2' as const },
  { label: 'Tokens', value: '456', share: '36%', slot: 'data3' as const },
] as const;

export const ANALYTICS_TREAT_HIGHLIGHTS = [
  { label: 'Mejor mes', value: 'Jun', detail: '73 entregas' },
  { label: 'Racha', value: '4 días', detail: 'sin retrasos' },
  { label: 'Media', value: '55', detail: 'al mes' },
] as const;

export const ANALYTICS_TREAT_MILESTONE = {
  label: 'Siguiente hito',
  value: 74,
  current: '37',
  target: '50 paletas',
  detail: 'Te faltan 13 paletas para cerrar el trimestre',
  slot: 'data1' as const,
} as const;

export const ANALYTICS_RECENT_TREATS = [
  {
    title: 'Guía Terracota entregada',
    detail: 'Contraste AAA en todos los roles',
    time: 'Hoy',
    icon: 'sparkles' as const,
    slot: 'data1' as const,
  },
  {
    title: 'Paleta Salvia aprobada',
    detail: 'Lista para exportar',
    time: 'Ayer',
    icon: 'check' as const,
    slot: 'data3' as const,
  },
  {
    title: 'Pareja tipográfica elegida',
    detail: 'Lora y Nunito',
    time: 'Mar',
    icon: 'layers' as const,
    slot: 'data2' as const,
  },
] as const;

export const ANALYTICS_ENERGY_INSIGHTS = [
  { label: 'Pico', value: 'Sáb', detail: '77 ajustes', slot: 'data1' as const },
  { label: 'Media', value: '61', detail: 'esta semana', slot: 'data2' as const },
  { label: 'Vs anterior', value: '+9%', detail: 'más actividad', slot: 'success' as const },
] as const;

export const ANALYTICS_ENERGY_BY_DAY = [
  { day: 'Lun', value: 42 },
  { day: 'Mar', value: 58 },
  { day: 'Mié', value: 51 },
  { day: 'Jue', value: 65 },
  { day: 'Vie', value: 61 },
  { day: 'Sáb', value: 77 },
  { day: 'Dom', value: 70 },
] as const;

export const ANALYTICS_SOURCE_STATS = [
  { label: 'Activo', value: '6.2h', slot: 'data1' as const },
  { label: 'Juegos', value: '18', slot: 'data2' as const },
  { label: 'Meta', value: '74%', slot: 'success' as const },
] as const;

export const ANALYTICS_CHAT = {
  name: 'Lucía Ríos',
  initials: 'LR',
  status: 'Revisando la paleta',
  messages: [
    { text: '¿Ya cerraste los roles de la paleta?', time: '10:32', incoming: true },
    { text: 'Casi. Falta ajustar el fondo.', time: '10:34', incoming: false },
    { text: 'Perfecto. Con eso exportamos la guía.', time: '10:35', incoming: true },
  ],
  placeholder: 'Responde a Lucía…',
} as const;

export const ANALYTICS_NOTIFICATIONS: Array<{
  title: string;
  detail: string;
  icon: PreviewIconName;
  slot: 'data1' | 'success' | 'data6';
}> = [
    { title: 'Paleta aprobada', detail: 'Hace 2 min', icon: 'sparkles', slot: 'data1' },
    { title: 'Contraste casi listo', detail: 'Hace 15 min', icon: 'check', slot: 'success' },
    { title: 'Lucía dejó un comentario', detail: 'Hace 1 h', icon: 'bell', slot: 'data6' },
  ];

export const ANALYTICS_SETTINGS = [
  { id: 'contrast', title: 'Alertas de contraste', detail: 'Te avisa si un rol baja de AA', icon: 'shield' as const },
  { id: 'export', title: 'Aviso de exportación', detail: 'Te avisa cuando una guía esté lista', icon: 'bell' as const },
  { id: 'focus', title: 'Modo foco', detail: 'Silencia los avisos un rato', icon: 'pause' as const },
] as const;

export function getAnalyticsGreeting(hour: number): string {
  if (hour < 12) return 'Buenos días, estudio';
  if (hour < 19) return 'Buenas tardes, estudio';
  return 'Buenas noches, estudio';
}

/** Names for the six chart colors, in series order (data1 to data6). */
export const ANALYTICS_SERIES = [
  { label: 'Color', slot: 'data1' as const, share: 32 },
  { label: 'Tipografía', slot: 'data2' as const, share: 24 },
  { label: 'Contraste', slot: 'data3' as const, share: 18 },
  { label: 'Maquetas', slot: 'data4' as const, share: 12 },
  { label: 'Exportar', slot: 'data5' as const, share: 9 },
  { label: 'Revisión', slot: 'data6' as const, share: 5 },
] as const;

/** Weeks of studio activity, oldest first. Each cell is an intensity from 0 to 4. */
export const ANALYTICS_HEATMAP = [
  [1, 2, 2, 3, 2, 0, 0],
  [2, 3, 3, 4, 3, 1, 0],
  [2, 3, 4, 4, 3, 1, 1],
  [3, 4, 4, 3, 4, 2, 0],
] as const;
