import type { ReactNode } from 'react';
/** Small icon tile that identifies a start option (decorative; the label carries the meaning). */
export function StartOptionIcon({ children }: { children: ReactNode }) {
  return (
    <span
      aria-hidden="true"
      className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-bg text-primary [&>svg]:size-[18px]"
    >
      {children}
    </span>
  );
}
