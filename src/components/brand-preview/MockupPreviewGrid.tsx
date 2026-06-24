'use client';

import { useMemo, useState } from 'react';

import type { GeneratedPalette } from '@lib/color/formulas';
import { buildPaletteTokens } from '@lib/color/paletteTokens';
import { buildFontFamilyStack } from '@lib/typography/googleFonts';
import type { FontPair } from '@lib/typography/pairings';

import { BrandCardMockup } from './BrandCardMockup';
import { DashboardMockup } from './DashboardMockup';
import { LandingPageMockup } from './LandingPageMockup';
import type { MockupFonts } from './mockupTypes';
import { MockupCard } from './MockupCard';
import { MockupModal } from './MockupModal';
import { MockupScaledPreview } from './MockupScaledPreview';

export type MockupPreviewGridProps = {
  palette: GeneratedPalette | null;
  pairing: FontPair | null;
};

type MockupId = 'landing' | 'dashboard' | 'brand-card';

const MOCKUP_ITEMS: {
  id: MockupId;
  title: string;
  description: string;
  Preview: typeof LandingPageMockup;
  Expanded: typeof LandingPageMockup;
}[] = [
  {
    id: 'landing',
    title: 'Página de inicio',
    description: 'Hero, acciones y tarjetas de contenido.',
    Preview: LandingPageMockup,
    Expanded: LandingPageMockup,
  },
  {
    id: 'dashboard',
    title: 'Panel de control',
    description: 'Métricas, gráfico de actividad y estado.',
    Preview: DashboardMockup,
    Expanded: DashboardMockup,
  },
  {
    id: 'brand-card',
    title: 'Tarjeta de marca',
    description: 'Identidad con botón y franja de paleta.',
    Preview: BrandCardMockup,
    Expanded: BrandCardMockup,
  },
];

export function MockupPreviewGrid({ palette, pairing }: MockupPreviewGridProps) {
  const [activeMockup, setActiveMockup] = useState<MockupId | null>(null);

  const tokens = useMemo(
    () => (palette ? buildPaletteTokens(palette) : null),
    [palette],
  );

  const fonts: MockupFonts = useMemo(
    () => ({
      headingFamily: pairing ? buildFontFamilyStack(pairing.heading) : 'var(--font-display)',
      bodyFamily: pairing ? buildFontFamilyStack(pairing.body) : 'var(--font-body)',
    }),
    [pairing],
  );

  if (!palette || !tokens) {
    return (
      <section className="rounded-xl border border-dashed border-border bg-bg/60 px-4 py-8 text-center">
        <p className="text-[0.8125rem] font-semibold text-ink">Vistas previas de interfaz</p>
        <p className="mt-1 text-[0.75rem] leading-relaxed text-muted">
          Genera una paleta para ver cómo se aplica en landing, dashboard y tarjeta de marca.
        </p>
      </section>
    );
  }

  const activeItem = MOCKUP_ITEMS.find((item) => item.id === activeMockup);

  return (
    <section aria-label="Vistas previas de interfaz">
      <div className="mb-3">
        <h3 className="text-[0.9375rem] font-semibold text-ink">Vistas previas</h3>
        <p className="mt-1 text-[0.8125rem] leading-relaxed text-muted">
          Ejemplos de UI con los roles semánticos y tipografía de tu guía. Haz clic para ampliar.
        </p>
      </div>

      <ul className="grid gap-3 lg:grid-cols-2">
        {MOCKUP_ITEMS.map((item) => {
          const featured = item.id === 'landing';

          return (
          <li key={item.id} className={featured ? 'lg:col-span-2' : undefined}>
            <MockupCard
              title={item.title}
              description={item.description}
              featured={featured}
              onClick={() => setActiveMockup(item.id)}
            >
              <MockupScaledPreview>
                <item.Preview tokens={tokens} fonts={fonts} variant="preview" />
              </MockupScaledPreview>
            </MockupCard>
          </li>
          );
        })}
      </ul>

      {activeItem ? (
        <MockupModal
          open={activeMockup !== null}
          title={activeItem.title}
          onClose={() => setActiveMockup(null)}
        >
          <activeItem.Expanded tokens={tokens} fonts={fonts} variant="expanded" />
        </MockupModal>
      ) : null}
    </section>
  );
}
