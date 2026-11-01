import type { MessageKey } from '@lib/i18n/translate';

/** Entries of the Export menu, in display order. */
export const EXPORT_OPTIONS = [
  { id: 'share-link', labelKey: 'export.shareLink', descriptionKey: 'export.shareLinkDesc' },
  { id: 'copy-css', labelKey: 'export.copyCss', descriptionKey: 'export.copyCssDesc' },
  { id: 'css', labelKey: 'export.css', descriptionKey: 'export.cssDesc' },
  { id: 'tokens-json', labelKey: 'export.tokens', descriptionKey: 'export.tokensDesc' },
  { id: 'figma', labelKey: 'export.figma', descriptionKey: 'export.figmaDesc' },
  { id: 'tailwind', labelKey: 'export.tailwind', descriptionKey: 'export.tailwindDesc' },
  { id: 'shadcn', labelKey: 'export.shadcn', descriptionKey: 'export.shadcnDesc' },
  { id: 'design-md', labelKey: 'export.designMd', descriptionKey: 'export.designMdDesc' },
  { id: 'brand-kit', labelKey: 'export.brandKit', descriptionKey: 'export.brandKitDesc' },
  { id: 'image', labelKey: 'export.image', descriptionKey: 'export.imageDesc' },
] as const satisfies ReadonlyArray<{ id: string; labelKey: MessageKey; descriptionKey: MessageKey }>;
