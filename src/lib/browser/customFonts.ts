import {
  type CustomFont,
  parseCustomFontsSession,
} from '@lib/typography/customFonts';
import {
  buildSingleFamilyGoogleFontsUrl,
  getGoogleFontsLinkId,
} from '@lib/typography/googleFonts';

const SESSION_KEY = 'craftie:custom-fonts';
const LOAD_TIMEOUT_MS = 8_000;

const LOCAL_FONT_EXTENSIONS = new Set(['.woff2', '.woff', '.ttf', '.otf']);

export function readCustomFontsSession(): CustomFont[] {
  try {
    return parseCustomFontsSession(window.sessionStorage.getItem(SESSION_KEY));
  } catch {
    return [];
  }
}

export function writeCustomFontsSession(fonts: CustomFont[]): void {
  try {
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(fonts));
  } catch {
    // Best-effort only.
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error(message)), ms);
    promise.then(
      (value) => {
        window.clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        window.clearTimeout(timer);
        reject(error instanceof Error ? error : new Error(message));
      },
    );
  });
}

function injectStylesheet(url: string): HTMLLinkElement {
  const linkId = getGoogleFontsLinkId(url);
  const existing = document.getElementById(linkId);

  if (existing instanceof HTMLLinkElement && existing.href === url) {
    return existing;
  }

  if (existing) {
    existing.remove();
  }

  const link = document.createElement('link');
  link.id = linkId;
  link.rel = 'stylesheet';
  link.href = url;
  document.head.appendChild(link);
  return link;
}

function waitForLinkLoad(link: HTMLLinkElement): Promise<void> {
  if (link.sheet) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    link.addEventListener('load', () => resolve(), { once: true });
    link.addEventListener(
      'error',
      () => reject(new Error('No se pudo cargar la hoja de estilos de Google Fonts.')),
      { once: true },
    );
  });
}

/**
 * Injects Google Fonts CSS for one family and verifies it becomes available.
 */
export async function loadGoogleFontFamily(family: string): Promise<void> {
  const url = buildSingleFamilyGoogleFontsUrl(family);
  if (url === '') {
    throw new Error('Indica el nombre de la familia.');
  }

  const link = injectStylesheet(url);
  await withTimeout(
    waitForLinkLoad(link),
    LOAD_TIMEOUT_MS,
    'Tiempo de espera al cargar Google Fonts.',
  );

  const faces = await withTimeout(
    document.fonts.load(`400 16px "${family}"`),
    LOAD_TIMEOUT_MS,
    `No se encontró la familia “${family}” en Google Fonts.`,
  );

  if (faces.length === 0 && !document.fonts.check(`400 16px "${family}"`)) {
    throw new Error(`No se encontró la familia “${family}” en Google Fonts.`);
  }
}

export function assertLocalFontFile(file: File): void {
  const name = file.name.toLowerCase();
  const ok = [...LOCAL_FONT_EXTENSIONS].some((ext) => name.endsWith(ext));
  if (!ok) {
    throw new Error('Usa un archivo .woff2, .woff, .ttf u .otf.');
  }
}

/**
 * Registers a local font file with FontFace under the given family name.
 */
export async function loadLocalFontFile(file: File, family: string): Promise<void> {
  assertLocalFontFile(file);
  const trimmed = family.trim();
  if (trimmed === '') {
    throw new Error('Indica un nombre de familia para el archivo local.');
  }

  const buffer = await file.arrayBuffer();
  const face = new FontFace(trimmed, buffer);
  await withTimeout(
    face.load().then(() => undefined),
    LOAD_TIMEOUT_MS,
    `No se pudo registrar la fuente “${trimmed}”.`,
  );
  document.fonts.add(face);
}

/** Rehydrate Google custom fonts from session (local binaries do not survive reload). */
export async function restoreGoogleCustomFonts(fonts: CustomFont[]): Promise<CustomFont[]> {
  const googleFonts = fonts.filter((entry) => entry.source === 'google');
  const available: CustomFont[] = [];

  for (const entry of googleFonts) {
    try {
      await loadGoogleFontFamily(entry.family);
      available.push(entry);
    } catch {
      // Drop unavailable session entries.
    }
  }

  return available;
}
