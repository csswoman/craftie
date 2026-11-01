'use client';

import { useEffect, useId, useState } from 'react';
import { pickReadableTextColor } from '@lib/color/readableText';
import type { ExtractedColor } from '@lib/color/imageExtractor';

import { extractPaletteColorsFromImage } from '@/lib/browser/imageExtractor';
import { copyTextToClipboard } from '@/lib/browser/shareUrl';
import { useT, useTx } from '@/context/I18nContext';

export function PaletteFromImage() {
  const tx = useTx();
  const t = useT();
  const inputId = useId();
  const [colors, setColors] = useState<ExtractedColor[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  async function handleFile(file: File) {
    setBusy(true);
    setError(null);
    setCopied(null);
    try {
      const extracted = await extractPaletteColorsFromImage(file);
      setColors(extracted);
      setPreviewUrl(URL.createObjectURL(file));
    } catch (cause) {
      setColors([]);
      setError(cause instanceof Error ? cause.message : tx('No se pudo leer la imagen.'));
    } finally {
      setBusy(false);
    }
  }

  async function copy(hex: string) {
    const ok = await copyTextToClipboard(hex);
    setCopied(ok ? hex : null);
  }

  return (
    <div className="space-y-8">
      <div>
        <label htmlFor={inputId} className="block text-sm font-semibold text-ink">{t('ui.PaletteFromImage.elige-una-imagen-jpg-png')}</label>
        <input
          id={inputId}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          disabled={busy}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void handleFile(file);
          }}
          className="mt-2 block min-h-11 w-full max-w-md cursor-pointer rounded-lg border border-border bg-bg p-2 text-sm text-ink file:mr-3 file:min-h-9 file:cursor-pointer file:rounded-md file:border-0 file:bg-primary file:px-3 file:text-sm file:font-semibold file:text-on-primary"
        />
        <p className="mt-2 text-sm text-muted">{t('ui.PaletteFromImage.la-imagen-se-procesa-en')}</p>
        {busy ? <p role="status" className="mt-2 text-sm text-muted">{t('ui.PaletteFromImage.extrayendo-colores')}</p> : null}
        {error ? <p role="alert" className="mt-2 text-sm font-medium text-fail">{tx(error)}</p> : null}
      </div>

      {colors.length > 0 ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]">
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- Local object URL, not optimizable.
            <img src={previewUrl} alt={t('ui.PaletteFromImage.imagen-seleccionada')} className="max-h-72 w-full rounded-xl border border-border object-cover" />
          ) : null}
          <div>
            <h2 className="font-display text-2xl font-medium">{t('ui.PaletteFromImage.colores-dominantes')}</h2>
            <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {colors.map((color) => (
                <li key={color.hex}>
                  <button
                    type="button"
                    onClick={() => void copy(color.hex)}
                    aria-label={t('ui.PaletteFromImage.copiar', { hex: color.hex })}
                    className="flex h-24 w-full flex-col items-start justify-end rounded-xl border border-border p-3 text-left focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/40"
                    style={{ backgroundColor: color.hex, color: pickReadableTextColor(color.hex) }}
                  >
                    <span className="font-mono text-sm font-semibold">{color.hex.toUpperCase()}</span>
                    <span className="text-xs">{copied === color.hex ? t('ui.PaletteFromImage.copiado') : t('ui.PaletteFromImage.clic-para-copiar')}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  );
}
