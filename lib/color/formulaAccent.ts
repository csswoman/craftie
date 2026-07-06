import { contrastRatio } from './contrast';
import {
  hueDistance,
  oklchToHex,
  parseSeedOklch,
  type SeedOklch,
} from './formulaColorMath';
import { generateNeutrals } from './formulaNeutrals';

const MIN_ACCENT_HUE_SEPARATION = 30;

function accentChroma(seed: SeedOklch): number {
  return Math.min(0.28, Math.max(0.08, seed.c * 1.1 + 0.04));
}

function accentLightness(seed: SeedOklch): number {
  return Math.min(0.78, Math.max(0.62, 0.72 - (seed.l - 0.5) * 0.2));
}

function harmonyAccentCandidates(seed: SeedOklch): SeedOklch[] {
  const baseHue = seed.h ?? 0;
  const l = accentLightness(seed);
  const c = accentChroma(seed);
  const offsets = [30, 180, 150, 210, 120, 240];

  return offsets.map((offset) => ({
    l,
    c,
    h: (baseHue + offset) % 360,
  }));
}

function scoreAccentCandidate(
  candidate: SeedOklch,
  primary: SeedOklch,
  darkNeutral: string,
): number {
  const primaryHue = primary.h ?? 0;
  const candidateHue = candidate.h ?? 0;
  const hueSeparation = hueDistance(primaryHue, candidateHue);

  if (hueSeparation < MIN_ACCENT_HUE_SEPARATION) {
    return 0;
  }

  const hex = oklchToHex(candidate.l, candidate.c, candidate.h);
  const contrast = contrastRatio(hex, darkNeutral);
  const distinctnessBonus = Math.min(hueSeparation / 90, 1.5);

  return contrast * distinctnessBonus;
}

export function generateAccent(seed: string): string {
  const primary = parseSeedOklch(seed);
  const darkNeutral = generateNeutrals(seed).veryDark;
  const candidates = harmonyAccentCandidates(primary);

  let bestHex = oklchToHex(
    accentLightness(primary),
    accentChroma(primary),
    ((primary.h ?? 0) + 180) % 360,
  );
  let bestScore = 0;

  for (const candidate of candidates) {
    const score = scoreAccentCandidate(candidate, primary, darkNeutral);

    if (score > bestScore) {
      bestScore = score;
      bestHex = oklchToHex(candidate.l, candidate.c, candidate.h);
    }
  }

  if (bestScore === 0) {
    const fallbackHue = ((primary.h ?? 0) + 180) % 360;
    return oklchToHex(
      accentLightness(primary),
      accentChroma(primary),
      fallbackHue,
    );
  }

  return bestHex;
}
