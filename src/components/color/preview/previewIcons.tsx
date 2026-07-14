import type { CSSProperties } from 'react';

export type PreviewIconName =
  | 'grid'
  | 'activity'
  | 'users'
  | 'trending'
  | 'bell'
  | 'search'
  | 'play'
  | 'pause'
  | 'skipBack'
  | 'skipForward'
  | 'heart'
  | 'shuffle'
  | 'zap'
  | 'shield'
  | 'layers'
  | 'check'
  | 'arrowUp'
  | 'arrowDown'
  | 'arrowRight'
  | 'filter'
  | 'sparkles';

const PATHS: Record<PreviewIconName, string> = {
  grid: 'M4 4h7v7H4z M13 4h7v7h-7z M4 13h7v7H4z M13 13h7v7h-7z',
  activity: 'M3 12h4l3 8 4-16 3 8h4',
  users:
    'M16 20v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1 M9.5 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7 M17 4.2a4 4 0 0 1 0 7.6 M21 20v-1a4 4 0 0 0-3-3.85',
  trending: 'M3 17l6-6 4 4 8-8 M16 7h5v5',
  bell: 'M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9 M13.7 21a2 2 0 0 1-3.4 0',
  search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z M21 21l-4.3-4.3',
  play: 'M6 4l14 8-14 8z',
  pause: 'M7 4h3.5v16H7z M13.5 4H17v16h-3.5z',
  skipBack: 'M19 20L9 12l10-8v16z M5 4v16',
  skipForward: 'M5 4l10 8-10 8V4z M19 4v16',
  heart:
    'M12 21s-7.5-4.6-10-9.3C.5 8.5 2 5 5.5 5c2 0 3.6 1.2 4.5 2.7C11 6.2 12.5 5 14.5 5 18 5 19.5 8.5 22 11.7 19.5 16.4 12 21 12 21z',
  shuffle: 'M16 3h5v5 M21 3l-8 8 M21 16v5h-5 M15 15l6 6 M3 20l8-8 M3 4l5 5',
  zap: 'M13 2L4 14h7l-1 8 9-12h-7l1-8z',
  shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z',
  layers: 'M12 2l9 5-9 5-9-5 9-5z M3 12l9 5 9-5 M3 17l9 5 9-5',
  check: 'M20 6L9 17l-5-5',
  arrowUp: 'M12 19V5 M6 11l6-6 6 6',
  arrowDown: 'M12 5v14 M6 13l6 6 6-6',
  arrowRight: 'M5 12h14 M13 6l6 6-6 6',
  filter: 'M3 5h18l-7 8v6l-4 2v-8L3 5z',
  sparkles: 'M12 3l1.8 4.7L18 9l-4.2 1.3L12 15l-1.8-4.7L6 9l4.2-1.3L12 3z',
};

const FILLED = new Set<PreviewIconName>(['play', 'pause']);

export function PreviewIcon({
  name,
  size = 16,
  className,
  style,
  strokeWidth = 1.75,
}: {
  name: PreviewIconName;
  size?: number;
  className?: string;
  style?: CSSProperties;
  strokeWidth?: number;
}) {
  const filled = FILLED.has(name);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      style={style}
      fill={filled ? 'currentColor' : 'none'}
      stroke={filled ? 'none' : 'currentColor'}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
