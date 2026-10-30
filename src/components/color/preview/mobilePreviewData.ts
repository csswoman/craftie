import type { PreviewIconName } from './previewIcons';
import type { UiLayoutSlot } from '@lib/color/layoutModes';

/** Container query context so the mobile screen scales against its own width. */
export const MOBILE_CONTAINER_CLASS = 'preview-root @container/mobile';

export const MOBILE_TABS: Array<{ label: string; icon: PreviewIconName }> = [
  { label: 'Hoy', icon: 'grid' },
  { label: 'Paletas', icon: 'layers' },
  { label: 'Ajustes', icon: 'filter' },
];

export const MOBILE_SUMMARY = [
  { label: 'Guardadas', value: '18', slot: 'brand1' as const },
  { label: 'Contraste AA', value: '96%', slot: 'brand2' as const },
] as const;

export const MOBILE_PALETTES: Array<{
  name: string;
  note: string;
  swatches: readonly UiLayoutSlot[];
}> = [
  { name: 'Terracota en seco', note: 'Lista para exportar', swatches: ['brand1', 'brand2', 'brand3'] },
  { name: 'Salvia tranquila', note: 'Contraste por revisar', swatches: ['brand2', 'brand4', 'brand5'] },
  { name: 'Ocre de taller', note: 'Boceto reciente', swatches: ['brand3', 'brand1', 'brand6'] },
];

/** Status copy for the pinned palette card, chosen by remaining review items. */
export function getMobileReviewNote(pending: number): string {
  if (pending <= 0) return 'Todo revisado';
  if (pending === 1) return '1 ajuste pendiente';
  return `${pending} ajustes pendientes`;
}

export function getMobileGreeting(hour: number): string {
  if (hour < 6) return 'Buenas noches';
  if (hour < 12) return 'Buenos días';
  if (hour < 19) return 'Buenas tardes';
  return 'Buenas noches';
}
