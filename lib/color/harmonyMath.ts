export function hueDistance(a: number, b: number): number {
  const diff = Math.abs(a - b) % 360;
  return diff > 180 ? 360 - diff : diff;
}

export function circularMeanHue(hues: number[]): number {
  let sinSum = 0;
  let cosSum = 0;

  for (const hue of hues) {
    const radians = (hue * Math.PI) / 180;
    sinSum += Math.sin(radians);
    cosSum += Math.cos(radians);
  }

  const meanRadians = Math.atan2(sinSum, cosSum);
  const degrees = (meanRadians * 180) / Math.PI;
  return degrees < 0 ? degrees + 360 : degrees;
}

export function maxHueSpread(hues: number[]): number {
  if (hues.length <= 1) {
    return 0;
  }

  let maxSpread = 0;

  for (let index = 0; index < hues.length; index += 1) {
    for (let inner = index + 1; inner < hues.length; inner += 1) {
      maxSpread = Math.max(maxSpread, hueDistance(hues[index]!, hues[inner]!));
    }
  }

  return maxSpread;
}

function median(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1]! + sorted[middle]!) / 2;
  }

  return sorted[middle]!;
}

function medianAbsoluteDeviation(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  const med = median(values);
  return median(values.map((value) => Math.abs(value - med)));
}

export function isRobustOutlier(
  value: number,
  values: number[],
  threshold: number,
): boolean {
  const spread = medianAbsoluteDeviation(values);
  const cutoff = Math.max(threshold, spread * 2.5);
  return Math.abs(value - median(values)) > cutoff;
}
