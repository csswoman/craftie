export type WorkspaceProgressInput = {
  catalogSource: 'none' | 'curated' | 'image';
  rolePalette: unknown | null;
  generatedPalette: unknown | null;
  imageFile: unknown | null;
  imagePreviewUrl: string | null;
  isImageBusy: boolean;
};

/**
 * True when the studio holds session work worth confirming before a reset:
 * an inspiration source, a role palette, a generated guide, or an in-flight
 * image. Theme/layout/typography preferences are intentionally excluded.
 */
export function hasWorkspaceProgress(input: WorkspaceProgressInput): boolean {
  return (
    input.catalogSource !== 'none' ||
    input.rolePalette !== null ||
    input.generatedPalette !== null ||
    input.imageFile !== null ||
    input.imagePreviewUrl !== null ||
    input.isImageBusy
  );
}
