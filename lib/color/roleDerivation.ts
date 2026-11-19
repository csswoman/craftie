import { bestTextOn, contrastRatio, hexToOklchChannels } from '../utils/colorMath';
import { estimatedTokenArea } from './chromaBudget';
import { TINTED_NEUTRAL_CHROMA_MAX } from './neutralTint';
import { hueDistance } from './oklchMath';
import { tokenNameForPaletteRole } from './semanticRoleProjection';
import type { ColorSource, PaletteRoleId, RolePalette } from './roleTypes';

/**
 * Explains a role color as a list of verifiable facts: where it comes from,
 * which role anchors its hue and lightness, how much chroma its screen area
 * allows, which contrast it must reach and what was adjusted. Every number is
 * measured on the current palette, so the explanation never drifts from the
 * engine that produced the color.
 */

/** Below this OKLCH chroma the hue is not perceptible and is not reported. */
const ACHROMATIC_CHROMA = 0.005;
/** Above this chroma a structural role stops reading as a (tinted) neutral. */
export const NEUTRAL_CHROMA_LIMIT = TINTED_NEUTRAL_CHROMA_MAX;
const AA_BODY = 4.5;
const AA_SECONDARY = 3;

export type DerivationStep =
  | { kind: 'origin'; source: ColorSource }
  | {
      kind: 'hue';
      hue: number;
      anchorRole: PaletteRoleId;
      anchorHue: number;
      /** Shortest angular distance to the anchor hue, 0-180. */
      delta: number;
    }
  | { kind: 'achromatic' }
  | {
      kind: 'lightness';
      lightness: number;
      referenceRole: PaletteRoleId;
      referenceLightness: number;
      /** Signed difference in points (0-100 scale). */
      deltaPoints: number;
    }
  | {
      kind: 'chroma';
      chroma: number;
      /** Estimated share of the screen the role covers (0-1), when known. */
      area: number | null;
      /** Neutral roles must stay under NEUTRAL_CHROMA_LIMIT; brand roles carry the color. */
      neutral: boolean;
      withinLimit: boolean;
    }
  | {
      kind: 'contrast';
      /** Role on the other side of the pair, or `text` for the best text placed on this color. */
      against: PaletteRoleId | 'text';
      foregroundHex: string;
      backgroundHex: string;
      ratio: number;
      required: number;
      passes: boolean;
    }
  | {
      kind: 'correction';
      fromHex: string;
      deltaLightnessPoints: number;
      deltaChroma: number;
      deltaHue: number;
    };

export type RoleDerivation = {
  role: PaletteRoleId;
  hex: string;
  steps: DerivationStep[];
};

const NEUTRAL_ROLES = new Set<PaletteRoleId>([
  'fondo',
  'superficie',
  'texto',
  'texto-secundario',
  'borde',
]);

/** Layer each role is placed on or measured against. `fondo` anchors the system. */
const LIGHTNESS_REFERENCE: Partial<Record<PaletteRoleId, PaletteRoleId>> = {
  superficie: 'fondo',
  texto: 'fondo',
  'texto-secundario': 'superficie',
  borde: 'superficie',
  primario: 'superficie',
  secundario: 'superficie',
  acento: 'superficie',
};

/** Text pairs each role takes part in: [foreground, background, required ratio]. */
const CONTRAST_PAIRS: Partial<Record<PaletteRoleId, Array<[PaletteRoleId, PaletteRoleId, number]>>> = {
  fondo: [['texto', 'fondo', AA_BODY]],
  superficie: [['texto', 'superficie', AA_BODY]],
  texto: [
    ['texto', 'fondo', AA_BODY],
    ['texto', 'superficie', AA_BODY],
  ],
  'texto-secundario': [['texto-secundario', 'superficie', AA_SECONDARY]],
};

function contrastStep(
  against: PaletteRoleId | 'text',
  foregroundHex: string,
  backgroundHex: string,
  required: number,
): DerivationStep {
  const ratio = contrastRatio(foregroundHex, backgroundHex);
  return { kind: 'contrast', against, foregroundHex, backgroundHex, ratio, required, passes: ratio >= required };
}

function hueSteps(palette: RolePalette, role: PaletteRoleId): DerivationStep[] {
  const own = hexToOklchChannels(palette[role].hex);
  if (own.c < ACHROMATIC_CHROMA) return [{ kind: 'achromatic' }];
  if (role === 'primario') return [];

  const anchor = hexToOklchChannels(palette.primario.hex);
  if (anchor.c < ACHROMATIC_CHROMA) return [];

  return [
    {
      kind: 'hue',
      hue: own.h,
      anchorRole: 'primario',
      anchorHue: anchor.h,
      delta: hueDistance(own.h, anchor.h),
    },
  ];
}

function contrastSteps(palette: RolePalette, role: PaletteRoleId): DerivationStep[] {
  const pairs = CONTRAST_PAIRS[role];

  if (pairs) {
    return pairs.map(([foreground, background, required]) =>
      contrastStep(
        foreground === role ? background : foreground,
        palette[foreground].hex,
        palette[background].hex,
        required,
      ),
    );
  }

  if (role === 'primario' || role === 'secundario' || role === 'acento') {
    const hex = palette[role].hex;
    return [contrastStep('text', bestTextOn(hex), hex, AA_BODY)];
  }

  return [];
}

function correctionSteps(palette: RolePalette, role: PaletteRoleId): DerivationStep[] {
  const { hex, originalHex } = palette[role];
  if (!originalHex || originalHex.toUpperCase() === hex.toUpperCase()) return [];

  const from = hexToOklchChannels(originalHex);
  const to = hexToOklchChannels(hex);

  return [
    {
      kind: 'correction',
      fromHex: originalHex,
      deltaLightnessPoints: (to.l - from.l) * 100,
      deltaChroma: to.c - from.c,
      deltaHue: from.c < ACHROMATIC_CHROMA || to.c < ACHROMATIC_CHROMA ? 0 : hueDistance(from.h, to.h),
    },
  ];
}

/** Builds the derivation of `role` from the palette it lives in. */
export function explainRoleColor(palette: RolePalette, role: PaletteRoleId): RoleDerivation {
  const slot = palette[role];
  const own = hexToOklchChannels(slot.hex);
  const steps: DerivationStep[] = [{ kind: 'origin', source: slot.source }];

  steps.push(...hueSteps(palette, role));

  const reference = LIGHTNESS_REFERENCE[role];
  if (reference) {
    const referenceLightness = hexToOklchChannels(palette[reference].hex).l;
    steps.push({
      kind: 'lightness',
      lightness: own.l,
      referenceRole: reference,
      referenceLightness,
      deltaPoints: (own.l - referenceLightness) * 100,
    });
  }

  const neutral = NEUTRAL_ROLES.has(role);
  steps.push({
    kind: 'chroma',
    chroma: own.c,
    area: estimatedTokenArea(tokenNameForPaletteRole(role)),
    neutral,
    withinLimit: !neutral || own.c <= NEUTRAL_CHROMA_LIMIT,
  });

  steps.push(...contrastSteps(palette, role), ...correctionSteps(palette, role));

  return { role, hex: slot.hex, steps };
}
