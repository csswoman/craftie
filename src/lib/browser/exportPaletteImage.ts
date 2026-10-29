import {
  computeShareCardLayout,
  swatchLabelAnchor,
} from '@lib/export/shareCardLayout';
import type { RolePalette } from '@lib/color/roleTypes';

export type ExportPaletteImageResult = { ok: true } | { ok: false; error: string };

export type ExportPaletteImageInput = {
  palette: RolePalette;
  title: string;
  pairing?: { heading: string; body: string } | null;
  filename?: string;
};

const FAILURE_MESSAGE =
  'No se pudo generar la imagen. Comprueba los permisos del navegador.';

/**
 * Renders the role palette plus the active pairing to a PNG share card and
 * triggers a download. All geometry comes from the pure computeShareCardLayout;
 * this adapter only paints and downloads. Quiet Gallery look: paper background,
 * ink text, flat swatches, no gradients.
 */
export function exportPaletteImage({
  palette,
  title,
  pairing,
  filename = 'craftie-paleta.png',
}: ExportPaletteImageInput): Promise<ExportPaletteImageResult> {
  return new Promise((resolve) => {
    try {
      const layout = computeShareCardLayout({ palette, title, pairing });

      const canvas = document.createElement('canvas');
      canvas.width = layout.width;
      canvas.height = layout.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve({ ok: false, error: FAILURE_MESSAGE });
        return;
      }

      ctx.fillStyle = layout.background;
      ctx.fillRect(0, 0, layout.width, layout.height);

      for (const swatch of layout.swatches) {
        ctx.fillStyle = swatch.hex;
        ctx.fillRect(swatch.rect.x, swatch.rect.y, swatch.rect.width, swatch.rect.height);

        const labelAnchor = swatchLabelAnchor(swatch);
        ctx.fillStyle = swatch.labelColor;
        ctx.font = `500 ${labelAnchor.fontSize}px "Nunito", system-ui, sans-serif`;
        ctx.textBaseline = 'alphabetic';
        ctx.fillText(labelAnchor.text, labelAnchor.x, labelAnchor.y);
      }

      ctx.fillStyle = layout.ink;
      ctx.font = `600 ${layout.title.fontSize}px "Lora", Georgia, serif`;
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(layout.title.text, layout.title.x, layout.title.y);

      if (layout.pairing) {
        ctx.fillStyle = layout.ink;
        ctx.font = `400 ${layout.pairing.fontSize}px "Nunito", system-ui, sans-serif`;
        ctx.fillText(layout.pairing.text, layout.pairing.x, layout.pairing.y);
      }

      canvas.toBlob((blob) => {
        if (!blob) {
          resolve({ ok: false, error: FAILURE_MESSAGE });
          return;
        }
        try {
          const url = URL.createObjectURL(blob);
          const anchor = document.createElement('a');
          anchor.href = url;
          anchor.download = filename;
          anchor.click();
          URL.revokeObjectURL(url);
          resolve({ ok: true });
        } catch {
          resolve({ ok: false, error: FAILURE_MESSAGE });
        }
      }, 'image/png');
    } catch {
      resolve({ ok: false, error: FAILURE_MESSAGE });
    }
  });
}
