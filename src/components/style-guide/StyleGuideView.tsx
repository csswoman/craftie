'use client';

import { useMemo } from 'react';

import type { GeneratedPalette } from '@lib/color/formulas';
import { buildGeneratedPaletteColumns } from '@lib/color/paletteDisplay';
import { formatColorValues } from '@lib/export/colorFormats';
import { buildFontFamilyStack } from '@lib/typography/googleFonts';
import type { FontPair } from '@lib/typography/pairings';
import { pickReadableTextColor } from '@lib/color/readableText';

import { MockupPreviewGrid } from '@/components/brand-preview/MockupPreviewGrid';

const COLOR_ROLES: { id: keyof GeneratedPalette; label: string }[] = [
  { id: 'surface', label: 'Fondo' },
  { id: 'onSurface', label: 'Texto' },
  { id: 'primary', label: 'Primario' },
  { id: 'accent', label: 'Acento' },
  { id: 'neutralLight', label: 'Superficie' },
  { id: 'neutralDark', label: 'Borde' },
];

export type StyleGuideViewProps = {
  palette: GeneratedPalette;
  pairing: FontPair | null;
};

export function StyleGuideView({ palette, pairing }: StyleGuideViewProps) {
  const headingFamily = pairing ? buildFontFamilyStack(pairing.heading) : 'var(--font-display)';
  const bodyFamily = pairing ? buildFontFamilyStack(pairing.body) : 'var(--font-body)';
  const headingName = pairing?.heading.family ?? 'Lora';
  const bodyName = pairing?.body.family ?? 'Nunito';
  const namedColors = useMemo(
    () => new Map(buildGeneratedPaletteColumns(palette).map((column) => [column.id, column.name])),
    [palette],
  );

  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-surface/40 p-4 pb-24 md:p-6 md:pb-28">
      <div className="mx-auto flex max-w-5xl flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <TypographyCard
            label="Titular"
            fontName={headingName}
            fontFamily={headingFamily}
            sample="Aa"
            color={palette.primary}
          />
          <TypographyCard
            label="Cuerpo"
            fontName={bodyName}
            fontFamily={bodyFamily}
            sample="Aa"
            color={palette.primary}
          />
        </div>

        <div className="space-y-2">
          {COLOR_ROLES.map((role) => (
            <ColorRoleBar
              key={role.id}
              name={namedColors.get(role.id) ?? role.label}
              label={role.label}
              hex={palette[role.id]}
            />
          ))}
        </div>

        <MockupPreviewGrid palette={palette} pairing={pairing} />
      </div>
    </div>
  );
}

function TypographyCard({
  label,
  fontName,
  fontFamily,
  sample,
  color,
}: {
  label: string;
  fontName: string;
  fontFamily: string;
  sample: string;
  color: string;
}) {
  return (
    <article className="rounded-xl border border-border bg-bg px-5 py-6">
      <p className="text-[0.8125rem] font-semibold text-muted">{label}</p>
      <p
        className="mt-3 text-[clamp(2.5rem,6vw,4rem)] font-semibold leading-none"
        style={{ fontFamily, color }}
      >
        {sample}
      </p>
      <p className="mt-4 text-[1.125rem] font-semibold text-ink" style={{ fontFamily }}>
        {fontName}
      </p>
    </article>
  );
}

function ColorRoleBar({ name, label, hex }: { name: string; label: string; hex: string }) {
  const formats = formatColorValues(hex);
  const textColor = pickReadableTextColor(hex);

  return (
    <div
      className="flex min-h-[52px] items-center justify-between gap-3 rounded-lg px-4 py-2"
      style={{ backgroundColor: hex, color: textColor }}
      aria-label={`${name}, ${formats.hex}, ${label}`}
    >
      <div>
        <p className="text-[0.8125rem] font-semibold">{name}</p>
        <p className="text-[0.6875rem] font-medium opacity-85">{label}</p>
      </div>
      <div className="text-right font-mono text-[0.6875rem] leading-relaxed opacity-90">
        <p>{formats.hex}</p>
        <p>{formats.rgb}</p>
        <p>{formats.cmyk}</p>
      </div>
    </div>
  );
}
