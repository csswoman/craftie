import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Craftie',
    short_name: 'Craftie',
    description: 'Color palettes, WCAG validation, and font pairings.',
    start_url: '/',
    display: 'standalone',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }],
  };
}
