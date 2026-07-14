import type { UiLayoutModeId } from '@lib/color/layoutModes';

const UI_MODE_ICONS: Record<UiLayoutModeId, string> = {
  dashboard: 'M4 4h5v5H4V4zm7 0h5v5h-5V4zM4 11h5v5H4v-5zm7 0h5v5h-5v-5z',
  landing: 'M4 5h12v10H4V5zm0 3h12M7 12h6',
  media: 'M6 4h8v12H6V4zm2 5h4v2H8V9z',
  analytics: 'M4 14h2V9H4v5zm4 0h2V6H8v8zm4 0h2V4h-2v10zm4 0h2V11h-2v3',
};

const ILLUSTRATION_ICON = 'M4 4h5v7H4V4zm7 0h5v4h-5V4zM4 13h7v3H4v-3zm9 0h3v3h-3v-3z';

export function PreviewItemIcon({
  kind,
  mode = 'dashboard',
}: {
  kind: 'ui' | 'illustration';
  mode?: UiLayoutModeId;
}) {
  return (
    <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-border bg-surface">
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        className="size-4 text-ink"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={kind === 'illustration' ? ILLUSTRATION_ICON : UI_MODE_ICONS[mode]} />
      </svg>
    </span>
  );
}

export function ChevronDown({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className={`size-4 shrink-0 text-muted transition-transform duration-200 motion-reduce:transition-none ${
        open ? 'rotate-180' : ''
      }`}
    >
      <path
        d="M4 6l4 4 4-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
