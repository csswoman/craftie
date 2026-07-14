import type { SemanticTokenName } from '@lib/color/semanticTokens';

import { UiColorSectionHeader } from './UiColorSectionHeader';

export function TintedNeutralsSection({
  hue,
  steps,
  openToken,
  onSelect,
}: {
  hue: number;
  steps: Array<{ lightness: number; hex: string }>;
  openToken: SemanticTokenName | null;
  onSelect: (hex: string) => void;
}) {
  return (
    <section aria-labelledby="tinted-neutrals-title">
      <UiColorSectionHeader title={`Neutrales teñidos · hue ${Math.round(hue)}°`} />
      <h2 id="tinted-neutrals-title" className="sr-only">Neutrales teñidos</h2>
      <div className="mt-2 flex overflow-hidden rounded-md ring-1 ring-inset ring-ink/10">
        {steps.map((step) => (
          <button
            key={step.lightness}
            type="button"
            disabled={!openToken}
            title={openToken ? `Asignar L ${step.lightness.toFixed(2)}` : 'Abre un rol para asignar este neutral'}
            aria-label={openToken ? `Asignar neutral L ${step.lightness.toFixed(2)}` : `Neutral L ${step.lightness.toFixed(2)}; abre un rol para asignarlo`}
            onClick={() => onSelect(step.hex)}
            className="h-10 min-w-0 flex-1 focus-visible:z-10 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-primary/35 disabled:cursor-default"
            style={{ backgroundColor: step.hex }}
          />
        ))}
      </div>
      <div className="mt-1 flex">
        {steps.map((step) => (
          <span key={step.lightness} className="min-w-0 flex-1 text-center font-mono text-[0.5625rem] tabular-nums text-muted">
            {step.lightness.toFixed(2).replace(/^0/, '')}
          </span>
        ))}
      </div>
      <p className="mt-2 text-tools-meta leading-relaxed text-muted">
        Blancos y negros con el hue de la imagen. Haz clic en un rol para elegir de aquí.
      </p>
    </section>
  );
}
