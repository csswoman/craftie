const GAP = 8;
const POPOVER_WIDTH = 288;
const POPOVER_HEIGHT = 400;

export function computePopoverPosition(
  anchor: DOMRect,
  popoverWidth = POPOVER_WIDTH,
  popoverHeight = POPOVER_HEIGHT,
): { top: number; left: number } {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  let top = anchor.bottom + GAP;
  let left = anchor.left + anchor.width / 2 - popoverWidth / 2;

  left = Math.max(GAP, Math.min(left, viewportWidth - popoverWidth - GAP));

  if (top + popoverHeight > viewportHeight - GAP) {
    top = anchor.top - popoverHeight - GAP;
  }

  if (top < GAP) {
    top = GAP;
  }

  return { top, left };
}
