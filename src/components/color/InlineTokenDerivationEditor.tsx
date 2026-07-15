'use client';

import { useMemo, useState } from 'react';

import { getSemanticTokenContrastInfo } from '@lib/color/semanticTokenTargets';
import { previewSemanticToken } from '@lib/color/semanticTokenPreview';
import type { SemanticTokenName } from '@lib/color/semanticTokens';
import { hexToOklchChannels, oklchChannelsToHex } from '@lib/utils/colorMath';

import { useRolePalette } from '@/context/RolePaletteContext';

export function InlineTokenDerivationEditor({
  tokenName,
  originalHex,
  onApply,
}: {
  tokenName: SemanticTokenName;
  originalHex: string;
  onApply: (hex: string) => void;
}) {
  const { semanticTokens } = useRolePalette();
  const original = useMemo(() => hexToOklchChannels(originalHex), [originalHex]);
  const [draftLightness, setDraftLightness] = useState(original.l);
  const draftHex = useMemo(
    () => oklchChannelsToHex(draftLightness, original.c, original.h),
    [draftLightness, original],
  );
  const previewTokens = useMemo(
    () => semanticTokens ? previewSemanticToken(semanticTokens, tokenName, draftHex) : null,
    [draftHex, semanticTokens, tokenName],
  );
  const contrast = useMemo(
    () => previewTokens ? getSemanticTokenContrastInfo(previewTokens, tokenName) : null,
    [previewTokens, tokenName],
  );

  if (!semanticTokens) return null;
  const passes = contrast === null || contrast.status === 'pass';
  const unchanged = draftHex.toUpperCase() === originalHex.toUpperCase();

  return (
    <div className="space-y-3 border-t border-border pt-3">
      <div className="flex items-center gap-2">
        <span
          className="size-9 shrink-0 rounded-md ring-1 ring-inset ring-ink/10"
          style={{ backgroundColor: draftHex }}
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1">
          <p className="text-tools-meta font-semibold text-ink">Vista previa</p>
          <p className="truncate font-mono text-tools-meta tabular-nums text-muted">
            {draftHex.toUpperCase()}
          </p>
        </div>
      </div>

      <label className="block">
        <span className="mb-1 flex items-center justify-between gap-2 text-tools-meta text-muted">
          <span>Luminosidad</span>
          <span className="font-mono tabular-nums">{draftLightness.toFixed(2)}</span>
        </span>
        <input
          type="range"
          min="0.05"
          max="0.98"
          step="0.01"
          value={draftLightness}
          onChange={(event) => setDraftLightness(Number(event.target.value))}
          className="h-11 w-full cursor-pointer appearance-none rounded-full bg-surface-raised accent-primary"
        />
      </label>

      {contrast ? (
        <div className="flex items-center justify-between gap-2 text-tools-meta">
          <span className="text-muted">Contraste de la vista previa</span>
          <span className={`font-mono font-semibold tabular-nums ${passes ? 'text-pass' : 'text-fail'}`}>
            {contrast.ratio.toFixed(1)}:1 {passes ? '✓' : '⚠'}
          </span>
        </div>
      ) : null}

      {!passes ? (
        <p className="text-tools-meta leading-relaxed text-fail">
          Esta variante no alcanza AA. No se aplicará sin tu confirmación explícita.
        </p>
      ) : null}

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={unchanged}
          onClick={() => setDraftLightness(original.l)}
          className="min-h-11 rounded-md border border-border bg-bg px-2 text-tools-meta font-semibold text-ink hover:bg-surface-raised disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
        >
          Restablecer
        </button>
        <button
          type="button"
          disabled={unchanged}
          onClick={() => onApply(draftHex)}
          className={`min-h-11 rounded-md px-2 text-tools-meta font-semibold focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 ${
            passes
              ? 'bg-[var(--chrome-green)] text-white hover:brightness-95'
              : 'border border-fail bg-bg text-fail hover:bg-fail/5'
          } disabled:cursor-not-allowed disabled:opacity-45`}
        >
          {passes ? 'Aplicar variante' : 'Aplicar de todos modos'}
        </button>
      </div>
    </div>
  );
}
