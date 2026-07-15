import { converter } from 'culori';

const toRgb = converter('rgb');
const APCA_BODY_TEXT_MIN = 60;

function luminance(hex: string): number {
  const rgb = toRgb(hex);

  if (!rgb) {
    return 0;
  }

  const red = Math.max(0, Math.min(1, rgb.r)) ** 2.4;
  const green = Math.max(0, Math.min(1, rgb.g)) ** 2.4;
  const blue = Math.max(0, Math.min(1, rgb.b)) ** 2.4;
  const value = red * 0.2126729 + green * 0.7151522 + blue * 0.072175;

  return value < 0.022 ? value + (0.022 - value) ** 1.414 : value;
}

/** Approximate APCA Lc polarity: positive is dark text on light, negative the reverse. */
export function apcaContrast(textHex: string, backgroundHex: string): number {
  const text = luminance(textHex);
  const background = luminance(backgroundHex);

  if (Math.abs(background - text) < 0.0005) {
    return 0;
  }

  if (background > text) {
    const sapc = (background ** 0.56 - text ** 0.57) * 1.14;
    return sapc < 0.1 ? 0 : (sapc - 0.027) * 100;
  }

  const sapc = (background ** 0.65 - text ** 0.62) * 1.14;
  return sapc > -0.1 ? 0 : (sapc + 0.027) * 100;
}

export function passesApcaBodyText(textHex: string, backgroundHex: string): boolean {
  return Math.abs(apcaContrast(textHex, backgroundHex)) >= APCA_BODY_TEXT_MIN;
}
