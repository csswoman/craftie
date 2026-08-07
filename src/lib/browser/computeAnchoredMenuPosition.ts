import { computeAnchoredMenuPosition as computePureAnchoredMenuPosition } from '@lib/utils/computeAnchoredMenuPosition';

export function computeAnchoredMenuPosition(
  anchor: DOMRect,
  menu: { width: number; height: number },
): { top: number; left: number } {
  return computePureAnchoredMenuPosition(
    anchor,
    { width: window.innerWidth, height: window.innerHeight },
    menu,
  );
}
