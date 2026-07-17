export const MEDIA_QUEUE = [
  { track: 'Huella naranja', time: '3:18', artist: 'Craftie' },
  { track: 'Contraste AA', time: '4:02', artist: 'Atelier Pigmento' },
  { track: 'Guía en seco', time: '3:44', artist: 'Estudio Nube' },
] as const;

export const MEDIA_MOODS = [
  { label: 'Mezcla', slot: 'data1' as const },
  { label: 'Foco', slot: 'data2' as const },
  { label: 'Secado', slot: 'data3' as const },
] as const;

export const MEDIA_STATS = [
  { label: 'En cola', value: '12' },
  { label: 'Guardadas', value: '28' },
] as const;

export const MEDIA_NOW_PLAYING = {
  title: 'Pigmento fresco',
  artist: 'Craftie · sesión de color',
  body: 'Mix para mezclar sin prisa: chrome calmado, controles claros y la paleta al frente.',
  elapsed: '1:42',
  duration: '4:02',
  progress: 42,
  volume: 68,
} as const;

export function getMediaSessionLabel(hour: number): string {
  if (hour < 12) return 'Sesión de mañana';
  if (hour < 19) return 'Sesión de tarde';
  return 'Sesión nocturna';
}

export const MEDIA_CONTAINER_CLASS = '@container/media';
