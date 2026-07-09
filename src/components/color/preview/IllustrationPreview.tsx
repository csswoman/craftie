import {
  composeIllustration,
  DEFAULT_ILLUSTRATION_STYLE_ID,
  type IllustrationCell,
  type IllustrationShape,
} from '@lib/color/illustrationComposer';
import type { IllustrationPaletteInput } from '@lib/color/previewFamilies';
import type { SemanticTokens } from '@lib/color/semanticTokens';

export type IllustrationPreviewProps = {
  tokens: SemanticTokens;
  paletteInput: IllustrationPaletteInput;
  seed: number;
  onRegenerate: () => void;
};

export function IllustrationPreview({
  tokens,
  paletteInput,
  seed,
  onRegenerate,
}: IllustrationPreviewProps) {
  const composition = composeIllustration(DEFAULT_ILLUSTRATION_STYLE_ID, {
    seed,
    tokens,
    paletteInput,
  });

  return (
    <section className="overflow-hidden rounded-xl border bg-bg" style={{ borderColor: 'var(--color-border)' }}>
      <div className="flex items-center justify-between gap-3 border-b px-4 py-3" style={{ borderColor: 'var(--color-border)' }}>
        <div>
          <h3 className="font-body text-[0.875rem] font-bold tracking-normal text-ink">
            Ilustracion bento
          </h3>
          <p className="mt-0.5 text-[0.6875rem] font-semibold text-ink-muted">
            Seed {composition.seed}
          </p>
        </div>
        <button
          type="button"
          onClick={onRegenerate}
          className="rounded-md border px-3 py-2 text-[0.75rem] font-bold text-ink transition-colors hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
          style={{ borderColor: 'var(--color-border)' }}
        >
          Regenerar
        </button>
      </div>
      <div className="p-3 sm:p-4">
        <svg
          role="img"
          aria-label="Composicion generativa de la paleta actual"
          viewBox={`0 0 ${composition.width} ${composition.height}`}
          className="aspect-[64/46] w-full overflow-hidden rounded-lg"
          style={{ backgroundColor: composition.background.hex }}
        >
          <rect width={composition.width} height={composition.height} fill={composition.background.hex} />
          {composition.cells.map((cell) => (
            <BentoCell key={cell.id} cell={cell} />
          ))}
        </svg>
      </div>
    </section>
  );
}

function BentoCell({ cell }: { cell: IllustrationCell }) {
  return (
    <g>
      <rect
        x={cell.x}
        y={cell.y}
        width={cell.width}
        height={cell.height}
        rx={cell.radius}
        fill={cell.paint.hex}
      />
      {cell.shape ? <CellShape cell={cell} shape={cell.shape} /> : null}
    </g>
  );
}

function CellShape({ cell, shape }: { cell: IllustrationCell; shape: IllustrationShape }) {
  const size = Math.min(cell.width, cell.height) * (1 - shape.inset);
  const cx = cell.x + cell.width * shape.alignX;
  const cy = cell.y + cell.height * shape.alignY;
  const x = cx - size / 2;
  const y = cy - size / 2;
  const transform = `rotate(${shape.rotation} ${cx} ${cy})`;

  switch (shape.kind) {
    case 'circle':
      return <circle cx={cx} cy={cy} r={size / 2} fill={shape.paint.hex} />;
    case 'half-circle':
      return (
        <path
          d={`M ${x} ${cy} A ${size / 2} ${size / 2} 0 0 1 ${x + size} ${cy} L ${x} ${cy} Z`}
          fill={shape.paint.hex}
          transform={transform}
        />
      );
    case 'triangle':
      return (
        <path
          d={`M ${cx} ${y} L ${x + size} ${y + size} L ${x} ${y + size} Z`}
          fill={shape.paint.hex}
          transform={transform}
        />
      );
    case 'rounded-rect':
      return (
        <rect
          x={x}
          y={y + size * 0.12}
          width={size}
          height={size * 0.76}
          rx={size * 0.18}
          fill={shape.paint.hex}
          transform={transform}
        />
      );
  }
}
