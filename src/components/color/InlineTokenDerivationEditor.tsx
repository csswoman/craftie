'use client';

import { useMemo, useState } from 'react';

import { getSemanticTokenContrastInfo } from '@lib/color/semanticTokenTargets';
import type { SemanticTokenName } from '@lib/color/semanticTokens';
import { hexToOklchChannels, oklchChannelsToHex } from '@lib/utils/colorMath';

import { useRolePalette } from '@/context/RolePaletteContext';

export function InlineTokenDerivationEditor({
  tokenName,
  originalHex,
}: {
  tokenName: SemanticTokenName;
  originalHex: string;
}) {
  const { semanticTokens, replaceSemanticToken } = useRolePalette();
  const [acceptedFailure, setAcceptedFailure] = useState(false);
  const token = semanticTokens?.[tokenName];
  const original = useMemo(() => hexToOklchChannels(originalHex), [originalHex]);
  const current = useMemo(() => token ? hexToOklchChannels(token.hex) : null, [token]);
  const contrast = useMemo(
    () => semanticTokens ? getSemanticTokenContrastInfo(semanticTokens, tokenName) : null,
    [semanticTokens, tokenName],
  );

  if (!token || !current) return null;
  const passes = contrast === null || contrast.status === 'pass';

  function updateLightness(lightness: number) {
    replaceSemanticToken(tokenName, oklchChannelsToHex(lightness, original.c, original.h));
    setAcceptedFailure(false);
  }

  return (
    <div className="space-y-3 border-t border-border pt-3">
      <div className="flex items-center gap-2">
        <span className="size-7 rounded-md ring-1 ring-inset ring-ink/10" style={{ backgroundColor: originalHex }} aria-hidden="true" />
        <p className="min-w-0 flex-1 font-sans text-tools-meta text-muted">
          Original <span className="font-mono tabular-nums text-ink">{originalHex.toUpperCase()}</span>
        </p>
        <button
          type="button"
          onClick={() => replaceSemanticToken(tokenName, originalHex)}
          className="min-h-9 rounded-md border border-border bg-bg px-2 text-tools-meta font-semibold text-ink hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
        >
          Revertir
        </button>
      </div>

      <label className="block">
        <span className="mb-1 flex items-center justify-between gap-2 text-tools-meta text-muted">
          <span>Luminosidad</span>
          <span className="font-mono tabular-nums">{current.l.toFixed(2)}</span>
        </span>
        <input
          type="range"
          min="0.05"
          max="0.98"
          step="0.01"
          value={current.l}
          onChange={(event) => updateLightness(Number(event.target.value))}
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-surface-raised accent-primary"
        />
      </label>

      {contrast ? (
        <div className="flex items-center justify-between gap-2 text-tools-meta">
          <span className="text-muted">Contraste en vivo</span>
          <span className={`font-mono font-semibold tabular-nums ${passes ? 'text-pass' : 'text-fail'}`}>
            {contrast.ratio.toFixed(1)}:1 {passes ? '✓' : '⚠'}
          </span>
        </div>
      ) : null}

      {!passes ? (
        <button
          type="button"
          aria-pressed={acceptedFailure}
          onClick={() => setAcceptedFailure((value) => !value)}
          className="min-h-10 w-full rounded-md border border-border bg-bg px-3 text-tools-meta font-semibold text-ink hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
        >
          {acceptedFailure ? '⚠ Fuera de norma · aceptado' : 'Aceptar fuera de norma'}
        </button>
      ) : null}
    </div>
  );
}
