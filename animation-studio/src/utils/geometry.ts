/**
 * Geometry Utilities + Zone Grid System
 *
 * Layout helpers for V5's 1920x1080 canvas.
 * Pre-defined 9 zones matching Rule #25 coordinates.
 * Overlap detection for validation.
 */

// ── Types ─────────────────────────────────────────────

export interface Point {
  x: number;
  y: number;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type PositionName =
  | "center"
  | "topLeft"
  | "topCenter"
  | "topRight"
  | "midLeft"
  | "midCenter"
  | "midRight"
  | "bottomLeft"
  | "bottomCenter"
  | "bottomRight";

// ── Rect Class ────────────────────────────────────────

export class Rect {
  constructor(
    public readonly x: number,
    public readonly y: number,
    public readonly width: number,
    public readonly height: number
  ) {}

  get left() { return this.x; }
  get right() { return this.x + this.width; }
  get top() { return this.y; }
  get bottom() { return this.y + this.height; }
  get cx() { return this.x + this.width / 2; }
  get cy() { return this.y + this.height / 2; }
  get center(): Point { return { x: this.cx, y: this.cy }; }

  /** Viewport-relative units for 1920x1080 */
  get vw() { return this.width / 19.2; }
  get vh() { return this.height / 10.8; }

  contains(p: Point): boolean {
    return p.x >= this.left && p.x <= this.right &&
           p.y >= this.top && p.y <= this.bottom;
  }

  containsRect(other: Rect): boolean {
    return other.left >= this.left && other.right <= this.right &&
           other.top >= this.top && other.bottom <= this.bottom;
  }

  overlaps(other: Rect): boolean {
    return this.left < other.right && this.right > other.left &&
           this.top < other.bottom && this.bottom > other.top;
  }

  /** Inset the rect by padding on all sides */
  inset(padding: number): Rect {
    return new Rect(
      this.x + padding,
      this.y + padding,
      Math.max(this.width - padding * 2, 0),
      Math.max(this.height - padding * 2, 0)
    );
  }
}

// ── Zone Grid System (Rule #25) ───────────────────────

const ZONE_PAD = 50;

/**
 * Pre-defined 9 zones for 1920x1080 canvas.
 * Each zone has 50px inner padding (Rule #25).
 */
export const ZONES = {
  Z1: new Rect(60, 60, 500, 280),    // top-left
  Z2: new Rect(610, 60, 700, 280),   // top-center
  Z3: new Rect(1360, 60, 500, 280),  // top-right
  Z4: new Rect(60, 390, 500, 300),   // mid-left
  Z5: new Rect(610, 390, 700, 300),  // mid-center (HERO)
  Z6: new Rect(1360, 390, 500, 300), // mid-right
  Z7: new Rect(60, 740, 500, 280),   // bot-left
  Z8: new Rect(610, 740, 700, 280),  // bot-center
  Z9: new Rect(1360, 740, 500, 280), // bot-right
} as const;

export type ZoneName = keyof typeof ZONES;

/** Get the safe area within a zone (with 50px padding) */
export function getZoneSafeArea(zone: ZoneName): Rect {
  return ZONES[zone].inset(ZONE_PAD);
}

/** Get the center point of a zone */
export function getZoneCenter(zone: ZoneName): Point {
  return ZONES[zone].center;
}

// ── Position Resolution ───────────────────────────────

/**
 * Resolve a named position to coordinates within a rect.
 */
export function resolvePosition(name: PositionName, rect?: Rect): Point {
  const r = rect ?? new Rect(0, 0, 1920, 1080);
  switch (name) {
    case "center":       return r.center;
    case "topLeft":      return { x: r.left + ZONE_PAD, y: r.top + ZONE_PAD };
    case "topCenter":    return { x: r.cx, y: r.top + ZONE_PAD };
    case "topRight":     return { x: r.right - ZONE_PAD, y: r.top + ZONE_PAD };
    case "midLeft":      return { x: r.left + ZONE_PAD, y: r.cy };
    case "midCenter":    return r.center;
    case "midRight":     return { x: r.right - ZONE_PAD, y: r.cy };
    case "bottomLeft":   return { x: r.left + ZONE_PAD, y: r.bottom - ZONE_PAD };
    case "bottomCenter": return { x: r.cx, y: r.bottom - ZONE_PAD };
    case "bottomRight":  return { x: r.right - ZONE_PAD, y: r.bottom - ZONE_PAD };
  }
}

// ── Flow Patterns (Rule #23) ──────────────────────────

export type FlowPattern =
  | "top-down"
  | "left-to-right"
  | "center-expand"
  | "quadrant"
  | "z-pattern";

/**
 * Get the sequence of zones for a given flow pattern.
 * Returns zone names in the order elements should appear.
 */
export function getFlowZones(pattern: FlowPattern): ZoneName[] {
  switch (pattern) {
    case "top-down":       return ["Z2", "Z5", "Z8"];
    case "left-to-right":  return ["Z4", "Z5", "Z6"];
    case "center-expand":  return ["Z5", "Z4", "Z6", "Z1", "Z2", "Z3"];
    case "quadrant":       return ["Z1", "Z3", "Z7", "Z9", "Z5"];
    case "z-pattern":      return ["Z1", "Z3", "Z5", "Z7", "Z9"];
  }
}

/** Relocated elements always go to top row */
export const RELOCATE_ZONES: ZoneName[] = ["Z1", "Z2", "Z3"];

// ── Overlap Detection ─────────────────────────────────

export interface ElementPlacement {
  id: string;
  zone: ZoneName;
  bounds: BoundingBox;
}

export interface OverlapViolation {
  elementA: string;
  elementB: string;
  zone: ZoneName;
}

/**
 * Check a list of element placements for overlap violations.
 * Returns list of overlapping pairs.
 */
export function checkOverlap(elements: ElementPlacement[]): OverlapViolation[] {
  const violations: OverlapViolation[] = [];

  for (let i = 0; i < elements.length; i++) {
    for (let j = i + 1; j < elements.length; j++) {
      const a = elements[i];
      const b = elements[j];

      const ra = new Rect(a.bounds.x, a.bounds.y, a.bounds.width, a.bounds.height);
      const rb = new Rect(b.bounds.x, b.bounds.y, b.bounds.width, b.bounds.height);

      if (ra.overlaps(rb)) {
        violations.push({
          elementA: a.id,
          elementB: b.id,
          zone: a.zone === b.zone ? a.zone : a.zone,
        });
      }
    }
  }

  return violations;
}

// ── Canvas Helpers ────────────────────────────────────

export const CANVAS = new Rect(0, 0, 1920, 1080);

/**
 * Check if an element meets the minimum size ratio (Rule #24).
 * Active elements must be >= 35% width OR >= 30% height.
 */
export function meetsMinSizeRatio(
  width: number,
  height: number,
  role: "active" | "support" = "active"
): boolean {
  if (role === "active") {
    return width / 1920 >= 0.35 || height / 1080 >= 0.30;
  }
  // Support: just above minimum visible (8%)
  return width / 1920 >= 0.08 || height / 1080 >= 0.08;
}

/**
 * Check if an element is too small to be visible (Rule #24).
 */
export function isTooSmall(width: number, height: number): boolean {
  return width / 1920 < 0.08 && height / 1080 < 0.08;
}
