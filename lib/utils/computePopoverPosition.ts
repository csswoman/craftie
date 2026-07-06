const GAP = 8;
const POPOVER_WIDTH = 288;
const POPOVER_HEIGHT = 400;

export function computePopoverPosition(
  anchor: DOMRect,
  viewport: { width: number; height: number },
  popoverWidth = POPOVER_WIDTH,
  popoverHeight = POPOVER_HEIGHT,
): { top: number; left: number } {
  let top = anchor.bottom + GAP;
  let left = anchor.left + anchor.width / 2 - popoverWidth / 2;

  left = Math.max(GAP, Math.min(left, viewport.width - popoverWidth - GAP));

  if (top + popoverHeight > viewport.height - GAP) {
    top = anchor.top - popoverHeight - GAP;
  }

  if (top < GAP) {
    top = GAP;
  }

  return { top, left };
}
