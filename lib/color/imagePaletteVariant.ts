import {
  countPrimaryOptions,
  selectExpressiveRoles,
  toExpressiveSource,
  type ExpressiveSelection,
} from './expressiveSelection';
import type { ExtractedColor } from './imageTypes';
import { normalizeHex } from './normalizeHex';

function filledRoles(selection: ExpressiveSelection): number {
  return [selection.primary, selection.secondary, selection.accent].filter(Boolean).length;
}

function withoutRank({ hex, prominence }: ExtractedColor): ExtractedColor {
  return { hex, prominence };
}

/**
 * Returns the image colors annotated for the n-th role combination.
 *
 * Variant 0 is the automatic choice. Each further variant promotes the next
 * primary option that fills as many roles as the automatic choice (secondary
 * and accent are then re-chosen around it) and
 * stores the result as ranks, so the combination survives saves and share
 * links without extra state. Variants cycle once options run out.
 */
export function applyImagePaletteVariant(
  extracted: ExtractedColor[],
  variant: number,
): ExtractedColor[] {
  const base = extracted.map(withoutRank);
  const candidates = base.map(toExpressiveSource);
  const options = countPrimaryOptions(candidates);
  const automatic = filledRoles(selectExpressiveRoles(candidates, 'light', 0));
  // Only combinations that fill as many roles as the automatic one are worth
  // offering; others would trade a real color for a gap.
  const usable = Array.from({ length: options }, (_, index) => index).filter(
    (index) => filledRoles(selectExpressiveRoles(candidates, 'light', index)) >= automatic,
  );
  const index = usable.length > 0 ? usable[Math.max(0, Math.floor(variant)) % usable.length]! : 0;

  if (index === 0) {
    return base;
  }

  const selection = selectExpressiveRoles(candidates, 'light', index);
  const ranks = new Map<string, number>();

  // Ranks map in order, so stop at the first empty role: a later color would
  // otherwise slide into the empty slot.
  for (const color of [selection.primary, selection.secondary, selection.accent]) {
    if (!color) {
      break;
    }

    ranks.set(color.hex, ranks.size);
  }

  return base.map((color) => {
    const rank = ranks.get(normalizeHex(color.hex));
    return rank === undefined ? color : { ...color, rank };
  });
}
