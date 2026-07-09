import type {
  ExpressiveScaleBase,
  SemanticTokenName,
  SemanticTokens,
  TonalTokenName,
} from './semanticTokens';
import type { IllustrationPaletteInput } from './previewFamilies';

export type IllustrationStyleId = 'bento';

export type IllustrationShapeKind = 'circle' | 'half-circle' | 'rounded-rect' | 'triangle';

export type IllustrationPaint = {
  token: SemanticTokenName;
  hex: string;
};

export type IllustrationShape = {
  kind: IllustrationShapeKind;
  paint: IllustrationPaint;
  rotation: number;
  inset: number;
  alignX: number;
  alignY: number;
};

export type IllustrationCell = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
  paint: IllustrationPaint;
  shape: IllustrationShape | null;
};

export type IllustrationComposition = {
  style: IllustrationStyleId;
  seed: number;
  width: number;
  height: number;
  gap: number;
  background: IllustrationPaint;
  cells: IllustrationCell[];
};

export type IllustrationComposerInput = {
  seed: number;
  tokens: SemanticTokens;
  paletteInput: IllustrationPaletteInput;
};

type BentoGridCell = {
  column: number;
  row: number;
  columnSpan: number;
  rowSpan: number;
};

type IllustrationComposer = (input: IllustrationComposerInput) => IllustrationComposition;

export const DEFAULT_ILLUSTRATION_STYLE_ID: IllustrationStyleId = 'bento';
export const DEFAULT_ILLUSTRATION_SEED = 1729;

const BENTO_WIDTH = 640;
const BENTO_HEIGHT = 460;
const BENTO_COLUMNS = 6;
const BENTO_ROWS = 5;
const BENTO_GAP = 10;
const SHAPE_KINDS = [
  'circle',
  'half-circle',
  'rounded-rect',
  'triangle',
] as const satisfies readonly IllustrationShapeKind[];
const BENTO_SPANS = [
  [2, 2],
  [2, 1],
  [1, 2],
  [1, 1],
] as const;
const TONAL_ACCENT_STEPS = [200, 300, 400, 500, 600] as const;
const TONAL_BACKGROUND_STEPS = [50, 100, 200] as const;

export const ILLUSTRATION_STYLES: Record<IllustrationStyleId, IllustrationComposer> = {
  bento: composeBentoIllustration,
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
  const bases = Object.keys(input.bases) as ExpressiveScaleBase[];
  const basePaints = bases.map((base) => paint(input.bases[base], tokens));
  const tonalPaints = bases.flatMap((base) =>
    TONAL_ACCENT_STEPS.map((step) => paint(`${base}-${step}` as TonalTokenName, tokens)),
  );
  const lightPaints = bases.flatMap((base) =>
    TONAL_BACKGROUND_STEPS.map((step) => paint(`${base}-${step}` as TonalTokenName, tokens)),
  );
  const statePaints = Object.values(input.states).map((name) => paint(name, tokens));

  return {
    backgroundPaints: lightPaints,
    cellPaints: [...lightPaints, ...tonalPaints, ...basePaints],
    shapePaints: [...basePaints, ...tonalPaints, ...statePaints],
  };
}

function composeBentoIllustration(input: IllustrationComposerInput): IllustrationComposition {
  const random = seededRandom(input.seed);
  const paints = resolveIllustrationPaints(input.tokens, input.paletteInput);
  const grid = buildBentoGrid(random);
  const cellWidth = (BENTO_WIDTH - BENTO_GAP * (BENTO_COLUMNS + 1)) / BENTO_COLUMNS;
  const cellHeight = (BENTO_HEIGHT - BENTO_GAP * (BENTO_ROWS + 1)) / BENTO_ROWS;
  const dominantPaint = pick(paints.backgroundPaints, random);

  return {
    style: 'bento',
    seed: input.seed,
    width: BENTO_WIDTH,
    height: BENTO_HEIGHT,
    gap: BENTO_GAP,
    background: dominantPaint,
    cells: grid.map((cell, index) => {
      const x = BENTO_GAP + cell.column * (cellWidth + BENTO_GAP);
      const y = BENTO_GAP + cell.row * (cellHeight + BENTO_GAP);
      const width = cell.columnSpan * cellWidth + (cell.columnSpan - 1) * BENTO_GAP;
      const height = cell.rowSpan * cellHeight + (cell.rowSpan - 1) * BENTO_GAP;
      const cellPaint = index < 2 ? dominantPaint : pick(paints.cellPaints, random);
      const includeShape = index > 1 && random() > 0.28;

      return {
        id: `bento-${cell.column}-${cell.row}`,
        x,
        y,
        width,
        height,
        radius: Math.min(22, Math.max(10, Math.min(width, height) * 0.14)),
        paint: cellPaint,
        shape: includeShape ? buildShape(random, paints.shapePaints) : null,
      };
    }),
  };
}

function buildBentoGrid(random: () => number): BentoGridCell[] {
  const occupied = Array.from({ length: BENTO_ROWS }, () => Array(BENTO_COLUMNS).fill(false));
  const cells: BentoGridCell[] = [];

  for (let row = 0; row < BENTO_ROWS; row += 1) {
    for (let column = 0; column < BENTO_COLUMNS; column += 1) {
      if (occupied[row]![column]) {
        continue;
      }

      const shuffledSpans = [...BENTO_SPANS].sort(() => random() - 0.5);
      const [columnSpan, rowSpan] =
        shuffledSpans.find(([candidateColumns, candidateRows]) =>
          canPlace(occupied, column, row, candidateColumns, candidateRows),
        ) ?? [1, 1];

      for (let y = row; y < row + rowSpan; y += 1) {
        for (let x = column; x < column + columnSpan; x += 1) {
          occupied[y]![x] = true;
        }
      }

      cells.push({ column, row, columnSpan, rowSpan });
    }
  }

  return cells;
}

function buildShape(random: () => number, paints: IllustrationPaint[]): IllustrationShape {
  return {
    kind: pick([...SHAPE_KINDS], random),
    paint: pick(paints, random),
    rotation: pick([0, 90, 180, 270], random),
    inset: 0.18 + random() * 0.18,
    alignX: 0.42 + random() * 0.16,
    alignY: 0.42 + random() * 0.16,
  };
}

function canPlace(
  occupied: boolean[][],
  column: number,
  row: number,
  columnSpan: number,
  rowSpan: number,
): boolean {
  if (column + columnSpan > BENTO_COLUMNS || row + rowSpan > BENTO_ROWS) {
    return false;
  }

  for (let y = row; y < row + rowSpan; y += 1) {
    for (let x = column; x < column + columnSpan; x += 1) {
      if (occupied[y]![x]) {
        return false;
      }
    }
  }

  return true;
}

function paint(name: SemanticTokenName, tokens: SemanticTokens): IllustrationPaint {
  return { token: name, hex: tokens[name].hex };
}

function pick<T>(items: T[], random: () => number): T {
  return items[Math.floor(random() * items.length)]!;
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
