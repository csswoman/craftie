const ACCEPTED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

function isAcceptedImage(file: File): boolean {
  if (ACCEPTED_MIME_TYPES.has(file.type)) {
    return true;
  }

  return /\.(jpe?g|png|webp)$/i.test(file.name);
}

export function validateImageFile(file: File, maxFileSizeMB: number): void {
  if (!isAcceptedImage(file)) {
    throw new Error('Unsupported image format. Accepted formats: JPG, PNG, and WebP.');
  }

  const maxBytes = maxFileSizeMB * 1024 * 1024;

  if (file.size > maxBytes) {
    throw new Error(`Image exceeds maximum size of ${maxFileSizeMB}MB.`);
  }
}
