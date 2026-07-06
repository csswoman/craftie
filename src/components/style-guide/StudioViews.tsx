'use client';

import { useMemo, useState } from 'react';

import type { GeneratedPalette } from '@lib/color/formulas';
import { buildGeneratedPaletteColumns } from '@lib/color/paletteDisplay';
import { buildFontFamilyStack } from '@lib/typography/googleFonts';
import type { FontPair } from '@lib/typography/pairings';
import { formatColorValues } from '@lib/export/colorFormats';
import type { LayoutView } from '@lib/export/studioViews';

import { ColorDetailsDrawer } from '@/components/color-engine/ColorDetailsDrawer';
import {
  BusinessCardMock,
  NewsletterMock,
  ResumeMock,
  SlidesMock,
  SocialMock,
  UiGridMock,
  WebsiteMock,
} from '@/components/style-guide/StudioLayoutMocks';

const SCALE_STEPS = [
  { label: 'Display', size: 'clamp(2rem, 4vw, 3rem)', weight: 600 },
  { label: 'Headline', size: '1.5rem', weight: 600 },
  { label: 'Title', size: '1.125rem', weight: 600 },
  { label: 'Body', size: '0.9375rem', weight: 400 },
  { label: 'Label', size: '0.8125rem', weight: 500 },
];

export type TypeScaleViewProps = {
  palette: GeneratedPalette;
  pairing: FontPair | null;
};

export function TypeScaleView({ palette, pairing }: TypeScaleViewProps) {
  if (!pairing) {
    return <StudioPlaceholder message="Elige un par tipográfico en el panel izquierdo para ver la escala." />;
  }

  const heading = buildFontFamilyStack(pairing.heading);
  const body = buildFontFamilyStack(pairing.body);

  return (
    <div className="min-h-0 flex-1 overflow-y-auto p-6" style={{ backgroundColor: palette.surface }}>
      <ul className="mx-auto max-w-2xl space-y-6">
        {SCALE_STEPS.map((step, index) => {
          const isDisplay = index === 0 || index === 1;
          const fontFamily = isDisplay ? heading : body;

          return (
            <li
              key={step.label}
              className="border-b border-border/50 pb-6 last:border-b-0"
              style={{ color: palette.onSurface }}
            >
              <p className="text-[0.8125rem] font-semibold text-muted">{step.label}</p>
              <p
                className="mt-2 leading-tight"
                style={{
                  fontFamily,
                  fontSize: step.size,
                  fontWeight: step.weight,
                  color: isDisplay ? palette.primary : palette.onSurface,
                }}
              >
                {isDisplay ? pairing.heading.family : 'Texto de cuerpo legible en múltiples líneas.'}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export type ColorsViewProps = {
  palette: GeneratedPalette;
};

export function ColorsView({ palette }: ColorsViewProps) {
  const [selectedColorHex, setSelectedColorHex] = useState<string | null>(null);
  const columns = useMemo(() => buildGeneratedPaletteColumns(palette), [palette]);

  return (
    <div className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6">
      <ul className="mx-auto max-w-3xl space-y-3">
        {columns.map((column) => {
          const formats = formatColorValues(column.hex);
          return (
            <li key={column.id} className="overflow-hidden rounded-xl border border-border bg-bg">
              <button
                type="button"
                onClick={() => setSelectedColorHex(column.hex)}
                className="block w-full text-left focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
              >
                <div className="h-16 w-full" style={{ backgroundColor: column.hex }} aria-hidden="true" />
                <div className="grid gap-1 px-4 py-3 sm:grid-cols-[140px_1fr]">
                  <div>
                    <p className="text-[0.9375rem] font-semibold text-ink">{column.name}</p>
                    {column.roleLabel ? (
                      <p className="mt-0.5 text-[0.75rem] font-medium text-muted">{column.roleLabel}</p>
                    ) : null}
                  </div>
                  <div className="font-mono text-[0.75rem] text-muted">
                    <p>{formats.hex}</p>
                    <p>RGB {formats.rgb}</p>
                    <p>CMYK {formats.cmyk}</p>
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      <ColorDetailsDrawer
        colorHex={selectedColorHex}
        open={selectedColorHex !== null}
        onClose={() => setSelectedColorHex(null)}
      />
    </div>
  );
}

export type LayoutPreviewProps = {
  layout: LayoutView;
  palette: GeneratedPalette;
  pairing: FontPair | null;
};

export function LayoutPreview({ layout, palette, pairing }: LayoutPreviewProps) {
  const heading = pairing ? buildFontFamilyStack(pairing.heading) : 'var(--font-display)';
  const body = pairing ? buildFontFamilyStack(pairing.body) : 'var(--font-body)';

  return (
    <div
      className="flex min-h-0 flex-1 items-center justify-center overflow-auto p-6"
      style={{ backgroundColor: palette.neutralLight }}
    >
      <div
        className="w-full max-w-4xl overflow-hidden rounded-xl border border-border bg-bg"
        style={{ backgroundColor: palette.surface }}
      >
        {layout === 'website' && <WebsiteMock palette={palette} heading={heading} body={body} />}
        {layout === 'ui-grid' && <UiGridMock palette={palette} heading={heading} body={body} />}
        {layout === 'slides' && <SlidesMock palette={palette} heading={heading} body={body} />}
        {layout === 'social' && <SocialMock palette={palette} heading={heading} body={body} />}
        {layout === 'newsletter' && <NewsletterMock palette={palette} heading={heading} body={body} />}
        {layout === 'resume' && <ResumeMock palette={palette} heading={heading} body={body} />}
        {layout === 'business-card' && (
          <BusinessCardMock palette={palette} heading={heading} body={body} />
        )}
      </div>
    </div>
  );
}

function StudioPlaceholder({ message }: { message: string }) {
  return (
    <div className="flex min-h-[320px] flex-1 items-center justify-center px-6 text-center">
      <p className="max-w-sm text-[0.9375rem] leading-relaxed text-muted">{message}</p>
    </div>
  );
}

export { StudioPlaceholder };
