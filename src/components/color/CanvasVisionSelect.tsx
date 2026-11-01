'use client';

import { Eye } from 'lucide-react';
import { COLOR_VISION_MODES, type ColorVisionMode } from '@lib/color/colorVision';
import type { MessageKey } from '@lib/i18n/translate';

import { useCanvasView } from '@/context/CanvasViewContext';
import { useT } from '@/context/I18nContext';

/** Chooses a view-only color vision simulation for the canvas. */
export function CanvasVisionSelect() {
  const t = useT();
  const { visionMode, setVisionMode } = useCanvasView();
  const active = visionMode !== 'none';

  return (
    <label
      className={`relative inline-flex h-11 shrink-0 items-center gap-1.5 rounded-lg border px-2.5 text-chrome-label font-semibold transition-colors focus-within:ring-[3px] focus-within:ring-primary/25 ${
        active
          ? 'border-[var(--chrome-green)] bg-[var(--chrome-green-soft)] text-[var(--chrome-green)]'
          : 'border-line bg-transparent text-ink hover:bg-surface-raised'
      }`}
      title={t('vision.title')}
    >
      <Eye className="size-4 shrink-0" aria-hidden="true" strokeWidth={1.8} />
      <span className="sr-only">{t('vision.label')}</span>
      <select
        value={visionMode}
        onChange={(event) => setVisionMode(event.target.value as ColorVisionMode)}
        className="max-w-[9.5rem] cursor-pointer appearance-none bg-transparent pr-1 text-chrome-label font-semibold focus-visible:outline-none"
      >
        {COLOR_VISION_MODES.map((mode) => (
          <option key={mode} value={mode} title={mode === 'none' ? undefined : t(`vision.${mode}Desc` as MessageKey)}>
            {mode === 'none' ? t('vision.noneShort') : t(`vision.${mode}` as MessageKey)}
          </option>
        ))}
      </select>
    </label>
  );
}
