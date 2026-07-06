import ntc from '../vendor/ntc.js';

import { normalizeHex } from './normalizeHex';

type NtcApi = {
  name: (color: string) => [string, string, boolean];
};

const ntcApi = ntc as NtcApi;

/**
 * Returns the closest Name That Color label for a hex value.
 */
export function lookupNtcColorName(hex: string): string {
  const normalized = normalizeHex(hex);
  const match = ntcApi.name(normalized);
  const name = match[1]?.trim();

  if (!name || /^invalid/i.test(name)) {
    return 'Color';
  }

  return name;
}
