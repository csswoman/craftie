'use client';

import { useMemo, useState } from 'react';

import {
  CONTRAST_SAMPLE_TEXT,
  getContrastStatus,
  suggestAccessibleForeground,
  type ContrastResult,
  type ContrastTarget,
  type Palette,
} from '@lib/color/contrast';
import { copyHexToClipboard } from '@lib/color/paletteOrder';

import { ContrastBadge } from './ContrastBadge';
import { ContrastSuggestionPanel } from './ContrastSuggestionPanel';

const PAIR_LABELS: Record<ContrastResult['pairRole'], string> = {
  'on-surface/surface': 'Texto sobre superficie',
  'primary/surface': 'Primario sobre superficie',
  'primary/neutral-light': 'Primario sobre neutro',
  'accent/surface': 'Acento sobre superficie',
  'accent/neutral-dark': 'Acento sobre neutro oscuro',
};

interface ContrastRowProps {
  result: ContrastResult;
  target: ContrastTarget;
  compact?: boolean;
  onApplyForeground?: (role: keyof Palette, hex: string) => void;
}

export function ContrastRow({
  result,
  target,
  compact = false,
  onApplyForeground,
}: ContrastRowProps) {
  const status = getContrastStatus(result, target);
  const needsSuggestion = status !== 'pass';
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [copied, setCopied] = useState(false);

  const suggestion = useMemo(() => {
    if (!showSuggestion) {
      return null;
    }

    return suggestAccessibleForeground(
      result.foreground.hex,
      result.background.hex,
      target,
    );
  }, [showSuggestion, result.foreground.hex, result.background.hex, target]);

  async function handleCopy(hex: string) {
    const success = await copyHexToClipboard(hex);

    if (success) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    }
  }

  const suggestionPanel = needsSuggestion ? (
    <ContrastSuggestionPanel
      showSuggestion={showSuggestion}
      suggestion={suggestion}
      backgroundHex={result.background.hex}
      copied={copied}
      canApply={Boolean(onApplyForeground)}
      onSuggest={() => setShowSuggestion(true)}
      onCopy={() => void handleCopy(suggestion?.hex ?? '')}
      onApply={(hex) => {
        onApplyForeground?.(result.foreground.role, hex);
        setShowSuggestion(false);
      }}
      className={compact ? 'mt-3' : 'mt-3'}
    />
  ) : null;

  if (compact) {
    return (
      <li>
        <div className="flex items-start gap-3.5 rounded-md px-0.5 py-2.5">
          <PairSwatch
            foreground={result.foreground.hex}
            background={result.background.hex}
            compact
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <p className="text-[0.9375rem] font-semibold leading-snug text-ink">
                {PAIR_LABELS[result.pairRole]}
              </p>
              <ContrastBadge
                ratio={result.ratio}
                level={result.normalText}
                status={status}
                target={target}
                compact
              />
            </div>
            <p
              className="mt-2 rounded-lg px-3 py-2 text-[0.875rem] leading-relaxed"
              style={{
                color: result.foreground.hex,
                backgroundColor: result.background.hex,
              }}
            >
              {CONTRAST_SAMPLE_TEXT}
            </p>
            {suggestionPanel}
          </div>
        </div>
      </li>
    );
  }

  return (
    <li className="rounded-md border border-border bg-surface p-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-[0.8125rem] font-medium text-muted">{PAIR_LABELS[result.pairRole]}</p>

          <div className="mt-3 flex items-center gap-2">
            <Swatch color={result.foreground.hex} label="Primer plano" />
            <span className="text-muted" aria-hidden="true">
              /
            </span>
            <Swatch color={result.background.hex} label="Fondo" />
          </div>

          <p
            className="mt-3 max-w-prose rounded-md px-3 py-2 text-[0.9375rem] leading-relaxed"
            style={{
              color: result.foreground.hex,
              backgroundColor: result.background.hex,
            }}
          >
            {CONTRAST_SAMPLE_TEXT}
          </p>

          {suggestionPanel}
        </div>

        <ContrastBadge
          ratio={result.ratio}
          level={result.normalText}
          status={status}
          target={target}
        />
      </div>
    </li>
  );
}

function PairSwatch({
  foreground,
  background,
  compact = false,
}: {
  foreground: string;
  background: string;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <div
        className="flex shrink-0 flex-col gap-1.5"
        role="img"
        aria-label={`Texto ${foreground}, fondo ${background}`}
      >
        <div className="flex gap-1.5">
          <span
            className="size-12 rounded-lg ring-1 ring-inset ring-ink/10 dark:ring-white/15"
            style={{ backgroundColor: foreground }}
            title="Texto"
          />
          <span
            className="size-12 rounded-lg ring-1 ring-inset ring-ink/10 dark:ring-white/15"
            style={{ backgroundColor: background }}
            title="Fondo"
          />
        </div>
        <div className="flex justify-between px-0.5 text-chrome-caption font-medium text-muted">
          <span>Texto</span>
          <span>Fondo</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative size-7 shrink-0" aria-hidden="true">
      <span
        className="absolute bottom-0 right-0 size-4 rounded-sm border border-border/80"
        style={{ backgroundColor: background }}
      />
      <span
        className="absolute left-0 top-0 size-4 rounded-sm border border-border/80"
        style={{ backgroundColor: foreground }}
      />
    </div>
  );
}

function Swatch({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="h-10 w-10 shrink-0 rounded-md border border-border"
        style={{ backgroundColor: color }}
        aria-hidden="true"
      />
      <span className="text-chrome-caption font-medium text-muted">{label}</span>
    </div>
  );
}
