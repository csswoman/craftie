import type { Metadata } from 'next';
import { Lora, Nunito } from 'next/font/google';

import { ServiceWorkerRegister } from '@/components/ServiceWorkerRegister';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { I18nProvider } from '@/context/I18nContext';
import { SITE_URL } from '@/lib/site';

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

const description =
  'Generate color palettes, validate WCAG accessibility, and explore font pairings.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'Craftie', template: '%s | Craftie' },
  description,
  applicationName: 'Craftie',
  openGraph: {
    type: 'website',
    siteName: 'Craftie',
    title: 'Craftie',
    description,
  },
  twitter: {
    card: 'summary',
    title: 'Craftie',
    description,
  },
};

export const viewport = {
  viewportFit: 'cover' as const,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${lora.variable} ${nunito.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider>
          <I18nProvider>{children}</I18nProvider>
          <ServiceWorkerRegister />
        </ThemeProvider>
      </body>
    </html>
  );
}
