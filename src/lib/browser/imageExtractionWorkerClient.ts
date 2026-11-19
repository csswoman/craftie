import type { ExtractedColor, ImageExtractionOptions } from '@lib/color/imageExtractor';

import type { ExtractionRequest, ExtractionResponse } from './imageExtraction.worker';

/**
 * Lazily starts one extraction worker and matches replies to requests by id.
 * `null` means the browser cannot run the worker path (no Worker,
 * OffscreenCanvas or createImageBitmap), so callers fall back to the main
 * thread. A worker that fails to start is dropped and never retried.
 */

type Pending = { resolve: (colors: ExtractedColor[]) => void; reject: (error: Error) => void };

let worker: Worker | null = null;
let disabled = false;
let nextId = 0;
const pending = new Map<number, Pending>();

export class WorkerUnavailableError extends Error {}

function supportsWorkerExtraction(): boolean {
  return (
    typeof Worker !== 'undefined' &&
    typeof OffscreenCanvas !== 'undefined' &&
    typeof createImageBitmap !== 'undefined'
  );
}

function failAll(error: Error) {
  for (const entry of pending.values()) entry.reject(error);
  pending.clear();
}

function getWorker(): Worker | null {
  if (disabled || !supportsWorkerExtraction()) return null;
  if (worker) return worker;

  try {
    worker = new Worker(new URL('./imageExtraction.worker.ts', import.meta.url), { type: 'module' });
  } catch {
    disabled = true;
    return null;
  }

  worker.onmessage = (event: MessageEvent<ExtractionResponse>) => {
    const reply = event.data;
    const entry = pending.get(reply.id);
    if (!entry) return;
    pending.delete(reply.id);
    if (reply.ok) entry.resolve(reply.colors);
    else entry.reject(new Error(reply.message));
  };
  worker.onerror = () => {
    disabled = true;
    worker?.terminate();
    worker = null;
    failAll(new WorkerUnavailableError('Extraction worker failed.'));
  };

  return worker;
}

/** Runs extraction in the worker; rejects with WorkerUnavailableError when it cannot. */
export function extractInWorker(
  file: Blob,
  options?: ImageExtractionOptions,
): Promise<ExtractedColor[]> {
  const target = getWorker();
  if (!target) return Promise.reject(new WorkerUnavailableError('Extraction worker unavailable.'));

  const id = nextId++;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    target.postMessage({ id, file, options } satisfies ExtractionRequest);
  });
}
