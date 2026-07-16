import { describe, expect, it } from 'vitest';

import { hasWorkspaceProgress } from './workspaceProgress';

const empty = {
  catalogSource: 'none' as const,
  rolePalette: null,
  generatedPalette: null,
  imageFile: null,
  imagePreviewUrl: null,
  isImageBusy: false,
};

describe('hasWorkspaceProgress', () => {
  it('is false for an empty workspace', () => {
    expect(hasWorkspaceProgress(empty)).toBe(false);
  });

  it('is true when catalogSource is curated', () => {
    expect(hasWorkspaceProgress({ ...empty, catalogSource: 'curated' })).toBe(true);
  });

  it('is true when catalogSource is image', () => {
    expect(hasWorkspaceProgress({ ...empty, catalogSource: 'image' })).toBe(true);
  });

  it('is true when rolePalette is present', () => {
    expect(hasWorkspaceProgress({ ...empty, rolePalette: {} })).toBe(true);
  });

  it('is true when generatedPalette is present', () => {
    expect(hasWorkspaceProgress({ ...empty, generatedPalette: {} })).toBe(true);
  });

  it('is true when an image file is loaded', () => {
    expect(hasWorkspaceProgress({ ...empty, imageFile: {} })).toBe(true);
  });

  it('is true when an image preview URL exists', () => {
    expect(
      hasWorkspaceProgress({ ...empty, imagePreviewUrl: 'blob:http://localhost/x' }),
    ).toBe(true);
  });

  it('is true while image extraction is busy', () => {
    expect(hasWorkspaceProgress({ ...empty, isImageBusy: true })).toBe(true);
  });
});
