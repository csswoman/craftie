import {
  composeIllustration,
  DEFAULT_ILLUSTRATION_STYLE_ID,
  type IllustrationComposition,
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
            Estudio de color
          </h3>
          <p className="mt-0.5 text-[0.6875rem] font-semibold text-ink-muted">
            Póster, tipografía y muestras · variante {composition.variant + 1}
          </p>
        </div>
        <button
          type="button"
          onClick={onRegenerate}
          className="rounded-md border px-3 py-2 text-[0.75rem] font-bold text-ink transition-colors hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
          style={{ borderColor: 'var(--color-border)' }}
        >
          Otra composición
        </button>
      </div>
      <div className="p-3 sm:p-4">
        <ColorStudio composition={composition} />
      </div>
    </section>
  );
}

function ColorStudio({ composition: c }: { composition: IllustrationComposition }) {
  return (
    <svg
      role="img"
      aria-label="Mesa de estudio con un póster tipográfico y muestras de la paleta actual"
      viewBox={`0 0 ${c.width} ${c.height}`}
      className="aspect-[3/2] w-full overflow-hidden rounded-lg"
      style={{ backgroundColor: c.background.hex }}
    >
      <rect width={c.width} height={c.height} fill={c.background.hex} />
      <DeskGuides color={c.divider.hex} />
      <Poster composition={c} />
      <SwatchFan composition={c} />
      <TonalRuler composition={c} />
    </svg>
  );
}

function DeskGuides({ color }: { color: string }) {
  return (
    <g fill="none" stroke={color} strokeWidth="2" opacity="0.7" aria-hidden="true">
      <circle cx="646" cy="61" r="19" />
      <circle cx="646" cy="61" r="7" />
      <path d="M 30 420 H 174 M 30 432 H 128" />
    </g>
  );
}

function Poster({ composition: c }: { composition: IllustrationComposition }) {
  return (
    <g transform={`rotate(${c.posterRotation} 198 230)`} aria-hidden="true">
      <rect x="42" y="28" width="332" height="404" rx="12" fill={c.paper.hex} stroke={c.border.hex} strokeWidth="2" />
      <rect x="66" y="53" width="56" height="7" rx="3.5" fill={c.featured[1].hex} />
      <text x="66" y="88" fill={c.ink.hex} fontFamily="system-ui, sans-serif" fontSize="13" fontWeight="700" letterSpacing="1.2">
        COLOR STUDY
      </text>
      <text x="66" y="169" fill={c.ink.hex} fontFamily="Georgia, serif" fontSize="86" fontWeight="700" letterSpacing="-4">
        Aa
      </text>
      <PalettePaw composition={c} />
      <rect x="268" y="229" width="78" height="108" rx="8" fill={c.soft[2].hex} />
      <circle cx="307" cy="268" r="23" fill={c.featured[2].hex} />
      <rect x="285" y="305" width="44" height="6" rx="3" fill={c.ink.hex} opacity="0.82" />
      <rect x="66" y="373" width="280" height="2" fill={c.divider.hex} />
      <text x="66" y="399" fill={c.mutedInk.hex} fontFamily="system-ui, sans-serif" fontSize="11" fontWeight="650" letterSpacing="0.8">
        PRIMARY · SECONDARY · ACCENT
      </text>
    </g>
  );
}

function PalettePaw({ composition: c }: { composition: IllustrationComposition }) {
  const toeColors = c.pawToes.map((paint) => paint.hex);
  const rotation = (c.variant - 1) * 3;

  return (
    <g transform={`rotate(${rotation} 168 276)`}>
      <ellipse cx="113" cy="242" rx="19" ry="25" transform="rotate(-20 113 242)" fill={toeColors[0]} />
      <ellipse cx="148" cy="224" rx="20" ry="27" transform="rotate(-7 148 224)" fill={toeColors[1]} />
      <ellipse cx="188" cy="224" rx="20" ry="27" transform="rotate(7 188 224)" fill={toeColors[2]} />
      <ellipse cx="223" cy="242" rx="19" ry="25" transform="rotate(20 223 242)" fill={toeColors[3]} />
      <path
        d="M 168 264 C 143 264 122 286 117 316 C 114 337 128 351 147 344 L 154 341 C 163 337 173 337 182 341 L 189 344 C 208 351 222 337 219 316 C 214 286 193 264 168 264 Z"
        fill={c.ink.hex}
      />
      <path d="M 92 298 L 96 308 L 106 312 L 96 316 L 92 326 L 88 316 L 78 312 L 88 308 Z" fill={c.featured[1].hex} />
      <path d="M 244 286 L 247 293 L 254 296 L 247 299 L 244 306 L 241 299 L 234 296 L 241 293 Z" fill={c.featured[2].hex} />
    </g>
  );
}

function SwatchFan({ composition: c }: { composition: IllustrationComposition }) {
  return (
    <g transform={`rotate(${c.swatchRotation} 528 247)`} aria-hidden="true">
      <SwatchCard x={421} y={116} rotation={-13} fill={c.featured[1].hex} soft={c.soft[1].hex} />
      <SwatchCard x={467} y={103} rotation={0} fill={c.featured[2].hex} soft={c.soft[2].hex} />
      <SwatchCard x={513} y={116} rotation={13} fill={c.featured[0].hex} soft={c.soft[0].hex} />
      <circle cx="528" cy="342" r="16" fill={c.ink.hex} />
      <circle cx="528" cy="342" r="6" fill={c.paper.hex} />
    </g>
  );
}

function SwatchCard({ x, y, rotation, fill, soft }: { x: number; y: number; rotation: number; fill: string; soft: string }) {
  return (
    <g transform={`rotate(${rotation} 528 342)`}>
      <rect x={x} y={y} width="92" height="246" rx="10" fill={soft} />
      <rect x={x + 10} y={y + 12} width="72" height="166" rx="7" fill={fill} />
      <rect x={x + 16} y={y + 195} width="42" height="6" rx="3" fill={fill} />
      <rect x={x + 16} y={y + 211} width="26" height="5" rx="2.5" fill={fill} opacity="0.65" />
    </g>
  );
}

function TonalRuler({ composition: c }: { composition: IllustrationComposition }) {
  return (
    <g aria-hidden="true">
      <rect x="408" y="407" width="266" height="36" rx="9" fill={c.paperElevated.hex} stroke={c.border.hex} strokeWidth="1" />
      {c.scale.map((paint, index) => (
        <rect key={paint.token} x={420 + index * 35} y="417" width="29" height="16" rx="4" fill={paint.hex} />
      ))}
    </g>
  );
}
