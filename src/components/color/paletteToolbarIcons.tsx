function IconFrame({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 20 20" className="size-5" fill="none" aria-hidden="true">
      {children}
    </svg>
  );
}

export function ShadesIcon() {
  return (
    <IconFrame>
      <path d="M4 6h12M4 10h12M4 14h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </IconFrame>
  );
}

export function MoveLeftIcon() {
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

export function MoveRightIcon() {
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

export function CopyIcon() {
  return (
    <IconFrame>
      <rect x="7" y="7" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6 13H5a1.5 1.5 0 0 1-1.5-1.5V5A1.5 1.5 0 0 1 5 3.5h6.5A1.5 1.5 0 0 1 13 5v1" stroke="currentColor" strokeWidth="1.5" />
    </IconFrame>
  );
}

export function InfoIcon() {
  return (
    <IconFrame>
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 9v5M10 6.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </IconFrame>
  );
}

export function LockIcon({ locked }: { locked: boolean }) {
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

export function RandomColorIcon() {
  return (
    <IconFrame>
      <rect x="3.5" y="3.5" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="7" cy="7" r="1.15" fill="currentColor" />
      <circle cx="10" cy="10" r="1.15" fill="currentColor" />
      <circle cx="13" cy="13" r="1.15" fill="currentColor" />
      <circle cx="13" cy="7" r="1.15" fill="currentColor" />
      <circle cx="7" cy="13" r="1.15" fill="currentColor" />
    </IconFrame>
  );
}
