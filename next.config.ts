import type { NextConfig } from 'next';

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  // Script and style sources are intentionally not restricted here: Next.js
  // injects inline bootstrap scripts, and a nonce-based policy needs middleware.
  {
    key: 'Content-Security-Policy',
    value: "base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'",
  },
];

const nextConfig: NextConfig = {
  // Lets a production build run in a separate folder while `next dev` is using .next.
  distDir: process.env.NEXT_DIST_DIR ?? '.next',
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      // The worker must always be revalidated so updates reach visitors.
      { source: '/sw.js', headers: [{ key: 'Cache-Control', value: 'no-cache' }] },
    ];
  },
  async redirects() {
    return [
      {
        source: '/select-colors',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
