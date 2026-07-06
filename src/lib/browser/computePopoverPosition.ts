import { computePopoverPosition as computePurePopoverPosition } from '@lib/utils/computePopoverPosition';

export function computePopoverPosition(
  anchor: DOMRect,
  popoverWidth?: number,
  popoverHeight?: number,
): { top: number; left: number } {
  return computePurePopoverPosition(
    anchor,
    { width: window.innerWidth, height: window.innerHeight },
    popoverWidth,
    popoverHeight,
  );
}
