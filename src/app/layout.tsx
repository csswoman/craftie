import type { Metadata } from 'next';
import { Open_Sans, Playfair_Display } from 'next/font/google';

import './globals.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const openSans = Open_Sans({
  subsets: ['latin'],
  variable: '--font-open-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Palette & Type Tool',
  description:
    'Generate color palettes, validate WCAG accessibility, and explore font pairings.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${playfair.variable} ${openSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
