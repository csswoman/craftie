import { describe, expect, it } from 'vitest';

import {
  formatStorePrice,
  getShippingNote,
  STORE_FREE_SHIPPING_THRESHOLD,
  STORE_PRODUCTS,
} from './storePreviewData';

describe('store preview data', () => {
  it('formats prices with a decimal comma', () => {
    expect(formatStorePrice(24)).toBe('24,00 €');
    expect(formatStorePrice(7.5)).toBe('7,50 €');
  });

  it('reports the remaining amount until free shipping', () => {
    expect(getShippingNote(40)).toBe('Te faltan 20,00 € para el envío gratis');
    expect(getShippingNote(STORE_FREE_SHIPPING_THRESHOLD)).toBe('Envío gratis en este pedido');
  });

  it('uses distinct data slots for product visuals', () => {
    const slots = STORE_PRODUCTS.map((product) => product.slot);
    expect(new Set(slots).size).toBe(slots.length);
  });
});
