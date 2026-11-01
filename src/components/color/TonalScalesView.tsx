'use client';

import { useState } from 'react';
import { pickReadableTextColor } from '@lib/color/readableText';
import type { ExpressiveScaleBase, SemanticTokenName } from '@lib/color/semanticTokens';
import { TONAL_SCALE_STEPS, type TonalScaleStep } from '@lib/color/tonalScale';
import { findOutOfOrderSteps, stepContrast, type TonalScaleRow } from '@lib/color/tonalScaleEdit';

import { useRolePalette } from '@/context/RolePaletteContext';

import { TonalStepEditor } from './TonalStepEditor';
import { useT, useTx } from '@/context/I18nContext';

const BASES: ReadonlyArray<{ id: ExpressiveScaleBase; label: string }> = [
  { id: 'primary', label: 'Primario' },
  { id: 'secondary', label: 'Secundario' },
  { id: 'accent', label: 'Acento' },
];

type Selection = { base: ExpressiveScaleBase; step: TonalScaleStep } | null;

/** Editable 50–900 ramps for the three expressive colors. Edits become token overrides and are exported. */
export function TonalScalesView() {
  const tx = useTx();
  const t = useT();
  const { semanticTokens, replaceSemanticToken, clearSemanticToken, activeTheme } = useRolePalette();
  const [selection, setSelection] = useState<Selection>(null);

  if (!semanticTokens) return null;
  const surfaceHex = semanticTokens.background.hex;

  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <h2 className="font-display text-[1.375rem] font-medium text-ink">{t('ui.TonalScalesView.escalas-de-tonos')}</h2>
        <p className="mt-1 max-w-[65ch] text-chrome-label text-muted">{t('ui.TonalScalesView.cada-color-de-marca-tiene')}
          {tx(activeTheme === 'light' ? 'claro' : 'oscuro')}{t('ui.TonalScalesView.se-exportan-como')}{' '}<code className="font-mono">{t('ui.TonalScalesView.primary-500')}</code>,{' '}
          <code className="font-mono">{t('ui.TonalScalesView.accent-200')}</code>{' '}{t('ui.TonalScalesView.y-asi-sucesivamente')}</p>

        <div className="mt-6 space-y-8">
          {BASES.map((base) => {
            const names = TONAL_SCALE_STEPS.map((step) => `${base.id}-${step}` as SemanticTokenName);
            const row = Object.fromEntries(
              TONAL_SCALE_STEPS.map((step, index) => [step, semanticTokens[names[index]!].hex]),
            ) as TonalScaleRow;
            const outOfOrder = findOutOfOrderSteps(row);
            const selected = selection?.base === base.id ? selection.step : null;

            return (
              <section key={base.id} aria-label={t('ui.TonalScalesView.escala', { label: tx(base.label) })}>
                <h3 className="text-chrome-label font-semibold text-ink">{tx(base.label)}</h3>
                <ul className="mt-2 grid grid-cols-5 gap-1.5 sm:grid-cols-10">
                  {TONAL_SCALE_STEPS.map((step, index) => {
                    const hex = row[step];
                    const token = semanticTokens[names[index]!];
                    const contrast = stepContrast(hex, surfaceHex);
                    const isSelected = selected === step;
                    return (
                      <li key={step}>
                        <button
                          type="button"
                          aria-pressed={isSelected}
                          aria-label={t('ui.TonalScalesView.a-1-sobre-el-fondo', { label: tx(base.label), step, hex, value: contrast.ratio.toFixed(1), value2: token.source === 'override' ? ', ajustado' : '' })}
                          onClick={() => setSelection(isSelected ? null : { base: base.id, step })}
                          className={`flex h-20 w-full flex-col items-start justify-between rounded-lg border p-1.5 text-left focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/40 ${
                            isSelected ? 'border-ink ring-2 ring-ink' : 'border-border'
                          }`}
                          style={{ backgroundColor: hex, color: pickReadableTextColor(hex) }}
                        >
                          <span className="text-chrome-caption font-bold">
                            {step}
                            {tx(token.source === 'override' ? ' •' : '')}
                          </span>
                          <span className="font-mono text-[0.625rem] font-semibold">{hex.toUpperCase()}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
                {outOfOrder.length > 0 ? (
                  <p role="status" className="mt-2 text-chrome-caption font-medium text-fail">{t('ui.TonalScalesView.los-pasos-no-son-mas', { value: outOfOrder.join(', ') })}</p>
                ) : null}
                {selected !== null ? (
                  <TonalStepEditor
                    label={`${tx(base.label)} ${selected}`}
                    hex={row[selected]}
                    surfaceHex={surfaceHex}
                    adjusted={semanticTokens[`${base.id}-${selected}` as SemanticTokenName].source === 'override'}
                    onCommit={(hex) => replaceSemanticToken(`${base.id}-${selected}` as SemanticTokenName, hex)}
                    onReset={() => clearSemanticToken(`${base.id}-${selected}` as SemanticTokenName)}
                    onClose={() => setSelection(null)}
                  />
                ) : null}
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
