'use client';

import { useEffect, useMemo, useState } from 'react';

import {
  findDistinctPoint,
  locateColorsInRaster,
  sampleRasterColor,
  type ImagePoint,
} from '@lib/color/imagePicking';
import type { ExtractedColor, RasterData } from '@lib/color/imageTypes';

import { loadPickerRaster } from '@/lib/browser/imagePickerRaster';

type RasterState = { src: string; raster: RasterData | null; failed: boolean };
type ManualPoints = { signature: string; raster: RasterData; points: ImagePoint[] };

function signatureOf(colors: readonly ExtractedColor[]): string {
  return colors.map((color) => color.hex).join();
}

/**
 * Pixels of the source image and one marker point per source color. Points
 * start where each color sits in the image; once the user moves a marker the
 * picked points are kept until the colors change from elsewhere (regenerate,
 * a new image, undo).
 */
export function useImagePickerPoints(previewUrl: string, colors: readonly ExtractedColor[]) {
  const [rasterState, setRasterState] = useState<RasterState>({ src: '', raster: null, failed: false });
  const [manual, setManual] = useState<ManualPoints | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadPickerRaster(previewUrl)
      .then((raster) => !cancelled && setRasterState({ src: previewUrl, raster, failed: false }))
      .catch(() => !cancelled && setRasterState({ src: previewUrl, raster: null, failed: true }));
    return () => {
      cancelled = true;
    };
  }, [previewUrl]);

  const raster = rasterState.src === previewUrl ? rasterState.raster : null;
  const failed = rasterState.src === previewUrl && rasterState.failed;
  const signature = signatureOf(colors);

  const located = useMemo(
    () => (raster ? locateColorsInRaster(raster, signature === '' ? [] : signature.split(',')) : []),
    [raster, signature],
  );

  const points = manual && manual.raster === raster && manual.signature === signature ? manual.points : located;

  /** Records where the user put the markers for the colors they are about to commit. */
  function keepPoints(nextColors: readonly ExtractedColor[], nextPoints: ImagePoint[]) {
    if (raster) {
      setManual({ signature: signatureOf(nextColors), raster, points: nextPoints });
    }
  }

  function sample(point: ImagePoint): string | null {
    return raster ? sampleRasterColor(raster, point) : null;
  }

  function distinctPoint(): ImagePoint | null {
    return raster ? findDistinctPoint(raster, colors.map((color) => color.hex)) : null;
  }

  return {
    aspect: raster ? raster.width / raster.height : null,
    failed,
    ready: raster !== null,
    points,
    keepPoints,
    sample,
    distinctPoint,
  };
}
