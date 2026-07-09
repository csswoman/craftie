import type { StudioToolSectionId } from '@/components/color/studioToolSections';

export function StudioToolDockIcon({ id }: { id: StudioToolSectionId }) {
  switch (id) {
    case 'image':
      return <ImageIcon />;
    case 'source':
      return <SourceColorsIcon />;
    case 'adjustments':
      return <AdjustmentsIcon />;
    case 'typography':
      return <TypographyIcon />;
  }
}

function ImageIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="size-5">
      <rect
        x="2.5"
        y="3"
        width="11"
        height="10"
        rx="1.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="5.75" cy="6.25" r="1" fill="currentColor" />
      <path
        d="M3.5 11.5 6.5 8.5 8.5 10 11 7.5 12.5 11.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SourceColorsIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="size-5">
      <rect
        x="3"
        y="3"
        width="10"
        height="10"
        rx="2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M5 11.5 11.5 5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function AdjustmentsIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="size-5">
      <path
        d="M3 5h10M3 11h10M6 3.5v3M10 9.5v3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function TypographyIcon() {
  return (
    <span aria-hidden="true" className="text-[0.9375rem] font-semibold leading-none">
      Aa
    </span>
  );
}
