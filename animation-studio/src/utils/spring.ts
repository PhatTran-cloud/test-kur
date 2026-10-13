/**
 * Spring Config Factory + Easing Library
 *
 * Formalized spring physics: { mass, stiffness, damping } -> easing function.
 * Pre-built presets matching V5 design system.
 * Hold frames for beat timing.
 */

// ── Types ─────────────────────────────────────────────

export interface SpringConfig {
  mass?: number;
  stiffness?: number;
  damping?: number;
}

export type EasingFn = (t: number) => number;

export interface Hold {
  type: "hold";
  frames: number;
}

// ── Spring Factory ────────────────────────────────────

/**
 * Create a spring easing function from physics config.
 * Damped harmonic oscillator simulation.
 *
 * - zeta < 1: underdamped (oscillates then settles)
 * - zeta = 1: critically damped (fastest settle, no overshoot)
 * - zeta > 1: overdamped (slow settle, no overshoot)
 */
export function createSpring(config: SpringConfig = {}): EasingFn {
  const mass = config.mass ?? 1;
  const stiffness = config.stiffness ?? 100;
  const damping = config.damping ?? 10;

  const w0 = Math.sqrt(stiffness / mass);
  const zeta = damping / (2 * Math.sqrt(stiffness * mass));

  if (zeta < 1) {
    // Underdamped
    const wd = w0 * Math.sqrt(1 - zeta * zeta);
    return (t: number) => {
      const s = Math.max(t, 0);
      return (
        1 -
        Math.exp(-zeta * w0 * s) *
          (Math.cos(wd * s) + ((zeta * w0) / wd) * Math.sin(wd * s))
      );
    };
  }

  // Critically damped or overdamped
  return (t: number) => {
    const s = Math.max(t, 0);
    return 1 - Math.exp(-w0 * s) * (1 + w0 * s);
  };
}

// ── V5 Design System Presets ──────────────────────────

export const SPRING_PRESETS = {
  /** Smooth, no bounce (damping: 200) */
  gentle: createSpring({ mass: 1, stiffness: 100, damping: 200 }),
  /** Quick entrance with slight overshoot */
  snappy: createSpring({ mass: 1, stiffness: 200, damping: 20 }),
  /** Playful bounce */
  bouncy: createSpring({ mass: 1, stiffness: 100, damping: 8 }),
  /** Dramatic slow entrance */
  heavy: createSpring({ mass: 2, stiffness: 80, damping: 15 }),
  /** Default Remotion-like */
  default: createSpring({ mass: 1, stiffness: 100, damping: 10 }),
} as const;

// ── Hold ──────────────────────────────────────────────

/**
 * Create a hold marker for keyframe sequences.
 * Usage: [value1, hold(30), value2] — pause 30 frames at value1.
 */
export function hold(frames: number): Hold {
  return { type: "hold", frames };
}

/**
 * Check if a value is a Hold marker.
 */
export function isHold(v: unknown): v is Hold {
  return (
    typeof v === "object" &&
    v !== null &&
    (v as Hold).type === "hold" &&
    typeof (v as Hold).frames === "number"
  );
}

// ── Easing Library ────────────────────────────────────

export const Easing = {
  linear: (t: number) => t,

  // Quadratic
  easeInQuad: (t: number) => t * t,
  easeOutQuad: (t: number) => t * (2 - t),
  easeInOutQuad: (t: number) =>
    t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,

  // Cubic
  easeInCubic: (t: number) => t * t * t,
  easeOutCubic: (t: number) => --t * t * t + 1,
  easeInOutCubic: (t: number) =>
    t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,

  // Sine
  easeInSine: (t: number) => 1 - Math.cos((t * Math.PI) / 2),
  easeOutSine: (t: number) => Math.sin((t * Math.PI) / 2),
  easeInOutSine: (t: number) => -(Math.cos(Math.PI * t) - 1) / 2,

  // Quart
  easeInQuart: (t: number) => t * t * t * t,
  easeOutQuart: (t: number) => 1 - --t * t * t * t,
  easeInOutQuart: (t: number) =>
    t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t,

  // Expo
  easeInExpo: (t: number) => (t === 0 ? 0 : Math.pow(2, 10 * t - 10)),
  easeOutExpo: (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  easeInOutExpo: (t: number) =>
    t === 0
      ? 0
      : t === 1
        ? 1
        : t < 0.5
          ? Math.pow(2, 20 * t - 10) / 2
          : (2 - Math.pow(2, -20 * t + 10)) / 2,

  // Back (overshoot)
  easeInBack: (t: number) => {
    const c = 1.70158;
    return (c + 1) * t * t * t - c * t * t;
  },
  easeOutBack: (t: number) => {
    const c = 1.70158;
    return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
  },

  // Elastic
  easeOutElastic: (t: number) =>
    t === 0
      ? 0
      : t === 1
        ? 1
        : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1,

  // Steps (discrete)
  steps: (n: number): EasingFn => (t: number) => Math.floor(t * n) / n,
} as const;
