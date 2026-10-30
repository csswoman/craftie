import type { UiLayoutSlot } from '@lib/color/layoutModes';

/** Container query context so the storefront scales against its own width. */
export const STORE_CONTAINER_CLASS = 'preview-root @container/store';
export const STORE_GUTTER_CLASS = 'px-5 @min-[720px]/store:px-8';

export const STORE_NAV = ['Cerámica', 'Textil', 'Papelería'] as const;
export const STORE_FILTERS = ['Todo', 'Nuevo', 'Edición limitada'] as const;

export type StoreProduct = {
  name: string;
  detail: string;
  price: number;
  slot: UiLayoutSlot;
  badge?: 'Nuevo' | 'Últimas unidades';
};

export const STORE_PRODUCTS: StoreProduct[] = [
  { name: 'Taza de barro', detail: 'Esmalte mate · 300 ml', price: 24, slot: 'brand1', badge: 'Nuevo' },
  { name: 'Mantel de lino', detail: 'Lavado · 140 × 200 cm', price: 68, slot: 'brand2' },
  { name: 'Cuaderno cosido', detail: 'Papel sin ácido · A5', price: 16, slot: 'brand3', badge: 'Últimas unidades' },
  { name: 'Jarra de gres', detail: 'Hecha a mano · 1 l', price: 42, slot: 'brand4' },
];

export const STORE_FREE_SHIPPING_THRESHOLD = 60;

/** Format a price in euros using the Spanish convention. */
export function formatStorePrice(value: number): string {
  return `${value.toFixed(2).replace('.', ',')} €`;
}

/** Banner copy that reflects how close the cart is to free shipping. */
export function getShippingNote(cartTotal: number): string {
  const missing = STORE_FREE_SHIPPING_THRESHOLD - cartTotal;
  if (missing <= 0) return 'Envío gratis en este pedido';
  return `Te faltan ${formatStorePrice(missing)} para el envío gratis`;
}
