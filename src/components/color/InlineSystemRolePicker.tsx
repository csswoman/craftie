'use client';

import { useMemo, useState } from 'react';

import type { ColorUse } from '@lib/color/colorFitness';
import { buildExpressiveCandidates } from '@lib/color/uiColorCandidates';
import { EXPRESSIVE_TOKEN_NAMES } from '@lib/color/uiExpressiveGaps';
import type { SelectableColor } from '@lib/color/selectableColors';
import type { SemanticTokenName, SemanticTokens } from '@lib/color/semanticTokens';

import { InlineTokenDerivationEditor } from './InlineTokenDerivationEditor';
import { ColorCandidateList } from './ColorCandidateList';

export function InlineSystemRolePicker({
  tokenName,
  currentHex,
  tokens,
  colors,
  neutralSteps,
  unassigned,
  roleLabel,
  relevantUse,
  onSelect,
  onDeriveFromPrimary,
  onContinueWithout,
}: {
  tokenName: SemanticTokenName;
  currentHex: string;
  tokens: SemanticTokens;
  colors: SelectableColor[];
  neutralSteps: Array<{ lightness: number; hex: string }>;
  unassigned: boolean;
  roleLabel: string;
  relevantUse: Exclude<ColorUse, 'data'>;
  onSelect: (hex: string) => void;
  onDeriveFromPrimary: () => void;
  onContinueWithout: () => void;
}) {
  const [deriving, setDeriving] = useState(false);
  const [derivationBase, setDerivationBase] = useState(currentHex);
  const expressiveCandidates = useMemo(() => buildExpressiveCandidates(colors, tokens), [colors, tokens]);

  function startDerivation() {
    setDerivationBase(currentHex);
    setDeriving((value) => !value);
  }

  const expressive = EXPRESSIVE_TOKEN_NAMES.includes(tokenName as typeof EXPRESSIVE_TOKEN_NAMES[number]);

  if (expressive) {
    return (
      <div className="space-y-3 bg-surface px-3 pb-3 pt-2">
        <h3 className="text-tools-name font-semibold text-ink">Elegir {roleLabel}</h3>
        {unassigned ? <p className="text-tools-meta leading-relaxed text-muted">
          Craftie no encontró un candidato fuente con suficiente carácter. Los neutrales no pueden ocupar este rol.
        </p> : null}
        {unassigned ? (
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onContinueWithout}
              className="min-h-10 rounded-md border border-border bg-bg px-2 text-tools-meta font-semibold text-ink hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
            >
              Dejar sin asignar
            </button>
            <button
              type="button"
              onClick={onDeriveFromPrimary}
              className="min-h-10 rounded-md bg-[var(--chrome-green)] px-2 text-tools-meta font-semibold text-white hover:brightness-95 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
            >
              Derivar del primario
            </button>
          </div>
        ) : null}
        <ColorCandidateList
          candidates={expressiveCandidates}
          activeUse={relevantUse}
          actionLabel={`Usar como ${roleLabel.toLocaleLowerCase('es')}`}
          onSelect={(candidate) => onSelect(candidate.hex)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-3 bg-surface px-3 pb-3 pt-2">
      <h3 className="text-tools-name font-semibold text-ink">Elegir {roleLabel}</h3>
      <DotGroup
        label="Colores fuente"
        items={colors.map((color) => ({ hex: color.hex, label: color.name || color.hex }))}
        currentHex={currentHex}
        onSelect={onSelect}
      />
      <DotGroup
        label="Neutrales teñidos"
        items={neutralSteps.map((step) => ({ hex: step.hex, label: `L ${step.lightness.toFixed(2)}` }))}
        currentHex={currentHex}
        onSelect={onSelect}
      />
      <button
        type="button"
        aria-expanded={deriving}
        onClick={startDerivation}
        className="min-h-10 w-full rounded-md border border-dashed border-border bg-bg px-3 text-tools-meta font-semibold text-ink transition-colors hover:border-primary hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
      >
        Derivar variante de este color…
      </button>
      {deriving ? <InlineTokenDerivationEditor tokenName={tokenName} originalHex={derivationBase} /> : null}
    </div>
  );
}

function DotGroup({
  label,
  items,
  currentHex,
  onSelect,
}: {
  label: string;
  items: Array<{ hex: string; label: string }>;
  currentHex: string;
  onSelect: (hex: string) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-tools-meta font-medium text-muted">{label}</p>
      <div className="flex flex-wrap gap-2">
        {items.map((item, index) => {
          const selected = item.hex.toUpperCase() === currentHex.toUpperCase();
          return (
            <button
              key={`${item.hex}-${index}`}
              type="button"
              aria-label={`Elegir ${item.label}, ${item.hex}`}
              aria-pressed={selected}
              title={`${item.label} · ${item.hex.toUpperCase()}`}
              onClick={() => onSelect(item.hex)}
              className={`size-[26px] rounded-md ring-offset-2 ring-offset-surface focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 ${selected ? 'ring-2 ring-primary' : 'ring-1 ring-inset ring-ink/10'}`}
              style={{ backgroundColor: item.hex }}
            />
          );
        })}
      </div>
    </div>
  );
}
