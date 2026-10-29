'use client';

import { DownloadIcon, ImageIcon, LinkIcon } from '@/components/layout/ExportMenuIcons';

export function ExportMenuItem({
  id,
  label,
  description,
  onSelect,
}: {
  id: string;
  label: string;
  description: string;
  onSelect: () => void;
}) {
  const icon =
    id === 'share-link' || id === 'copy-css' ? <LinkIcon /> : id === 'image' ? <ImageIcon /> : <DownloadIcon />;

  return (
    <li role="none">
      <button
        type="button"
        role="menuitem"
        onClick={onSelect}
        className="flex w-full items-start gap-3 rounded-lg px-2.5 py-2 text-left text-ink transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
      >
        {icon}
        <span>
          <span className="block text-chrome-label font-semibold">{label}</span>
          <span className="mt-0.5 block text-chrome-caption leading-snug text-muted">{description}</span>
        </span>
      </button>
    </li>
  );
}
