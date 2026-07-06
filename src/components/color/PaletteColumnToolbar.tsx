'use client';

type PaletteColumnToolbarProps = {
  locked: boolean;
  editable: boolean;
  canMoveLeft: boolean;
  canMoveRight: boolean;
  showShades: boolean;
  lightChrome: boolean;
  hoverGroup?: 'column' | 'slot';
  onToggleLock: () => void;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onCopyHex: () => void;
  onToggleShades: () => void;
  onOpenInfo: () => void;
};

const HOVER_VISIBILITY: Record<'column' | 'slot', string> = {
  column:
    'opacity-0 transition-opacity group-hover/column:opacity-100 group-focus-within/column:opacity-100',
  slot: 'opacity-0 transition-opacity group-hover/slot:opacity-100 group-focus-within/slot:opacity-100',
};

export function PaletteColumnToolbar({
  locked,
  editable,
  canMoveLeft,
  canMoveRight,
  showShades,
  lightChrome,
  hoverGroup = 'column',
  onToggleLock,
  onMoveLeft,
  onMoveRight,
  onCopyHex,
  onToggleShades,
  onOpenInfo,
}: PaletteColumnToolbarProps) {
  return (
    <div
      className={`pointer-events-none absolute inset-x-0 top-[18%] z-10 flex justify-center ${HOVER_VISIBILITY[hoverGroup]}`}
    >
      <div className="pointer-events-auto flex flex-col items-center gap-2.5">
        <ToolbarIconButton
          label={showShades ? 'Ocultar shades' : 'Ver shades'}
          active={showShades}
          lightChrome={lightChrome}
          onClick={onToggleShades}
        >
          <ShadesIcon />
        </ToolbarIconButton>

        {editable && (canMoveLeft || canMoveRight) ? (
          <>
            <ToolbarIconButton
              label="Mover a la izquierda"
              disabled={!canMoveLeft || locked}
              lightChrome={lightChrome}
              onClick={onMoveLeft}
            >
              <MoveLeftIcon />
            </ToolbarIconButton>
            <ToolbarIconButton
              label="Mover a la derecha"
              disabled={!canMoveRight || locked}
              lightChrome={lightChrome}
              onClick={onMoveRight}
            >
              <MoveRightIcon />
            </ToolbarIconButton>
          </>
        ) : null}

        <ToolbarIconButton label="Copiar HEX" lightChrome={lightChrome} onClick={onCopyHex}>
          <CopyIcon />
        </ToolbarIconButton>

        <ToolbarIconButton label="Ver info del color" lightChrome={lightChrome} onClick={onOpenInfo}>
          <InfoIcon />
        </ToolbarIconButton>

        {editable ? (
          <ToolbarIconButton
            label={locked ? 'Desbloquear color' : 'Bloquear color'}
            active={locked}
            lightChrome={lightChrome}
            onClick={onToggleLock}
          >
            <LockIcon locked={locked} />
          </ToolbarIconButton>
        ) : null}
      </div>
    </div>
  );
}

function ToolbarIconButton({
  label,
  children,
  disabled = false,
  active = false,
  lightChrome,
  onClick,
}: {
  label: string;
  children: React.ReactNode;
  disabled?: boolean;
  active?: boolean;
  lightChrome: boolean;
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
        className={`flex size-8 items-center justify-center rounded-md text-current transition-[opacity,transform,background-color] focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-35 ${chromeClasses.focus} ${chromeClasses.button}`}
      >
        {children}
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute left-[calc(100%+8px)] top-1/2 z-20 -translate-y-1/2 whitespace-nowrap rounded-md border border-border bg-ink px-2 py-1 text-[0.6875rem] font-medium text-bg opacity-0 shadow-md transition-opacity group-hover/tooltip:opacity-100 group-focus-within/tooltip:opacity-100"
      >
        {label}
      </span>
    </div>
  );
}

function IconFrame({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 20 20" className="size-5" fill="none" aria-hidden="true">
      {children}
    </svg>
  );
}

function ShadesIcon() {
  return (
    <IconFrame>
      <path d="M4 6h12M4 10h12M4 14h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </IconFrame>
  );
}

function MoveLeftIcon() {
  return (
    <IconFrame>
      <path
        d="M12 5 7 10l5 5M13 10H7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconFrame>
  );
}

function MoveRightIcon() {
  return (
    <IconFrame>
      <path
        d="m8 5 5 5-5 5M7 10h6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconFrame>
  );
}

function CopyIcon() {
  return (
    <IconFrame>
      <rect x="7" y="7" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6 13H5a1.5 1.5 0 0 1-1.5-1.5V5A1.5 1.5 0 0 1 5 3.5h6.5A1.5 1.5 0 0 1 13 5v1" stroke="currentColor" strokeWidth="1.5" />
    </IconFrame>
  );
}

function InfoIcon() {
  return (
    <IconFrame>
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 9v5M10 6.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </IconFrame>
  );
}

function LockIcon({ locked }: { locked: boolean }) {
  return (
    <IconFrame>
      {locked ? (
        <>
          <rect x="5.5" y="9" width="9" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M7 9V7a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </>
      ) : (
        <>
          <rect x="5.5" y="9" width="9" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M7 9V7a3 3 0 1 1 6 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </>
      )}
    </IconFrame>
  );
}
