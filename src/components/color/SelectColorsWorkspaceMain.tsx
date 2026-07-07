import { PaletteCanvas } from '@/components/color/PaletteCanvas';

export function SelectColorsWorkspaceMain({
  isImageExtracting,
  isImageRegenerating,
  onAddColorByHex,
}: {
  isImageExtracting: boolean;
  isImageRegenerating: boolean;
  onAddColorByHex: (hex: string, customName?: string) => string | null;
}) {
  return (
    <PaletteCanvas
      isLoading={isImageExtracting}
      isUpdating={isImageRegenerating}
      editable
      onAddColorByHex={onAddColorByHex}
    />
  );
}
