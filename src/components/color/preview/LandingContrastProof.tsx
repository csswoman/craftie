import type { ButtonPair } from '@lib/color/buttonPair';
import type { ResolvedLayoutColors } from '@lib/color/layoutModes';

import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import { contrastReadout } from './previewButtons';
import { captionStyle, type PreviewFonts } from './previewTypography';

/** Measured contrast of the pairs this hero actually uses: ratio and level, computed, not claimed. */
export function LandingContrastProof({
  colors,
  fonts,
  buttonPair,
  onEditSlot,
}: {
  colors: ResolvedLayoutColors;
  fonts: PreviewFonts;
  buttonPair: ButtonPair;
  onEditSlot?: PreviewSlotEditHandler;
}) {
  const hero = colors.heroSurface ?? colors.primaryAction;
  const onHero = colors.onHero ?? colors.primaryActionText;
  const proofs = [
    { label: 'Titular', fg: onHero, bg: hero },
    { label: 'Botón', fg: buttonPair.on, bg: buttonPair.fill },
    { label: 'Cuerpo', fg: colors.text, bg: colors.appBackground },
  ];

  return (
    <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-3" aria-label="Contraste medido">
      {proofs.map((proof) => {
        const readout = contrastReadout(proof.fg, proof.bg);

        return (
          <li key={proof.label} className="flex items-center gap-2.5">
            <span
              aria-hidden="true"
              className="grid size-9 place-items-center rounded-[10px]"
              style={{ backgroundColor: proof.bg, color: proof.fg, outline: `1px solid ${onHero}`, outlineOffset: 1 }}
            >
              Aa
            </span>
            <PreviewSlotTarget slot="onHero" onEditSlot={onEditSlot} className="leading-tight" style={captionStyle(fonts, onHero)}>
              {proof.label}
              <span className="block tabular-nums">
                {readout.ratio} · {readout.level}
              </span>
            </PreviewSlotTarget>
          </li>
        );
      })}
    </ul>
  );
}
