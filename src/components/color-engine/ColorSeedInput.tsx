'use client';

import { useId } from 'react';

import { isStrictHex } from '@lib/color/normalizeHex';
import { useT } from '@/context/I18nContext';

interface ColorSeedInputProps {
  index: number;
  value: string;
  canRemove: boolean;
  onChange: (value: string) => void;
  onRemove: () => void;
}

export function ColorSeedInput({
  index,
  value,
  canRemove,
  onChange,
  onRemove,
}: ColorSeedInputProps) {
  const t = useT();
  const inputId = useId();
  const pickerId = useId();
  const showFormatHint = value.trim() !== '' && !isStrictHex(value);
  const pickerValue =
    value.startsWith('#') && value.length >= 7 ? value.slice(0, 7).toUpperCase() : '#2F5644';

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="min-w-[10rem] flex-1">
        <label htmlFor={inputId} className="text-[0.8125rem] font-medium text-ink">{t('ui.ColorSeedInput.semilla', { value: index + 1 })}
        </label>
        <input
          id={inputId}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="#2F5644"
          spellCheck={false}
          aria-invalid={showFormatHint}
          className="mt-1 w-full rounded-md border border-border bg-surface-raised px-3 py-2.5 font-mono text-[0.9375rem] text-ink uppercase placeholder:normal-case placeholder:text-muted focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary/25"
        />
        {showFormatHint ? (
          <p className="mt-1 text-[0.8125rem] text-fail">{t('ui.ColorSeedInput.usa-el-formato-rrggbb')}</p>
        ) : null}
      </div>

      <div>
        <label htmlFor={pickerId} className="text-[0.8125rem] font-medium text-ink">{t('ui.ColorSeedInput.muestra')}</label>
        <input
          id={pickerId}
          type="color"
          value={pickerValue}
          onChange={(event) => onChange(event.target.value.toUpperCase())}
          className="mt-1 block h-[42px] w-14 cursor-pointer rounded-md border border-border bg-surface-raised p-1"
          aria-label={t('ui.ColorSeedInput.selector-de-color-para-semilla', { value: index + 1 })}
        />
      </div>

      <button
        type="button"
        onClick={onRemove}
        disabled={!canRemove}
        className="rounded-md px-3 py-2.5 text-[0.8125rem] font-medium text-muted transition-colors hover:bg-surface-raised hover:text-ink focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label={t('ui.ColorSeedInput.quitar-semilla', { value: index + 1 })}
      >{t('ui.ColorSeedInput.quitar')}</button>
    </div>
  );
}
