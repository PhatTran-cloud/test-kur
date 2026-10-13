/**
 * OKLCH Color Interpolation
 *
 * Perceptually uniform color space — prevents muddy midpoints
 * that occur with RGB/HSL interpolation.
 *
 * Uses `culori` library for Oklch parsing and interpolation.
 */

import { interpolate as culoriInterpolate, formatRgb, parse } from "culori";

export type EasingFunction = (t: number) => number;

/**
 * Interpolate between two colors in OKLCH space.
 */
export function interpolateColor(
  from: string,
  to: string,
  progress: number
): string {
  try {
    const clamped = Math.max(0, Math.min(1, progress));
    const fn = culoriInterpolate([from, to], "oklch");
    return formatRgb(fn(clamped));
  } catch {
    // Fallback: return `from` at 0, `to` at 1
    return progress < 0.5 ? from : to;
  }
}

/**
 * Interpolate through multiple color keyframes in OKLCH space.
 *
 * @param colors - Array of CSS color strings (hex, rgb, hsl, named)
 * @param progress - 0 to 1
 * @param easing - Optional easing function applied to progress
 */
export function interpolateColorKeyframes(
  colors: string[],
  progress: number,
  easing?: EasingFunction
): string {
  if (colors.length === 0) return "transparent";
  if (colors.length === 1) return colors[0];

  try {
    const t = easing ? easing(Math.max(0, Math.min(1, progress))) : Math.max(0, Math.min(1, progress));
    const segments = colors.length - 1;
    const segment = Math.min(Math.floor(t * segments), segments - 1);
    const segmentProgress = (t * segments - segment);

    const from = colors[segment];
    const to = colors[segment + 1];
    const fn = culoriInterpolate([from, to], "oklch");
    return formatRgb(fn(Math.max(0, Math.min(1, segmentProgress))));
  } catch {
    // Fallback
    const idx = Math.min(
      Math.floor(progress * colors.length),
      colors.length - 1
    );
    return colors[idx];
  }
}

/**
 * Check if a color string is valid and parseable.
 */
export function isValidColor(color: string): boolean {
  try {
    return parse(color) !== undefined;
  } catch {
    return false;
  }
}

/**
 * Convert any CSS color to hex format.
 */
export function toHex(color: string): string {
  try {
    const rgb = formatRgb(parse(color)!);
    // formatRgb returns "rgb(r, g, b)" — convert to hex
    const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (match) {
      const [, r, g, b] = match.map(Number);
      return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    }
    return color;
  } catch {
    return color;
  }
}
