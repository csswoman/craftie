'use client';

export function PaletteToolbarIconButton({
  label,
  children,
  disabled = false,
  active = false,
  lightChrome,
  compact = false,
  showTooltip = true,
  onClick,
}: {
  label: string;
  children: React.ReactNode;
  disabled?: boolean;
  active?: boolean;
  lightChrome: boolean;
  compact?: boolean;
  showTooltip?: boolean;
  onClick: () => void;
}) {
  const chromeClasses = lightChrome
    ? {
        button: active ? 'bg-white/20' : 'hover:bg-white/10 hover:scale-105',
        focus: 'focus-visible:ring-white/70',
      }
    : {
        button: active ? 'bg-black/15' : 'hover:bg-black/10 hover:scale-105',
        focus: 'focus-visible:ring-black/30',
      };

  return (
    <div className="group/tooltip relative">
      <button
        type="button"
        aria-label={label}
        title={label}
        disabled={disabled}
        onClick={onClick}
        className={`flex items-center justify-center rounded-md text-current transition-[opacity,transform,background-color] focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-35 ${
          compact ? 'size-10' : 'size-11'
        } ${chromeClasses.focus} ${chromeClasses.button}`}
      >
        {children}
      </button>
      {showTooltip ? (
        <span
          role="tooltip"
          className="pointer-events-none absolute left-1/2 top-[calc(100%+8px)] z-20 -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-ink px-2 py-1 text-chrome-caption font-medium text-bg opacity-0 shadow-md transition-opacity group-hover/tooltip:opacity-100 group-focus-within/tooltip:opacity-100"
        >
          {label}
        </span>
      ) : null}
    </div>
  );
}
