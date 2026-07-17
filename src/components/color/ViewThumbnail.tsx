import {
  ChartNoAxesColumn,
  Image as ImageIcon,
  LayoutDashboard,
  Music2,
  Palette,
  PanelsTopLeft,
  Type,
  BookOpen,
} from 'lucide-react';
import type { ReactNode } from 'react';

import type { CanvasViewId } from '@lib/color/canvasViews';

function PaletteSwatches({ palette }: { palette: string[] }) {
  return (
    <span className="flex h-full w-full">
      {palette.slice(0, 4).map((color, index) => (
        <i key={`${color}-${index}`} className="flex-1" style={{ backgroundColor: color }} />
      ))}
    </span>
  );
}

export function ViewThumbnail({ id, palette }: { id: CanvasViewId; palette: string[] }) {
  const hasSwatches = palette.length > 0;
  const icon: Record<CanvasViewId, ReactNode> = {
    paint: hasSwatches ? (
      <PaletteSwatches palette={palette} />
    ) : (
      <Palette className="size-3.5" aria-hidden="true" />
    ),
    'style-guide': <BookOpen className="size-3.5" aria-hidden="true" />,
    'type-scale': <Type className="size-3.5" aria-hidden="true" />,
    colors: hasSwatches ? (
      <PaletteSwatches palette={palette} />
    ) : (
      <Palette className="size-3.5" aria-hidden="true" />
    ),
    dashboard: <LayoutDashboard className="size-3.5" aria-hidden="true" />,
    landing: <PanelsTopLeft className="size-3.5" aria-hidden="true" />,
    player: <Music2 className="size-3.5" aria-hidden="true" />,
    analytics: <ChartNoAxesColumn className="size-3.5" aria-hidden="true" />,
    illustration: <ImageIcon className="size-3.5" aria-hidden="true" />,
  };
  return (
    <span className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-md border border-border bg-surface text-muted">
      {icon[id]}
    </span>
  );
}
