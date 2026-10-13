/**
 * CSS Gradient Parsing + OKLCH Interpolation
 *
 * Parse CSS gradient strings, interpolate between them in OKLCH space,
 * and emit back to CSS. Handles shortest-angle rotation and
 * auto-matching stop counts.
 */

import { interpolateColor } from "./color";

// ── Types ─────────────────────────────────────────────

export type GradientType = "linear" | "radial" | "conic";

export interface ColorStop {
  color: string;
  position: number; // 0–1
}

export interface ParsedGradient {
  type: GradientType;
  angle?: number; // degrees, for linear/conic
  shape?: string; // "ellipse", "circle", for radial
  position?: string; // "at center", for radial/conic
  stops: ColorStop[];
}

// ── Parsing ───────────────────────────────────────────

const GRADIENT_RE =
  /^(linear|radial|conic)-gradient\((.+)\)$/s;

export function parseGradient(css: string): ParsedGradient | null {
  const trimmed = css.trim();
  const match = trimmed.match(GRADIENT_RE);
  if (!match) return null;

  const type = match[1] as GradientType;
  const body = match[2];

  // Split on commas not inside parens
  const parts = splitGradientParts(body);
  if (parts.length < 2) return null;

  const result: ParsedGradient = { type, stops: [] };

  // First part may be angle/shape/position
  const firstPart = parts[0].trim();
  let stopStartIdx = 0;

  if (type === "linear") {
    const angleMatch = firstPart.match(/^(\d+(?:\.\d+)?)deg$/);
    if (angleMatch) {
      result.angle = parseFloat(angleMatch[1]);
      stopStartIdx = 1;
    } else if (firstPart.startsWith("to ")) {
      result.angle = directionToAngle(firstPart);
      stopStartIdx = 1;
    }
  } else if (type === "radial") {
    if (
      firstPart.includes("circle") ||
      firstPart.includes("ellipse") ||
      firstPart.includes("at ")
    ) {
      result.shape = firstPart;
      stopStartIdx = 1;
    }
  } else if (type === "conic") {
    const conicMatch = firstPart.match(/from\s+(\d+(?:\.\d+)?)deg/);
    if (conicMatch) {
      result.angle = parseFloat(conicMatch[1]);
      stopStartIdx = 1;
    }
  }

  // Parse color stops
  for (let i = stopStartIdx; i < parts.length; i++) {
    const stop = parseColorStop(parts[i].trim(), i - stopStartIdx, parts.length - stopStartIdx);
    if (stop) result.stops.push(stop);
  }

  // Normalize stop positions (auto-distribute missing ones)
  normalizeStopPositions(result.stops);

  return result;
}

function splitGradientParts(body: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = "";

  for (const char of body) {
    if (char === "(") depth++;
    if (char === ")") depth--;
    if (char === "," && depth === 0) {
      parts.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  if (current.trim()) parts.push(current);
  return parts;
}

function parseColorStop(
  part: string,
  index: number,
  total: number
): ColorStop | null {
  const posMatch = part.match(/\s+(\d+(?:\.\d+)?)%\s*$/);
  const color = posMatch ? part.replace(posMatch[0], "").trim() : part.trim();
  const position = posMatch
    ? parseFloat(posMatch[1]) / 100
    : index / Math.max(total - 1, 1);

  return { color, position };
}

function normalizeStopPositions(stops: ColorStop[]): void {
  if (stops.length === 0) return;
  // Ensure first is 0, last is 1
  stops[0].position = stops[0].position ?? 0;
  stops[stops.length - 1].position = stops[stops.length - 1].position ?? 1;

  // Fill gaps
  let lastPos = 0;
  for (let i = 0; i < stops.length; i++) {
    if (stops[i].position < lastPos) {
      stops[i].position = lastPos;
    }
    lastPos = stops[i].position;
  }
}

function directionToAngle(dir: string): number {
  const map: Record<string, number> = {
    "to top": 0,
    "to right": 90,
    "to bottom": 180,
    "to left": 270,
    "to top right": 45,
    "to top left": 315,
    "to bottom right": 135,
    "to bottom left": 225,
  };
  return map[dir] ?? 180;
}

// ── Interpolation ─────────────────────────────────────

/**
 * Interpolate between two parsed gradients.
 * Colors interpolated in OKLCH. Angles use shortest-path.
 */
export function interpolateGradients(
  from: ParsedGradient,
  to: ParsedGradient,
  progress: number
): ParsedGradient {
  const t = Math.max(0, Math.min(1, progress));

  // Match stop counts by resampling
  const [fromStops, toStops] = matchStopCounts(from.stops, to.stops);

  // Interpolate angle (shortest path)
  let angle: number | undefined;
  if (from.angle !== undefined && to.angle !== undefined) {
    angle = shortestAngleLerp(from.angle, to.angle, t);
  } else {
    angle = from.angle ?? to.angle;
  }

  // Interpolate stops
  const stops: ColorStop[] = fromStops.map((fs, i) => ({
    color: interpolateColor(fs.color, toStops[i].color, t),
    position: fs.position + (toStops[i].position - fs.position) * t,
  }));

  // Type switches at midpoint
  const type = t < 0.5 ? from.type : to.type;
  const shape = t < 0.5 ? from.shape : to.shape;
  const position = t < 0.5 ? from.position : to.position;

  return { type, angle, shape, position, stops };
}

function matchStopCounts(
  a: ColorStop[],
  b: ColorStop[]
): [ColorStop[], ColorStop[]] {
  if (a.length === b.length) return [a, b];

  const maxLen = Math.max(a.length, b.length);
  return [resampleStops(a, maxLen), resampleStops(b, maxLen)];
}

function resampleStops(stops: ColorStop[], count: number): ColorStop[] {
  if (stops.length === count) return stops;
  const result: ColorStop[] = [];
  for (let i = 0; i < count; i++) {
    const t = i / Math.max(count - 1, 1);
    // Find surrounding stops
    let lower = stops[0];
    let upper = stops[stops.length - 1];
    for (let j = 0; j < stops.length - 1; j++) {
      if (stops[j].position <= t && stops[j + 1].position >= t) {
        lower = stops[j];
        upper = stops[j + 1];
        break;
      }
    }
    const range = upper.position - lower.position;
    const segT = range > 0 ? (t - lower.position) / range : 0;
    result.push({
      color: interpolateColor(lower.color, upper.color, segT),
      position: t,
    });
  }
  return result;
}

function shortestAngleLerp(from: number, to: number, t: number): number {
  let diff = ((to - from + 540) % 360) - 180;
  return ((from + diff * t) % 360 + 360) % 360;
}

// ── CSS Output ────────────────────────────────────────

/**
 * Convert a ParsedGradient back to a CSS gradient string.
 */
export function gradientToCSS(g: ParsedGradient): string {
  const stopsStr = g.stops
    .map((s) => `${s.color} ${(s.position * 100).toFixed(1)}%`)
    .join(", ");

  switch (g.type) {
    case "linear": {
      const angle = g.angle !== undefined ? `${g.angle.toFixed(1)}deg, ` : "";
      return `linear-gradient(${angle}${stopsStr})`;
    }
    case "radial": {
      const shape = g.shape ? `${g.shape}, ` : "";
      return `radial-gradient(${shape}${stopsStr})`;
    }
    case "conic": {
      const angle = g.angle !== undefined ? `from ${g.angle.toFixed(1)}deg, ` : "";
      return `conic-gradient(${angle}${stopsStr})`;
    }
  }
}

/**
 * Interpolate through multiple gradient keyframes (as CSS strings).
 */
export function interpolateGradientKeyframes(
  gradients: string[],
  progress: number
): string {
  if (gradients.length === 0) return "";
  if (gradients.length === 1) return gradients[0];

  const t = Math.max(0, Math.min(1, progress));
  const segments = gradients.length - 1;
  const segment = Math.min(Math.floor(t * segments), segments - 1);
  const segProgress = t * segments - segment;

  const from = parseGradient(gradients[segment]);
  const to = parseGradient(gradients[segment + 1]);

  if (!from || !to) return gradients[segment];
  return gradientToCSS(interpolateGradients(from, to, segProgress));
}
