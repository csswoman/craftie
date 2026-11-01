'use client';

import { useEffect, useId, useState } from 'react';
import { hexToOklchChannels } from '@lib/utils/colorMath';
import { isValidOpaqueHex, normalizeHex } from '@lib/color/normalizeHex';
import { stepContrast, withLightnessAndChroma } from '@lib/color/tonalScaleEdit';
import { useT, useTx } from '@/context/I18nContext';

type TonalStepEditorProps = {
  label: string;
  hex: string;
  surfaceHex: string;
  adjusted: boolean;
  onCommit: (hex: string) => void;
  onReset: () => void;
  onClose: () => void;
};

/** Edits one step of a tonal scale. Changes commit on release so undo gets one entry per edit. */
export function TonalStepEditor({ label, hex, surfaceHex, adjusted, onCommit, onReset, onClose }: TonalStepEditorProps) {
  const tx = useTx();
  const t = useT();
  const lightnessId = useId();
  const chromaId = useId();
  const hexId = useId();
  const [draft, setDraft] = useState(hex);
  const [hexText, setHexText] = useState(hex);

  useEffect(() => {
    // Keep the draft in sync when the step changes from outside (reset, undo, theme switch).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraft(hex);
    setHexText(hex);
  }, [hex]);

  const { l, c } = hexToOklchChannels(draft);
  const contrast = stepContrast(draft, surfaceHex);

  function preview(lightness: number, chroma: number) {
    const next = withLightnessAndChroma(draft, lightness, chroma);
    setDraft(next);
    setHexText(next);
  }

  function commit() {
    if (normalizeHex(draft) !== normalizeHex(hex)) onCommit(draft);
  }

  return (
    <section
      aria-label={t('ui.TonalStepEditor.editar', { label: tx(label) })}
      className="mt-3 rounded-xl border border-border bg-surface p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-chrome-label font-semibold text-ink">{tx(label)}</p>
          <p className={`mt-0.5 text-chrome-caption font-medium ${contrast.passesAa ? 'text-pass' : contrast.passesLarge ? 'text-muted' : 'text-fail'}`}>
            {t('ui.TonalStepEditor.1-sobre-el-fondo', { value: contrast.ratio.toFixed(2) })}
            {contrast.passesAa ? t('ui.TonalStepEditor.texto-normal-aa') : contrast.passesLarge ? t('ui.TonalStepEditor.solo-texto-grande') : t('ui.TonalStepEditor.no-apto-para-texto')}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="min-h-11 shrink-0 rounded-lg px-3 text-chrome-label font-semibold text-muted hover:bg-surface-raised hover:text-ink focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
        >{t('ui.TonalStepEditor.cerrar')}</button>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={lightnessId} className="flex justify-between text-chrome-caption font-semibold text-ink">
            <span>{t('ui.TonalStepEditor.luminosidad-l')}</span>
            <span className="font-mono text-muted">{(l * 100).toFixed(0)}</span>
          </label>
          <input
            id={lightnessId}
            type="range"
            min={0}
            max={100}
            step={1}
            value={Math.round(l * 100)}
            onChange={(event) => preview(Number(event.target.value) / 100, c)}
            onPointerUp={commit}
            onKeyUp={commit}
            onBlur={commit}
            className="mt-2 h-11 w-full accent-[var(--color-primary)]"
          />
        </div>
        <div>
          <label htmlFor={chromaId} className="flex justify-between text-chrome-caption font-semibold text-ink">
            <span>{t('ui.TonalStepEditor.intensidad-c')}</span>
            <span className="font-mono text-muted">{c.toFixed(3)}</span>
          </label>
          <input
            id={chromaId}
            type="range"
            min={0}
            max={0.4}
            step={0.005}
            value={Math.min(c, 0.4)}
            onChange={(event) => preview(l, Number(event.target.value))}
            onPointerUp={commit}
            onKeyUp={commit}
            onBlur={commit}
            className="mt-2 h-11 w-full accent-[var(--color-primary)]"
          />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor={hexId} className="block text-chrome-caption font-semibold text-ink">{t('ui.TonalStepEditor.hex')}</label>
          <input
            id={hexId}
            type="text"
            value={hexText}
            spellCheck={false}
            autoComplete="off"
            aria-invalid={!isValidOpaqueHex(hexText)}
            onChange={(event) => {
              setHexText(event.target.value);
              if (isValidOpaqueHex(event.target.value)) setDraft(normalizeHex(event.target.value));
            }}
            onBlur={commit}
            onKeyDown={(event) => {
              if (event.key === 'Enter') commit();
            }}
            className="mt-1 min-h-11 w-32 rounded-lg border border-border bg-bg px-3 font-mono text-chrome-body text-ink focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
          />
        </div>
        {adjusted ? (
          <button
            type="button"
            onClick={onReset}
            className="min-h-11 rounded-lg border border-border px-3 text-chrome-label font-semibold text-ink hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
          >{t('ui.TonalStepEditor.restablecer-paso')}</button>
        ) : null}
      </div>
    </section>
  );
}
