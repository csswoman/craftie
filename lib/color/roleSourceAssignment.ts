import { NEUTRAL_CHROMA_MAX } from './colorGroupClassification';
import type { ExtractedColor } from './imageExtractor';
import { normalizeHex } from './normalizeHex';
import { deriveChromatic, toOklch } from './oklchMath';
import {
  ACCENT_CHROMA_MIN,
  ACCENT_LIGHTNESS_MAX,
  ACCENT_LIGHTNESS_MIN,
  brandScore,
  chromaticRoleFitness,
  borderRoleFitness,
  fondoRoleFitness,
  pickBestBorderRole,
  pickBestChromaticRole,
  pickBestScored,
  surfaceRoleFitness,
  textRoleFitness,
  type ChromaticRoleId,
  type FitnessColor,
} from './roleFitness';
import type { ColorSource, PaletteRoleId } from './roleTypes';
import {
  adjustLightnessForContrast,
  contrastRatio,
  oklchChannelsToHex,
} from '../utils/colorMath';
import {
  deriveFondo,
  deriveNeutralRoles,
  deriveSecondary,
  type ThemePolarity,
} from '../utils/deriveRoles';

const TEXT_AA_RATIO = 4.5;
/** Near-miss thresholds: only correct source colors that are already close to valid. */
const FONDO_CORRECTABLE_LIGHT_L_MIN = 0.85;
const FONDO_CORRECTABLE_DARK_L_MAX = 0.35;
const FONDO_CORRECTABLE_CHROMA_MAX = 0.08;
const FONDO_CORRECTED_LIGHT_L = 0.95;
const FONDO_CORRECTED_DARK_L = 0.22;
const FONDO_CORRECTED_CHROMA_MAX = 0.03;
const TEXT_CORRECTABLE_RATIO_MIN = 3;
const TEXT_CORRECTABLE_CHROMA_MAX = 0.12;

export type RoleAssignment = { hex: string; source: ColorSource };

export type SourceRoleAssignmentResult = {
  roles: Record<PaletteRoleId, RoleAssignment>;
  neutralHue: number;
};

export function toFitnessCandidate(color: ExtractedColor): FitnessColor {
  const hex = normalizeHex(color.hex);
  const oklch = toOklch(hex);
  const chroma = oklch?.c ?? 0;

  return {
    hex,
    prominence: color.prominence,
    lightness: oklch?.l ?? 0,
    chroma,
    hue: oklch?.h ?? 0,
    isNeutral: chroma <= NEUTRAL_CHROMA_MAX,
  };
}

export function buildFitnessCandidates(extracted: ExtractedColor[]): FitnessColor[] {
  const byHex = new Map<string, FitnessColor>();

  for (const color of extracted) {
    const candidate = toFitnessCandidate(color);
    const existing = byHex.get(candidate.hex);

    if (!existing || candidate.prominence > existing.prominence) {
      byHex.set(candidate.hex, candidate);
    }
  }

  return [...byHex.values()];
}

/** Whether a hex still works as card surface against the given fondo. */
export function fitsSurfaceOn(hex: string, fondoHex: string): boolean {
  return surfaceRoleFitness(toFitnessCandidate({ hex, prominence: 1 }), fondoHex) > 0;
}

/** Whether a hex still works as a subtle border against the given superficie. */
export function fitsBorderOn(hex: string, superficieHex: string): boolean {
  return borderRoleFitness(toFitnessCandidate({ hex, prominence: 1 }), superficieHex) > 0;
}

/** Whether a hex passes AA as body text over both fondo and superficie. */
export function passesTextOn(hex: string, fondoHex: string, superficieHex: string): boolean {
  return (
    contrastRatio(hex, fondoHex) >= TEXT_AA_RATIO &&
    contrastRatio(hex, superficieHex) >= TEXT_AA_RATIO
  );
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Minimal OKLCH lightness nudge so a near-miss chromatic passes role fitness after gamut round-trip. */
function correctChromatic(
  candidate: FitnessColor,
  role: ChromaticRoleId,
): FitnessColor | null {
  const needsMoreLight = candidate.lightness < ACCENT_LIGHTNESS_MIN;
  const needsLessLight = candidate.lightness > ACCENT_LIGHTNESS_MAX;

  if (!needsMoreLight && !needsLessLight) {
    return null;
  }

  let lightness = clamp(candidate.lightness, ACCENT_LIGHTNESS_MIN, ACCENT_LIGHTNESS_MAX);
  const step = needsMoreLight ? 0.01 : -0.01;

  for (let attempt = 0; attempt < 12; attempt += 1) {
    const hex = oklchChannelsToHex(lightness, candidate.chroma, candidate.hue);
    const corrected = toFitnessCandidate({ hex, prominence: candidate.prominence });

    if (chromaticRoleFitness(corrected, role) >= 0) {
      return corrected;
    }

    lightness += step;

    if (lightness < ACCENT_LIGHTNESS_MIN || lightness > ACCENT_LIGHTNESS_MAX) {
      return null;
    }
  }

  return null;
}

function assignChromatic(
  role: ChromaticRoleId,
  pool: FitnessColor[],
  used: Set<string>,
  anchors: FitnessColor[],
  deriveFallback: () => string,
): RoleAssignment {
  const direct = pickBestChromaticRole(pool, used, anchors, role);

  if (direct) {
    used.add(direct.hex);
    return { hex: direct.hex, source: 'extracted' };
  }

  let best: { original: FitnessColor; corrected: FitnessColor } | null = null;
  let bestScore = 0;

  for (const candidate of pool) {
    if (used.has(candidate.hex) || candidate.isNeutral || candidate.chroma < ACCENT_CHROMA_MIN) {
      continue;
    }

    const corrected = correctChromatic(candidate, role);

    if (!corrected) {
      continue;
    }

    const fitness = chromaticRoleFitness(corrected, role);

    if (fitness > bestScore) {
      bestScore = fitness;
      best = { original: candidate, corrected };
    }
  }

  if (best) {
    used.add(best.original.hex);
    used.add(best.corrected.hex);
    return { hex: best.corrected.hex, source: 'corrected' };
  }

  return { hex: deriveFallback(), source: 'derived' };
}

function assignFondo(
  pool: FitnessColor[],
  used: Set<string>,
  theme: ThemePolarity,
  neutralHue: number,
): RoleAssignment {
  const direct = pickBestScored(pool, used, (candidate) => fondoRoleFitness(candidate, theme));

  if (direct) {
    used.add(direct.hex);
    return { hex: direct.hex, source: 'extracted' };
  }

  const nearMiss = pickBestScored(pool, used, (candidate) => {
    if (candidate.chroma > FONDO_CORRECTABLE_CHROMA_MAX) {
      return -1;
    }

    if (theme === 'light') {
      return candidate.lightness >= FONDO_CORRECTABLE_LIGHT_L_MIN ? candidate.lightness : -1;
    }

    return candidate.lightness <= FONDO_CORRECTABLE_DARK_L_MAX ? 1 - candidate.lightness : -1;
  });

  if (nearMiss) {
    used.add(nearMiss.hex);
    const lightness =
      theme === 'light'
        ? Math.max(nearMiss.lightness, FONDO_CORRECTED_LIGHT_L)
        : Math.min(nearMiss.lightness, FONDO_CORRECTED_DARK_L);
    const chroma = Math.min(nearMiss.chroma, FONDO_CORRECTED_CHROMA_MAX);

    return {
      hex: oklchChannelsToHex(lightness, chroma, nearMiss.hue),
      source: 'corrected',
    };
  }

  return { hex: deriveFondo(neutralHue, theme), source: 'derived' };
}

function assignTexto(
  pool: FitnessColor[],
  used: Set<string>,
  fondoHex: string,
  superficieHex: string,
): RoleAssignment {
  const direct = pickBestScored(pool, used, (candidate) =>
    textRoleFitness(candidate, fondoHex, superficieHex),
  );

  if (direct) {
    used.add(direct.hex);
    return { hex: direct.hex, source: 'extracted' };
  }

  const nearMiss = pickBestScored(pool, used, (candidate) => {
    if (candidate.chroma > TEXT_CORRECTABLE_CHROMA_MAX) {
      return -1;
    }

    const ratio = Math.min(
      contrastRatio(candidate.hex, fondoHex),
      contrastRatio(candidate.hex, superficieHex),
    );

    return ratio >= TEXT_CORRECTABLE_RATIO_MIN ? ratio : -1;
  });

  if (nearMiss) {
    const onFondo = adjustLightnessForContrast(nearMiss.hex, fondoHex, TEXT_AA_RATIO);
    const onBoth = adjustLightnessForContrast(onFondo, superficieHex, TEXT_AA_RATIO);

    if (passesTextOn(onBoth, fondoHex, superficieHex)) {
      used.add(nearMiss.hex);
      return { hex: onBoth, source: 'corrected' };
    }
  }

  const derived = deriveNeutralRoles(fondoHex, fondoHex).texto;
  const safe = passesTextOn(derived, fondoHex, superficieHex)
    ? derived
    : adjustLightnessForContrast(derived, superficieHex, TEXT_AA_RATIO);

  return { hex: safe, source: 'derived' };
}

function resolveNeutralHue(candidates: FitnessColor[], chromatics: FitnessColor[]): number {
  const neutrals = candidates
    .filter((candidate) => candidate.isNeutral)
    .sort((left, right) => right.prominence - left.prominence);

  if (neutrals[0]) {
    return neutrals[0].hue;
  }

  return chromatics[0]?.hue ?? candidates[0]?.hue ?? 0;
}

function resolveDominantSeed(candidates: FitnessColor[], chromatics: FitnessColor[]): string {
  if (chromatics[0]) {
    return chromatics[0].hex;
  }

  const byProminence = [...candidates].sort((left, right) => right.prominence - left.prominence);

  return byProminence[0]?.hex ?? '#808080';
}

/**
 * Assigns every palette role from source colors when a usable candidate exists,
 * correcting near-misses minimally in OKLCH, and deriving only as a last resort.
 */
export function assignSourceRoles(
  extracted: ExtractedColor[],
  theme: ThemePolarity = 'light',
): SourceRoleAssignmentResult {
  const candidates = buildFitnessCandidates(extracted);
  const chromatics = candidates
    .filter((candidate) => !candidate.isNeutral)
    .sort((left, right) => brandScore(right) - brandScore(left));
  const dominantSeed = resolveDominantSeed(candidates, chromatics);
  const used = new Set<string>();

  const primario = assignChromatic('primario', candidates, used, [], () =>
    deriveChromatic(dominantSeed, 0),
  );
  const primarioAnchor =
    primario.source === 'derived'
      ? []
      : [toFitnessCandidate({ hex: primario.hex, prominence: 1 })];
  const acento = assignChromatic('acento', candidates, used, primarioAnchor, () =>
    deriveChromatic(primario.hex, 180),
  );
  const chromaticAnchors = [primario, acento]
    .filter((assignment) => assignment.source !== 'derived')
    .map((assignment) => toFitnessCandidate({ hex: assignment.hex, prominence: 1 }));
  const secundario = assignChromatic('secundario', candidates, used, chromaticAnchors, () =>
    deriveSecondary(primario.hex),
  );

  const neutralHue = resolveNeutralHue(candidates, chromatics);
  const fondo = assignFondo(candidates, used, theme, neutralHue);
  const fondoNeutralHue =
    fondo.source === 'derived' ? neutralHue : (toOklch(fondo.hex)?.h ?? neutralHue);
  const derivedNeutrals = deriveNeutralRoles(fondo.hex, primario.hex, theme);

  const superficieCandidate = pickBestScored(candidates, used, (candidate) =>
    surfaceRoleFitness(candidate, fondo.hex),
  );

  const superficie: RoleAssignment = superficieCandidate
    ? { hex: superficieCandidate.hex, source: 'extracted' }
    : { hex: derivedNeutrals.superficie, source: 'derived' };

  if (superficieCandidate) {
    used.add(superficieCandidate.hex);
  }

  const bordeCandidate = pickBestBorderRole(candidates, used, superficie.hex);
  const borde: RoleAssignment = bordeCandidate
    ? { hex: bordeCandidate.hex, source: 'extracted' }
    : { hex: derivedNeutrals.borde, source: 'derived' };

  if (bordeCandidate) {
    used.add(bordeCandidate.hex);
  }

  const texto = assignTexto(candidates, used, fondo.hex, superficie.hex);

  return {
    roles: { fondo, superficie, texto, primario, secundario, acento, borde },
    neutralHue: fondoNeutralHue,
  };
}
