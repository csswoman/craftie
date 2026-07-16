'use client';

import { useEffect, useMemo, useState } from 'react';

import { getSemanticTokenContrastInfo } from '@lib/color/semanticTokenTargets';
import { previewSemanticToken } from '@lib/color/semanticTokenPreview';
import type { SemanticTokenName } from '@lib/color/semanticTokens';
import { hexToOklchChannels, oklchChannelsToHex } from '@lib/utils/colorMath';

import { useRolePalette } from '@/context/RolePaletteContext';

export function InlineTokenDerivationEditor({
  tokenName,
  originalHex,
  currentHex,
  candidateHex,
  applied = false,
  onApply,
  onDraftChange = () => {},
}: {
  tokenName: SemanticTokenName;
  originalHex: string;
  currentHex?: string;
  candidateHex?: string;
  applied?: boolean;
  onApply: (hex: string) => void;
  onDraftChange?: () => void;
}) {
  const { semanticTokens, setTokenEditPreview, clearTokenEditPreview } = useRolePalette();
  const original = useMemo(() => hexToOklchChannels(originalHex), [originalHex]);
  const draftBase = useMemo(
    () => hexToOklchChannels(candidateHex ?? currentHex ?? originalHex),
    [candidateHex, currentHex, originalHex],
  );
  const [draftLightness, setDraftLightness] = useState(draftBase.l);
  const [draftChroma, setDraftChroma] = useState(draftBase.c);
  const draftHex = useMemo(
    () => oklchChannelsToHex(draftLightness, draftChroma, draftBase.h),
    [draftBase.h, draftChroma, draftLightness],
  );
  const previewTokens = useMemo(
    () => (semanticTokens ? previewSemanticToken(semanticTokens, tokenName, draftHex) : null),
    [draftHex, semanticTokens, tokenName],
  );
  const contrast = useMemo(
    () => (previewTokens ? getSemanticTokenContrastInfo(previewTokens, tokenName) : null),
    [previewTokens, tokenName],
  );

  useEffect(() => {
    setTokenEditPreview({ kind: 'token', tokenName, hex: draftHex });
  }, [draftHex, setTokenEditPreview, tokenName]);

  useEffect(() => () => {
    clearTokenEditPreview();
  }, [clearTokenEditPreview]);

  if (!semanticTokens) return null;
  const passes = contrast === null || contrast.status === 'pass';
  const unchanged = draftHex.toUpperCase() === (currentHex ?? originalHex).toUpperCase();
  const atOriginal = (currentHex ?? originalHex).toUpperCase() === originalHex.toUpperCase();
  const lightnessDelta = draftLightness - original.l;
  const chromaDelta = draftChroma - original.c;

  function updateLightness(value: number) {
    onDraftChange();
    setDraftLightness(value);
  }

  function updateChroma(value: number) {
    onDraftChange();
    setDraftChroma(value);
  }

  return (
    <div className="space-y-2.5 rounded-lg border border-forest/25 bg-bg p-3">
      <div className="flex items-center gap-2.5">
        <span
          className="size-9 shrink-0 rounded-full ring-1 ring-inset ring-ink/10"
          style={{ backgroundColor: draftHex }}
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1">
          <p className="text-tools-body-sm font-semibold text-ink">Ajuste no destructivo</p>
          <p className="truncate font-mono text-tools-meta-scale tabular-nums text-muted">
            {draftHex.toUpperCase()} · original {originalHex.toUpperCase()}
          </p>
        </div>
      </div>

      <label className="block">
        <span className="mb-1 flex items-center justify-between gap-2 text-tools-meta-scale font-medium text-muted">
          <span>Luminosidad</span>
          <span className="font-mono tabular-nums text-ink">
            {draftLightness.toFixed(2)} · Δ{formatDelta(lightnessDelta)}
          </span>
        </span>
        <input
          type="range"
          min="0.05"
          max="0.98"
          step="0.01"
          value={draftLightness}
          onChange={(event) => updateLightness(Number(event.target.value))}
          className="h-9 w-full cursor-pointer accent-forest"
        />
      </label>

      <label className="block">
        <span className="mb-1 flex items-center justify-between gap-2 text-tools-meta-scale font-medium text-muted">
          <span>Chroma</span>
          <span className="font-mono tabular-nums text-ink">
            {draftChroma.toFixed(3)} · Δ{formatDelta(chromaDelta, 3)}
          </span>
        </span>
        <input
          type="range"
          min="0"
          max="0.34"
          step="0.005"
          value={draftChroma}
          onChange={(event) => updateChroma(Number(event.target.value))}
          className="h-9 w-full cursor-pointer accent-forest"
        />
      </label>

      <div className="flex flex-wrap items-center justify-between gap-2 text-tools-meta-scale">
        {contrast ? (
          <>
            <span className="text-muted">Contraste</span>
            <span className={`font-mono font-semibold tabular-nums ${passes ? 'text-pass' : 'text-fail'}`}>
              {contrast.ratio.toFixed(1)}:1 {passes ? '✓' : '⚠'}
            </span>
          </>
        ) : null}
        {candidateHex ? (
          <p className="w-full text-primary" role="status" aria-live="polite">
            Preview en la paleta · aplica para guardar
          </p>
        ) : null}
        {applied ? (
          <p className="w-full text-pass" role="status" aria-live="polite">
            Variante aplicada.
          </p>
        ) : null}
        {!passes ? (
          <p className="w-full leading-relaxed text-fail">
            Esta variante no alcanza AA. No se aplicará sin tu confirmación explícita.
          </p>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-2 pt-0.5">
        <button
          type="button"
          disabled={atOriginal}
          onClick={() => onApply(originalHex)}
          className="min-h-11 rounded-md border border-border bg-bg px-2 text-tools-body-sm font-semibold text-ink hover:bg-surface-raised disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
        >
          Revertir al original
        </button>
        <button
          type="button"
          disabled={unchanged}
          onClick={() => onApply(draftHex)}
          className={`min-h-11 rounded-md px-2 text-tools-body-sm font-semibold focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 ${
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

function formatDelta(value: number, decimals = 2): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}`;
}
