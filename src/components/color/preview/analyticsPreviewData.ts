import type { PreviewIconName } from './previewIcons';

export const ANALYTICS_CONTAINER_CLASS = '@container/analytics';

export const ANALYTICS_KPIS = [
  { label: 'Croquetas', value: '742', trend: '86', dir: 'up' as const, slot: 'data1' as const, spark: [40, 52, 48, 61, 70, 78, 86] },
  { label: 'Km corridos', value: '6.2', trend: '1.4', dir: 'up' as const, slot: 'data2' as const, spark: [2, 3, 2.5, 4, 4.5, 5.5, 6.2] },
  { label: 'Pelota', value: '18', trend: '3', dir: 'up' as const, slot: 'data3' as const, spark: [4, 6, 5, 9, 11, 14, 18] },
  { label: 'Siestas', value: '3', trend: '1', dir: 'down' as const, slot: 'data6' as const, spark: [5, 4, 4, 3, 3, 3, 3] },
] as const;

export const ANALYTICS_ACTIVITY_MIX = [
  { label: 'Comer', value: 32, display: '32%', slot: 'data1' as const },
  { label: 'Correr', value: 24, display: '24%', slot: 'data2' as const },
  { label: 'Jugar', value: 20, display: '20%', slot: 'data3' as const },
  { label: 'Charlar', value: 14, display: '14%', slot: 'data4' as const },
  { label: 'Dormir', value: 10, display: '10%', slot: 'data5' as const },
] as const;

export const ANALYTICS_DAY_STATS = [
  { label: 'Energía', value: '86%', trend: '8%', dir: 'up' as const },
  { label: 'Ánimo', value: '92%', trend: '4%', dir: 'up' as const },
  { label: 'Hambre', value: '28%', trend: '6%', dir: 'down' as const },
] as const;

export const ANALYTICS_TOP_ACTIVITIES = [
  { label: 'Parque central', share: 82, slot: 'data1' as const },
  { label: 'Sofá del estudio', share: 64, slot: 'data2' as const },
  { label: 'Chat contigo', share: 51, slot: 'data3' as const },
  { label: 'Caza de pelota', share: 37, slot: 'data4' as const },
] as const;

export const ANALYTICS_GOALS = [
  { label: 'Comer 1000 croquetas', value: 74, total: '742 / 1000', slot: 'data1' as const },
  { label: 'Correr 10 km', value: 62, total: '6.2 / 10 km', slot: 'data2' as const },
  { label: 'Jugar a la pelota', value: 90, total: '18 / 20 partidas', slot: 'data3' as const },
  { label: 'Chat contigo', value: 55, total: '11 / 20 mensajes', slot: 'data4' as const },
] as const;

export const ANALYTICS_WEEK_ENERGY = [42, 58, 51, 65, 61, 77, 70] as const;
export const ANALYTICS_WEEK_ENERGY_PREV = [38, 49, 55, 48, 52, 61, 58] as const;
export const ANALYTICS_DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'] as const;
export const ANALYTICS_MOMENTUM = [28, 34, 31, 45, 42, 57, 51, 66, 61, 74, 69, 82] as const;
export const ANALYTICS_TREATS = [44, 59, 38, 67, 52, 73] as const;
export const ANALYTICS_MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'] as const;

export const ANALYTICS_TREAT_BREAKDOWN = [
  { label: 'Croquetas', value: '486', share: '39%', slot: 'data1' as const },
  { label: 'Juguetes', value: '312', share: '25%', slot: 'data2' as const },
  { label: 'Caricias', value: '456', share: '36%', slot: 'data3' as const },
] as const;

export const ANALYTICS_TREAT_HIGHLIGHTS = [
  { label: 'Mejor mes', value: 'Jun', detail: '73 premios' },
  { label: 'Racha', value: '4 días', detail: 'sin fallar' },
  { label: 'Media', value: '55', detail: 'al mes' },
] as const;

export const ANALYTICS_TREAT_MILESTONE = {
  label: 'Próximo juguete',
  value: 74,
  current: '742',
  target: '1000 croquetas',
  detail: 'Faltan 258 croquetas para la pelota de estudio',
  slot: 'data1' as const,
} as const;

export const ANALYTICS_RECENT_TREATS = [
  {
    title: 'Croqueta dorada',
    detail: 'Tras mezclar Semilla',
    time: 'Hoy',
    icon: 'sparkles' as const,
    slot: 'data1' as const,
  },
  {
    title: 'Pelota nueva',
    detail: 'Meta de juegos lista',
    time: 'Ayer',
    icon: 'check' as const,
    slot: 'data3' as const,
  },
  {
    title: 'Siesta premium',
    detail: 'Racha de 4 días',
    time: 'Mar',
    icon: 'pause' as const,
    slot: 'data2' as const,
  },
] as const;

export const ANALYTICS_ENERGY_INSIGHTS = [
  { label: 'Pico', value: 'Sáb', detail: '77 cola', slot: 'data1' as const },
  { label: 'Media', value: '61', detail: 'esta semana', slot: 'data2' as const },
  { label: 'Vs anterior', value: '+9%', detail: 'más movimiento', slot: 'success' as const },
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
  name: 'Craftie',
  initials: 'C',
  status: 'Moviendo el rabo',
  messages: [
    { text: '¿Ya mezclaste la paleta?', time: '10:32', incoming: true },
    { text: 'Casi. Primero las croquetas.', time: '10:34', incoming: false },
    { text: '¡Bien! 200 más y salimos a correr.', time: '10:35', incoming: true },
  ],
  placeholder: 'Escríbele a Craftie…',
} as const;

export const ANALYTICS_NOTIFICATIONS: Array<{
  title: string;
  detail: string;
  icon: PreviewIconName;
  slot: 'data1' | 'success' | 'data6';
}> = [
  { title: 'Croqueta desbloqueada', detail: 'Hace 2 min', icon: 'sparkles', slot: 'data1' },
  { title: 'Meta de pelota casi lista', detail: 'Hace 15 min', icon: 'check', slot: 'success' },
  { title: 'Craftie quiere charlar', detail: 'Hace 1 h', icon: 'bell', slot: 'data6' },
];

export const ANALYTICS_SETTINGS = [
  { id: 'walk', title: 'Recordatorio de paseo', detail: 'Avisa cuando toque correr', icon: 'trending' as const },
  { id: 'hungry', title: 'Alertas de hambre', detail: 'Avisa si bajan las croquetas', icon: 'bell' as const },
  { id: 'nap', title: 'Modo siesta', detail: 'Silencia el estudio un rato', icon: 'pause' as const },
] as const;

export function getAnalyticsGreeting(hour: number): string {
  if (hour < 12) return 'Buenos días, Craftie';
  if (hour < 19) return 'Buenas tardes, Craftie';
  return 'Buenas noches, Craftie';
}
