'use client';

import { useState } from 'react';

import { NEUTRAL_SCALE_STEPS, type NeutralScaleStep } from '@lib/color/neutralScale';

import { useRolePaletteOptional } from '@/context/RolePaletteContext';
import { copyTextToClipboard } from '@/lib/browser/shareUrl';

/** White-to-black UI neutral scale of the current palette; click a step to copy its HEX. */
export function NeutralScaleStrip() {
  const neutralScale = useRolePaletteOptional()?.neutralScale ?? null;
  const [copied, setCopied] = useState<NeutralScaleStep | null>(null);

  if (!neutralScale) return null;

  async function copy(step: NeutralScaleStep) {
    if (await copyTextToClipboard(neutralScale![step])) setCopied(step);
  }

  return (
    <div className="mt-2.5">
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <p className="text-tools-meta-scale font-semibold text-ink">Escala neutra</p>
        <p aria-live="polite" className="text-tools-meta-scale text-muted">
          {copied === null ? 'Blanco → negro para UI' : `neutral-${copied} copiado`}
        </p>
      </div>
      <ul aria-label="Escala neutra de blanco a negro" className="flex overflow-hidden rounded-md border border-line">
        {NEUTRAL_SCALE_STEPS.map((step) => (
          <li key={step} className="min-w-0 flex-1">
            <button
              type="button"
              title={`neutral-${step} · ${neutralScale[step]}`}
              aria-label={`Copiar neutral-${step}, ${neutralScale[step]}`}
              onClick={() => void copy(step)}
              className="block h-7 w-full focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-forest/40"
              style={{ backgroundColor: neutralScale[step] }}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
