'use client';

import { useMemo, useState } from 'react';

import type { GeneratedPalette } from '@lib/color/formulas';
import { buildGeneratedPaletteColumns } from '@lib/color/paletteDisplay';
import { buildFontFamilyStack } from '@lib/typography/googleFonts';
import type { FontPair } from '@lib/typography/pairings';
import { formatColorValues } from '@lib/export/colorFormats';
import type { LayoutView } from '@lib/export/studioViews';

import { ColorDetailsDrawer } from '@/components/color-engine/ColorDetailsDrawer';

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

function WebsiteMock({
  palette,
  heading,
  body,
}: {
  palette: GeneratedPalette;
  heading: string;
  body: string;
}) {
  return (
    <div>
      <div className="border-b px-6 py-4" style={{ borderColor: palette.neutralLight }}>
        <p className="text-sm font-semibold" style={{ fontFamily: heading, color: palette.primary }}>
          Marca
        </p>
      </div>
      <div className="space-y-4 px-6 py-10">
        <h2
          className="text-3xl font-semibold"
          style={{ fontFamily: heading, color: palette.primary }}
        >
          Propuesta de valor clara
        </h2>
        <p className="max-w-xl text-base" style={{ fontFamily: body, color: palette.onSurface }}>
          Bloques de contenido con tu paleta aplicada a titular, cuerpo y acciones.
        </p>
        <span
          className="inline-block rounded-md px-4 py-2 text-sm font-semibold text-white"
          style={{ backgroundColor: palette.primary, fontFamily: heading }}
        >
          Empezar
        </span>
      </div>
    </div>
  );
}

function UiGridMock({
  palette,
  heading,
  body,
}: {
  palette: GeneratedPalette;
  heading: string;
  body: string;
}) {
  return (
    <div className="grid gap-4 p-6 sm:grid-cols-2">
      {[1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className="rounded-lg border p-4"
          style={{ borderColor: palette.neutralLight, fontFamily: body, color: palette.onSurface }}
        >
          <p className="text-sm font-semibold" style={{ fontFamily: heading, color: palette.primary }}>
            Módulo {item}
          </p>
          <p className="mt-2 text-sm">Tarjeta de producto con estados hover y foco.</p>
        </div>
      ))}
    </div>
  );
}

function SlidesMock({
  palette,
  heading,
  body,
}: {
  palette: GeneratedPalette;
  heading: string;
  body: string;
}) {
  return (
    <div className="aspect-video p-10" style={{ backgroundColor: palette.primary, color: palette.surface }}>
      <p className="text-sm font-medium opacity-80" style={{ fontFamily: body }}>
        Presentación
      </p>
      <h2 className="mt-4 text-4xl font-semibold" style={{ fontFamily: heading }}>
        Slide de apertura
      </h2>
    </div>
  );
}

function SocialMock({
  palette,
  heading,
  body,
}: {
  palette: GeneratedPalette;
  heading: string;
  body: string;
}) {
  return (
    <div className="mx-auto aspect-[9/16] max-w-xs p-6" style={{ backgroundColor: palette.accent }}>
      <p className="text-xs font-medium text-white/80" style={{ fontFamily: body }}>
        Social
      </p>
      <h2 className="mt-6 text-2xl font-semibold text-white" style={{ fontFamily: heading }}>
        Post vertical
      </h2>
    </div>
  );
}

function NewsletterMock({
  palette,
  heading,
  body,
}: {
  palette: GeneratedPalette;
  heading: string;
  body: string;
}) {
  return (
    <div className="space-y-4 p-8">
      <h2 className="text-2xl font-semibold" style={{ fontFamily: heading, color: palette.primary }}>
        Boletín semanal
      </h2>
      <div className="h-24 rounded-lg" style={{ backgroundColor: palette.neutralLight }} />
      <p style={{ fontFamily: body, color: palette.onSurface }}>
        Dos columnas de contenido con jerarquía editorial.
      </p>
    </div>
  );
}

function ResumeMock({
  palette,
  heading,
  body,
}: {
  palette: GeneratedPalette;
  heading: string;
  body: string;
}) {
  return (
    <div className="grid gap-6 p-8 md:grid-cols-[1fr_2fr]">
      <div>
        <h2 className="text-xl font-semibold" style={{ fontFamily: heading, color: palette.primary }}>
          Nombre
        </h2>
        <p className="mt-2 text-sm" style={{ fontFamily: body, color: palette.onSurface }}>
          Rol · Ciudad
        </p>
      </div>
      <div className="space-y-3">
        <p className="text-sm font-semibold" style={{ fontFamily: heading, color: palette.primary }}>
          Experiencia
        </p>
        <p className="text-sm" style={{ fontFamily: body, color: palette.onSurface }}>
          Resumen de logros con tipografía de cuerpo legible.
        </p>
      </div>
    </div>
  );
}

function BusinessCardMock({
  palette,
  heading,
  body,
}: {
  palette: GeneratedPalette;
  heading: string;
  body: string;
}) {
  return (
    <div className="grid gap-4 p-8 sm:grid-cols-2">
      <div
        className="aspect-[1.75/1] rounded-lg p-5"
        style={{ backgroundColor: palette.primary, color: palette.surface, fontFamily: heading }}
      >
        <p className="text-lg font-semibold">Craftie Studio</p>
        <p className="mt-8 text-xs" style={{ fontFamily: body }}>
          craftie.app
        </p>
      </div>
      <div
        className="aspect-[1.75/1] rounded-lg border p-5"
        style={{ borderColor: palette.neutralLight, fontFamily: body, color: palette.onSurface }}
      >
        <p className="text-sm font-semibold" style={{ fontFamily: heading, color: palette.primary }}>
          Tu nombre
        </p>
        <p className="mt-2 text-xs">Diseño · Marca · Producto</p>
      </div>
    </div>
  );
}

export { StudioPlaceholder };
