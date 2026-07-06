import type { Metadata } from 'next';
import { Lora, Nunito } from 'next/font/google';

import { ThemeProvider } from '@/components/theme/ThemeProvider';

import './globals.css';

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-lora',
  display: 'swap',
});

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Craftie',
  description:
    'Generate color palettes, validate WCAG accessibility, and explore font pairings.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${lora.variable} ${nunito.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
