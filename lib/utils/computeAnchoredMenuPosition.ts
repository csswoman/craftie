const GAP = 4;
const PAD = 8;

export function computeAnchoredMenuPosition(
  anchor: DOMRect,
  viewport: { width: number; height: number },
  menu: { width: number; height: number },
): { top: number; left: number } {
  const availableWidth = Math.max(0, viewport.width - PAD * 2);
  const width = Math.min(menu.width, availableWidth);

  let left = anchor.right - width;
  left = Math.max(PAD, Math.min(left, viewport.width - width - PAD));

  const spaceBelow = viewport.height - anchor.bottom - GAP - PAD;
  const spaceAbove = anchor.top - GAP - PAD;
  const placeBelow = spaceBelow >= menu.height || spaceBelow >= spaceAbove;

  const top = placeBelow
    ? anchor.bottom + GAP
    : Math.max(PAD, anchor.top - GAP - menu.height);

  return { top, left };
}
