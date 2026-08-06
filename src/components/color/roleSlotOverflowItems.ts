import type { PaletteSlotOverflowItem } from './PaletteSlotOverflowMenu';

export function buildRoleSlotOverflowItems({
  editable,
  locked,
  showShades,
  onRandomizeColor,
  onToggleShades,
  onCopyHex,
  onOpenInfo,
  onToggleLock,
}: {
  editable: boolean;
  locked: boolean;
  showShades: boolean;
  onRandomizeColor: () => void;
  onToggleShades: () => void;
  onCopyHex: () => void;
  onOpenInfo: () => void;
  onToggleLock: () => void;
}): PaletteSlotOverflowItem[] {
  return [
    ...(editable
      ? [
          {
            id: 'random',
            label: 'Color al azar',
            disabled: locked,
            onSelect: onRandomizeColor,
          },
        ]
      : []),
    {
      id: 'shades',
      label: showShades ? 'Ocultar shades' : 'Ver shades',
      onSelect: onToggleShades,
    },
    {
      id: 'copy',
      label: 'Copiar HEX',
      onSelect: onCopyHex,
    },
    {
      id: 'info',
      label: 'Info del color',
      onSelect: onOpenInfo,
    },
    ...(editable
      ? [
          {
            id: 'lock',
            label: locked ? 'Desbloquear' : 'Bloquear',
            onSelect: onToggleLock,
          },
        ]
      : []),
  ];
}
