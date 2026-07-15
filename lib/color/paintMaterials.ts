import { clampChroma, formatHex, oklch } from 'culori';

export type Material = 'gouache' | 'acuarela' | 'oleo';

export type OklchColor = {
  l: number;
  c: number;
  h: number;
};

export type MaterialTransform = {
  id: Material;
  name: string;
  desc: string;
  ruleLabel: string;
  apply: (color: OklchColor) => OklchColor;
};

// Coeficientes iniciales calibrables contra pinturas físicas reales.
export const MATERIALS: Record<Material, MaterialTransform> = {
  gouache: {
    id: 'gouache',
    name: 'Gouache',
    desc: 'Opaco y mate. Saturado pero plano, con tonos comprimidos al centro.',
    ruleLabel: '+C leve · L hacia el centro · mate',
    apply: ({ l, c, h }) => ({
      l: 0.5 + (l - 0.5) * 0.55,
      c: c * 1.05,
      h,
    }),
  },
  acuarela: {
    id: 'acuarela',
    name: 'Acuarela',
    desc: 'Transparente y luminosa. Aclarada hacia el blanco del papel.',
    ruleLabel: '+L · -C · teñido a papel',
    apply: ({ l, c, h }) => ({
      l: Math.min(l * 0.6 + 0.42, 0.95),
      c: c * 0.55,
      h,
    }),
  },
  oleo: {
    id: 'oleo',
    name: 'Óleo',
    desc: 'Realista y profundo. Rango tonal completo, saturación intacta.',
    ruleLabel: '+C · rango tonal expandido',
    apply: ({ l, c, h }) => ({
      l: l < 0.5 ? l * 0.85 : 0.5 + (l - 0.5) * 1.15,
      c: c * 1.12,
      h,
    }),
  },
};

export function transformPalette(rawHexes: string[], material: Material): string[] {
  const { apply } = MATERIALS[material];

  return rawHexes.map((hex) => {
    const source = oklch(hex);

    if (!source || source.l === undefined || source.c === undefined) {
      return hex;
    }

    const next = apply({ l: source.l, c: source.c, h: source.h ?? 0 });
    const clamped = clampChroma(
      { mode: 'oklch', l: next.l, c: next.c, h: next.h },
      'oklch',
    );

    return formatHex(clamped) ?? hex;
  });
}
