'use client';

import { useId, useState } from 'react';
import { apcaContrast } from '@lib/color/apca';
import { evaluateContrast, type WCAGLevel } from '@lib/color/contrast';
import { isValidOpaqueHex, normalizeHex } from '@lib/color/normalizeHex';

import { ContrastFailureAdvice } from '@/components/color/ContrastFailureAdvice';
import { useT, useTx } from '@/context/I18nContext';

const LEVEL_LABEL: Record<WCAGLevel, string> = { fail: 'No cumple', AA: 'AA', AAA: 'AAA' };

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
}) {
  const tx = useTx();
  const t = useT();
  const id = useId();
  const valid = isValidOpaqueHex(value);

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-ink">{tx(label)}</label>
      <div className="mt-2 flex items-center gap-2">
        <input
          type="color"
          aria-label={t('ui.ContrastChecker.selector-de-color', { label: tx(label) })}
          value={valid ? normalizeHex(value).toLowerCase() : '#000000'}
          onChange={(event) => onChange(event.target.value.toUpperCase())}
          className="size-11 shrink-0 cursor-pointer rounded-lg border border-border bg-bg p-1"
        />
        <input
          id={id}
          type="text"
          value={value}
          spellCheck={false}
          autoComplete="off"
          aria-invalid={!valid}
          onChange={(event) => onChange(event.target.value)}
          className="min-h-11 min-w-0 flex-1 rounded-lg border border-border bg-bg px-3 font-mono text-base text-ink focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
        />
      </div>
      {!valid ? <p role="alert" className="mt-1 text-sm font-medium text-fail">{t('ui.ContrastChecker.escribe-un-hex-valido-por')}</p> : null}
    </div>
  );
}

function ResultRow({ label, level }: { label: string; level: WCAGLevel }) {
  const tx = useTx();
  const pass = level !== 'fail';
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border py-2.5 last:border-b-0">
      <dt className="text-sm text-muted">{tx(label)}</dt>
      <dd className={`text-sm font-bold ${pass ? 'text-pass' : 'text-fail'}`}>
        <span aria-hidden="true">{tx(pass ? '✓ ' : '✕ ')}</span>
        {tx(LEVEL_LABEL[level])}
      </dd>
    </div>
  );
}

export function ContrastChecker() {
  const t = useT();
  const [foreground, setForeground] = useState('#1A2420');
  const [background, setBackground] = useState('#F4F1EA');

  const valid = isValidOpaqueHex(foreground) && isValidOpaqueHex(background);
  const fg = valid ? normalizeHex(foreground) : '#000000';
  const bg = valid ? normalizeHex(background) : '#FFFFFF';
  const evaluation = evaluateContrast(fg, bg);
  const lc = Math.round(Math.abs(apcaContrast(fg, bg)));

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-5">
        <ColorField label={t('ui.ContrastChecker.color-del-texto')} value={foreground} onChange={setForeground} />
        <ColorField label={t('ui.ContrastChecker.color-de-fondo')} value={background} onChange={setBackground} />
        <button
          type="button"
          onClick={() => {
            setForeground(background);
            setBackground(foreground);
          }}
          className="min-h-11 rounded-lg border border-border px-4 text-sm font-semibold text-ink transition-colors hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
        >{t('ui.ContrastChecker.intercambiar-colores')}</button>

        {valid && evaluation.normalText === 'fail' ? (
          <ContrastFailureAdvice
            foregroundHex={fg}
            backgroundHex={bg}
            editableSide="foreground"
            onApply={(hex) => setForeground(hex.toUpperCase())}
          />
        ) : null}
      </div>

      <div className="space-y-5">
        <div
          className="rounded-xl border border-border p-6"
          style={{ color: fg, backgroundColor: bg }}
        >
          <p className="text-3xl font-semibold leading-tight">{t('ui.ContrastChecker.texto-grande')}</p>
          <p className="mt-3 text-base leading-relaxed">{t('ui.ContrastChecker.este-es-un-parrafo-de')}</p>
        </div>

        <div role="status" aria-live="polite">
          <p className="font-display text-5xl font-medium">{evaluation.ratio.toFixed(2)}:1</p>
          <p className="mt-1 text-sm text-muted">{t('ui.ContrastChecker.ratio-de-contraste-wcag-2', { lc })}</p>
        </div>

        <dl className="rounded-xl border border-border px-4">
          <ResultRow label={t('ui.ContrastChecker.texto-normal-4-5-1')} level={evaluation.normalText} />
          <ResultRow label={t('ui.ContrastChecker.texto-grande-3-1-para')} level={evaluation.largeText} />
        </dl>
      </div>
    </div>
  );
}
