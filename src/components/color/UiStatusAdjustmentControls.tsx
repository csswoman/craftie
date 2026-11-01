'use client';

import { useEffect, useMemo, useState } from 'react';

import { normalizeHex } from '@lib/color/normalizeHex';
import {
  adjustUiStatusColor,
  STATUS_CHROMA_FLOORS,
  type UiStatusColor,
} from '@lib/color/uiStatusColors';
import { hexToOklchChannels, oklchChannelsToHex } from '@lib/utils/colorMath';

import { useRolePalette } from '@/context/RolePaletteContext';
import { useT, useTx } from '@/context/I18nContext';

export function UiStatusAdjustmentControls({
  status,
  currentHex,
  original,
  backgroundHex,
  candidateSelected = false,
  applied = false,
  onApply,
  onDraftChange = () => {},
}: {
  status: UiStatusColor;
  currentHex?: string;
  original: UiStatusColor;
  backgroundHex: string;
  candidateSelected?: boolean;
  applied?: boolean;
  onApply: (status: UiStatusColor) => void;
  onDraftChange?: () => void;
}) {
  const t = useT();
  const { setTokenEditPreview, clearTokenEditPreview } = useRolePalette();
  const currentChannels = useMemo(() => hexToOklchChannels(status.hex), [status.hex]);
  const originalChannels = useMemo(() => hexToOklchChannels(original.hex), [original.hex]);
  const [lightness, setLightness] = useState(currentChannels.l);
  const [chroma, setChroma] = useState(currentChannels.c);
  const draftHex = useMemo(
    () => oklchChannelsToHex(lightness, chroma, currentChannels.h),
    [chroma, currentChannels.h, lightness],
  );
  const preview = useMemo(
    () => adjustUiStatusColor(status, draftHex, backgroundHex),
    [backgroundHex, draftHex, status],
  );
  const savedHex = currentHex ?? status.hex;
  const unchanged = normalizeHex(preview.hex) === normalizeHex(savedHex);
  const atOriginal = normalizeHex(savedHex) === normalizeHex(original.hex);

  useEffect(() => {
    setTokenEditPreview({ kind: 'status', role: status.role, status: preview });
  }, [preview, setTokenEditPreview, status.role]);

  useEffect(() => () => {
    clearTokenEditPreview();
  }, [clearTokenEditPreview]);

  return (
    <div className="space-y-2.5 rounded-lg border border-forest/25 bg-bg p-3">
      <div className="flex items-center gap-2.5">
        <span
          className="size-9 rounded-full ring-1 ring-inset ring-ink/10"
          style={{ backgroundColor: preview.hex }}
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1">
          <p className="text-tools-body-sm font-semibold text-ink">{t('ui.UiStatusAdjustmentControls.ajuste-con-hue-anclado')}</p>
          <p className="font-mono text-tools-meta-scale tabular-nums text-muted">
            {t('ui.UiStatusAdjustmentControls.hue', { value: preview.hex.toUpperCase(), value2: Math.round(preview.resultHue) })}</p>
        </div>
      </div>

      <Slider
        label={t('ui.UiStatusAdjustmentControls.luminosidad')}
        value={lightness}
        min={0.08}
        max={0.92}
        step={0.01}
        valueLabel={`${lightness.toFixed(2)} · Δ${formatDelta(lightness - originalChannels.l)}`}
        onChange={(value) => {
          onDraftChange();
          setLightness(value);
        }}
      />
      <Slider
        label={t('ui.UiStatusAdjustmentControls.chroma')}
        value={chroma}
        min={STATUS_CHROMA_FLOORS[status.role]}
        max={0.32}
        step={0.005}
        valueLabel={`${chroma.toFixed(3)} · piso ${STATUS_CHROMA_FLOORS[status.role].toFixed(2)}`}
        onChange={(value) => {
          onDraftChange();
          setChroma(value);
        }}
      />

      <div className="flex flex-wrap gap-2 text-tools-meta-scale">
        {candidateSelected ? (
          <p className="w-full text-primary" role="status" aria-live="polite">{t('ui.UiStatusAdjustmentControls.preview-en-la-paleta-aplica')}</p>
        ) : null}
        {applied ? (
          <p className="w-full text-pass" role="status" aria-live="polite">{t('ui.UiStatusAdjustmentControls.color-de-estado-aplicado')}</p>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-2 pt-0.5">
        <button
          type="button"
          disabled={atOriginal}
          onClick={() => onApply(original)}
          className="min-h-11 rounded-md border border-line bg-bg px-2 text-tools-body-sm font-semibold text-ink hover:bg-line-soft disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-forest/25"
        >{t('ui.UiStatusAdjustmentControls.revertir-al-original')}</button>
        <button
          type="button"
          disabled={unchanged}
          onClick={() => onApply(preview)}
          className="min-h-11 rounded-md bg-forest px-2 text-tools-body-sm font-semibold text-white hover:bg-forest-deep disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-forest/30"
        >{t('ui.UiStatusAdjustmentControls.aplicar-ajuste')}</button>
      </div>
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  valueLabel,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  valueLabel: string;
  onChange: (value: number) => void;
}) {
  const tx = useTx();
  return (
    <label className="block">
      <span className="mb-1 flex items-center justify-between gap-2 text-tools-meta-scale font-medium text-muted">
        <span>{tx(label)}</span>
        <span className="font-mono tabular-nums text-ink">{tx(valueLabel)}</span>
      </span>
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-9 w-full cursor-pointer accent-forest"
      />
    </label>
  );
}

function formatDelta(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}`;
}
