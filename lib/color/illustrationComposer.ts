import type {
  ExpressiveScaleBase,
  SemanticTokenName,
  SemanticTokens,
  TonalTokenName,
} from './semanticTokens';
import type { IllustrationPaletteInput } from './previewFamilies';

export type IllustrationStyleId = 'color-studio';

export type IllustrationPaint = {
  token: SemanticTokenName;
  hex: string;
};

export type IllustrationComposition = {
  style: IllustrationStyleId;
  seed: number;
  width: number;
  height: number;
  variant: 0 | 1 | 2;
  posterRotation: number;
  swatchRotation: number;
  background: IllustrationPaint;
  paper: IllustrationPaint;
  paperElevated: IllustrationPaint;
  ink: IllustrationPaint;
  mutedInk: IllustrationPaint;
  border: IllustrationPaint;
  divider: IllustrationPaint;
  featured: [IllustrationPaint, IllustrationPaint, IllustrationPaint];
  pawToes: [IllustrationPaint, IllustrationPaint, IllustrationPaint, IllustrationPaint];
  soft: [IllustrationPaint, IllustrationPaint, IllustrationPaint];
  scale: IllustrationPaint[];
};

export type IllustrationComposerInput = {
  seed: number;
  tokens: SemanticTokens;
  paletteInput: IllustrationPaletteInput;
};

type IllustrationComposer = (input: IllustrationComposerInput) => IllustrationComposition;

export const DEFAULT_ILLUSTRATION_STYLE_ID: IllustrationStyleId = 'color-studio';
export const DEFAULT_ILLUSTRATION_SEED = 1729;

const WIDTH = 720;
const HEIGHT = 480;
const BASES = ['primary', 'secondary', 'accent'] as const satisfies readonly ExpressiveScaleBase[];

export const ILLUSTRATION_STYLES: Record<IllustrationStyleId, IllustrationComposer> = {
  'color-studio': composeColorStudio,
};

export function nextIllustrationSeed(seed: number): number {
  return (Math.imul(seed, 1_664_525) + 1_013_904_223) >>> 0;
}

export function composeIllustration(
  style: IllustrationStyleId,
  input: IllustrationComposerInput,
): IllustrationComposition {
  return ILLUSTRATION_STYLES[style](input);
}

export function resolveIllustrationPaints(
  tokens: SemanticTokens,
  input: IllustrationPaletteInput,
): {
  backgroundPaints: IllustrationPaint[];
  cellPaints: IllustrationPaint[];
  shapePaints: IllustrationPaint[];
} {
  const basePaints = BASES.map((base) => paint(input.bases[base], tokens));
  const tonalPaints = BASES.flatMap((base) =>
    [200, 300, 400, 500, 600].map((step) =>
      paint(`${base}-${step}` as TonalTokenName, tokens),
    ),
  );
  const lightPaints = BASES.flatMap((base) =>
    [50, 100, 200].map((step) => paint(`${base}-${step}` as TonalTokenName, tokens)),
  );
  const statePaints = Object.values(input.states).map((name) => paint(name, tokens));

  return {
    backgroundPaints: lightPaints,
    cellPaints: [...lightPaints, ...tonalPaints, ...basePaints],
    shapePaints: [...basePaints, ...tonalPaints, ...statePaints],
  };
}

function composeColorStudio(input: IllustrationComposerInput): IllustrationComposition {
  const random = seededRandom(input.seed);
  const order = shuffle([...BASES], random);
  const [first, second, third] = order;
  const featured: IllustrationComposition['featured'] = [
    paint(input.paletteInput.bases[first], input.tokens),
    paint(input.paletteInput.bases[second], input.tokens),
    paint(input.paletteInput.bases[third], input.tokens),
  ];
  const soft: IllustrationComposition['soft'] = [first, second, third].map((base) =>
    tonalPaint(base, 100, input.tokens),
  ) as IllustrationComposition['soft'];
  const scaleBase = pick(order, random);
  const variant = Math.floor(random() * 3) as 0 | 1 | 2;
  const toePaints: IllustrationComposition['pawToes'] = [
    featured[0],
    featured[1],
    featured[2],
    tonalPaint(third, 300, input.tokens),
  ];
  const pawToes = rotateTuple(toePaints, variant);

  return {
    style: 'color-studio',
    seed: input.seed,
    width: WIDTH,
    height: HEIGHT,
    variant,
    posterRotation: -1.5 + random() * 3,
    swatchRotation: -3 + random() * 6,
    background: paint('background', input.tokens),
    paper: paint('surface', input.tokens),
    paperElevated: paint('surface-elevated', input.tokens),
    ink: paint('on-surface', input.tokens),
    mutedInk: paint('on-surface-muted', input.tokens),
    border: paint('border', input.tokens),
    divider: paint('divider', input.tokens),
    featured,
    pawToes,
    soft,
    scale: [100, 200, 300, 400, 500, 600, 700].map((step) =>
      tonalPaint(scaleBase, step, input.tokens),
    ),
  };
}

function rotateTuple<T>(values: [T, T, T, T], offset: number): [T, T, T, T] {
  return [
    values[offset % 4]!,
    values[(offset + 1) % 4]!,
    values[(offset + 2) % 4]!,
    values[(offset + 3) % 4]!,
  ];
}

function tonalPaint(
  base: ExpressiveScaleBase,
  step: number,
  tokens: SemanticTokens,
): IllustrationPaint {
  return paint(`${base}-${step}` as TonalTokenName, tokens);
}

function paint(name: SemanticTokenName, tokens: SemanticTokens): IllustrationPaint {
  return { token: name, hex: tokens[name].hex };
}

function pick<T>(items: T[], random: () => number): T {
  return items[Math.floor(random() * items.length)]!;
}

function shuffle<T>(items: T[], random: () => number): T[] {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    [items[index], items[target]] = [items[target]!, items[index]!];
  }

  return items;
}

function seededRandom(seed: number): () => number {
  let state = seed >>> 0;

  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);

    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
  };
}
