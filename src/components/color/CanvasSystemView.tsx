'use client';

import { useEffect, useMemo } from 'react';

import type { CanvasViewId } from '@lib/color/canvasViews';
import { contrastRatio } from '@lib/color/contrast';
import { ROLE_LABELS, type PaletteRoleId } from '@lib/color/roleTypes';
import { resolveActiveFontPair } from '@lib/typography/activePairing';
import { buildFontFamilyStack } from '@lib/typography/googleFonts';
import type { FontPair } from '@lib/typography/pairings';
import type { AppliedTypography } from '@lib/typography/typeState';
import { buildTypeScaleLevels, type TypeScaleBase, type TypeScaleRatio } from '@lib/typography/typeScale';
import { withRoleWeights } from '@lib/typography/typeRoles';
import type { SizeOverrides } from '@/components/font-pairing/FineTuneSizes';
import type { TypographySpacing } from '@/components/font-pairing/SpacingControls';
import { familyStackFromApplied } from '@lib/typography/typeState';

import { useRolePalette } from '@/context/RolePaletteContext';
import { useTypeRoles } from '@/context/TypeRolesContext';
import { loadGoogleFonts } from '@/lib/browser/googleFonts';
import { TypeScalePreview } from '@/components/color/TypeScalePreview';

type CanvasSystemViewProps = {
  view: Extract<CanvasViewId, 'style-guide' | 'type-scale'>;
  base: TypeScaleBase;
  ratio: TypeScaleRatio;
  overrides: SizeOverrides;
  spacing: TypographySpacing;
  largerSteps: number;
  smallerSteps: number;
  selectedPairing: FontPair | null;
  appliedTypography?: AppliedTypography;
  recommendedPairings: FontPair[];
};

export function CanvasSystemView({
  view,
  base,
  ratio,
  overrides,
  spacing,
  largerSteps,
  smallerSteps,
  selectedPairing,
  appliedTypography,
  recommendedPairings,
}: CanvasSystemViewProps) {
  const { rolePalette } = useRolePalette();
  const activePairing = resolveActiveFontPair(selectedPairing, recommendedPairings);
  const headingFont = useMemo(
    () => appliedTypography
      ? familyStackFromApplied(appliedTypography.headingFamily, appliedTypography.headingClassification)
      : buildFontFamilyStack(activePairing.heading),
    [activePairing.heading, appliedTypography],
  );
  const bodyFont = useMemo(
    () => appliedTypography
      ? familyStackFromApplied(appliedTypography.bodyFamily, appliedTypography.bodyClassification)
      : buildFontFamilyStack(activePairing.body),
    [activePairing.body, appliedTypography],
  );
  const headingFamily = appliedTypography?.headingFamily ?? activePairing.heading.family;
  const bodyFamily = appliedTypography?.bodyFamily ?? activePairing.body.family;
  const headingWeight = appliedTypography?.headingWeight ?? activePairing.heading.defaultWeight ?? 700;
  const bodyWeight = appliedTypography?.bodyWeight ?? activePairing.body.defaultWeight ?? 400;

  const { weights: roleWeights, levelOverrides } = useTypeRoles();
  const loadablePairing = useMemo(() => {
    const weights = { heading: [...roleWeights.heading], body: [...roleWeights.body] };

    for (const level of buildTypeScaleLevels(base, ratio, largerSteps, smallerSteps)) {
      const weight = levelOverrides[level.id]?.weight;
      if (weight !== undefined) {
        weights[level.role].push(weight);
      }
    }

    return withRoleWeights(activePairing, weights);
  }, [activePairing, roleWeights, levelOverrides, base, ratio, largerSteps, smallerSteps]);

  useEffect(() => {
    loadGoogleFonts([loadablePairing]);
  }, [loadablePairing]);

  if (!rolePalette) return null;

  const colors = Object.values(rolePalette).slice(0, 6).map((role) => role.hex);
  const paletteRows: PaletteRoleId[] = ['fondo', 'texto', 'primario', 'acento', 'superficie', 'borde'];
  const accentForeground = contrastRatio('#FFFFFF', rolePalette.acento.hex) >= contrastRatio('#111111', rolePalette.acento.hex)
    ? '#FFFFFF'
    : '#111111';
  const primaryForeground = contrastRatio('#FFFFFF', rolePalette.primario.hex) >= contrastRatio('#111111', rolePalette.primario.hex)
    ? '#FFFFFF'
    : '#111111';
  const paletteSurfaceStyle = { backgroundColor: rolePalette.superficie.hex, borderColor: rolePalette.borde.hex };
  const paletteTextStyle = { color: rolePalette.texto.hex };
  const paletteMutedStyle = { color: rolePalette.texto.hex, opacity: 0.7 };

  return (
    <div className="canvas-dots min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
      <div className={`mx-auto space-y-4 ${view === 'type-scale' ? 'max-w-6xl' : 'max-w-4xl'}`}>
        {view === 'type-scale' ? (
          <TypeScalePreview
            base={base} ratio={ratio} headingFamily={headingFont} bodyFamily={bodyFont}
            headingWeight={headingWeight} bodyWeight={bodyWeight} headingName={headingFamily}
            bodyName={bodyFamily} background={rolePalette.fondo.hex} surface={rolePalette.superficie.hex}
            text={rolePalette.texto.hex} border={rolePalette.borde.hex}
            overrides={overrides} spacing={spacing} largerSteps={largerSteps} smallerSteps={smallerSteps}
          />
        ) : (
          <section className="space-y-5">
            <div
              className="relative overflow-hidden rounded-xl px-6 py-8 sm:px-10 sm:py-10"
              style={{ backgroundColor: rolePalette.fondo.hex, color: rolePalette.texto.hex }}
            >
              <div className="relative z-10 max-w-2xl">
                <p className="text-chrome-caption font-semibold uppercase tracking-[0.12em]" style={{ opacity: 0.7 }}>Dirección visual</p>
                <h1 className="mt-5 text-4xl sm:text-6xl" style={{ ...paletteTextStyle, fontFamily: headingFont, fontWeight: headingWeight, lineHeight: 0.98 }}>
                  Ideas claras, marcas memorables.
                </h1>
                <p className="mt-5 max-w-xl text-base leading-relaxed opacity-80 sm:text-lg" style={{ fontFamily: bodyFont, fontWeight: bodyWeight }}>
                  Una combinación de color, escala y tipografía pensada para comunicar con intención.
                </p>
                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <button type="button" className="min-h-11 rounded-md px-5 text-sm font-semibold" style={{ backgroundColor: rolePalette.acento.hex, color: accentForeground, fontFamily: bodyFont }}>
                    Ver identidad
                  </button>
                  <span className="rounded-full border px-3 py-2 text-xs font-medium" style={{ borderColor: rolePalette.borde.hex, color: rolePalette.texto.hex }}>
                    {headingFamily} + {bodyFamily}
                  </span>
                </div>
              </div>
              <div className="absolute -right-16 -top-20 size-64 rounded-full opacity-80" style={{ backgroundColor: rolePalette.primario.hex }} />
              <div className="absolute -bottom-24 right-20 size-48 rounded-full opacity-70" style={{ backgroundColor: rolePalette.acento.hex }} />
            </div>

            <div className="grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(18rem,0.7fr)]">
              <div className="rounded-xl border p-5 sm:p-6" style={paletteSurfaceStyle}>
                <div className="flex items-end justify-between gap-4">
                  <div><p className="text-chrome-caption font-semibold uppercase tracking-[0.1em]" style={paletteMutedStyle}>Paleta</p><h2 className="mt-1 text-2xl" style={{ ...paletteTextStyle, fontFamily: headingFont }}>Roles de color</h2></div>
                  <span className="font-mono text-xs" style={paletteMutedStyle}>{paletteRows.length} roles</span>
                </div>
                <div className="mt-5 grid gap-2 sm:grid-cols-2">
                  {paletteRows.map((role) => {
                    const slot = rolePalette[role];
                    const foreground = contrastRatio('#FFFFFF', slot.hex) >= contrastRatio('#111111', slot.hex) ? '#FFFFFF' : '#111111';
                    return <div key={role} className="flex min-h-20 items-end justify-between rounded-lg p-3" style={{ backgroundColor: slot.hex, color: foreground }}><span className="text-sm font-semibold">{ROLE_LABELS[role]}</span><span className="font-mono text-[0.68rem] opacity-80">{slot.hex.toUpperCase()}</span></div>;
                  })}
                </div>
              </div>

              <div className="rounded-xl border p-5 sm:p-6" style={paletteSurfaceStyle}>
                <p className="text-chrome-caption font-semibold uppercase tracking-[0.1em]" style={paletteMutedStyle}>Componentes</p>
                <h2 className="mt-1 text-2xl" style={{ ...paletteTextStyle, fontFamily: headingFont }}>UI esencial</h2>
                <div className="mt-5 rounded-lg border p-4" style={{ backgroundColor: rolePalette.fondo.hex, borderColor: rolePalette.borde.hex }}>
                  <div className="flex items-center justify-between"><span className="text-sm font-semibold" style={{ ...paletteTextStyle, fontFamily: bodyFont }}>Estado activo</span><span className="rounded-full px-2 py-1 text-[0.68rem] font-semibold" style={{ backgroundColor: rolePalette.acento.hex, color: accentForeground }}>Nuevo</span></div>
                  <p className="mt-2 text-xs leading-relaxed" style={{ ...paletteMutedStyle, fontFamily: bodyFont }}>Los elementos comparten la misma voz visual.</p>
                  <div className="mt-4 h-2 overflow-hidden rounded-full" style={{ backgroundColor: rolePalette.borde.hex }}><div className="h-full w-3/4 rounded-full" style={{ backgroundColor: rolePalette.primario.hex }} /></div>
                  <div className="mt-4 flex gap-2"><button type="button" className="min-h-10 flex-1 rounded-md px-3 text-xs font-semibold" style={{ backgroundColor: rolePalette.primario.hex, color: primaryForeground, fontFamily: bodyFont }}>Continuar</button><button type="button" className="min-h-10 rounded-md border px-3 text-xs font-semibold" style={{ ...paletteTextStyle, borderColor: rolePalette.borde.hex, fontFamily: bodyFont }}>Más</button></div>
                </div>
                <div className="mt-4 flex gap-2"><span className="size-8 rounded-full" style={{ backgroundColor: rolePalette.primario.hex }} /><span className="size-8 rounded-full" style={{ backgroundColor: rolePalette.acento.hex }} /><span className="size-8 rounded-full" style={{ backgroundColor: rolePalette.secundario.hex }} /><span className="size-8 rounded-full" style={{ backgroundColor: rolePalette.borde.hex }} /></div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
