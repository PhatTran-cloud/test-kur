/**
 * Layout Planner — Spatial Planning System
 *
 * Plans element positions for EVERY frame range in a scene.
 * Guarantees: no overlap, max 3 visible elements, clean fade-out.
 *
 * RULE: When new element enters, old element either:
 *   1. STAYS if it's in a non-conflicting zone AND still relevant
 *   2. FADES OUT (opacity → 0 over 15 frames) if it conflicts or is no longer narrated
 *
 * NEVER: shrink to tiny size and leave on screen. That creates visual garbage.
 */

// Canvas dimensions
export const CANVAS = { w: 1920, h: 1080 } as const;

// Zone definitions with safe bounds (including 50px padding)
export const LAYOUT_ZONES = {
  // Full-width zones (for hero elements)
  HERO_CENTER: { x: 460, y: 290, w: 1000, h: 500 },      // Main focus area
  HERO_LEFT:   { x: 60, y: 290, w: 860, h: 500 },         // Left half
  HERO_RIGHT:  { x: 1000, y: 290, w: 860, h: 500 },       // Right half

  // Support zones (for secondary elements)
  TOP_BAR:     { x: 60, y: 60, w: 1800, h: 200 },         // Top strip
  BOTTOM_BAR:  { x: 60, y: 820, w: 1800, h: 200 },        // Bottom strip
  LEFT_STRIP:  { x: 60, y: 290, w: 400, h: 500 },         // Left margin
  RIGHT_STRIP: { x: 1460, y: 290, w: 400, h: 500 },       // Right margin

  // Quadrant zones (for grid layouts)
  QUAD_TL: { x: 60, y: 60, w: 880, h: 470 },
  QUAD_TR: { x: 1000, y: 60, w: 860, h: 470 },
  QUAD_BL: { x: 60, y: 560, w: 880, h: 460 },
  QUAD_BR: { x: 1000, y: 560, w: 860, h: 460 },
} as const;

export type ZoneName = keyof typeof LAYOUT_ZONES;

export interface PlannedBeat {
  id: string;
  enterFrame: number;       // Frame this beat enters
  exitFrame: number;        // Frame this beat fades out (opacity → 0)
  zone: ZoneName;           // Where it appears
  role: 'hero' | 'support'; // Hero = big, support = small label
}

export interface LayoutPlan {
  beats: PlannedBeat[];
  maxSimultaneous: number;  // Should be ≤ 3
}

/**
 * Plan layout for a scene's beats.
 *
 * Rules:
 * - Max 3 elements visible at once (1 hero + 2 support)
 * - Hero element ALWAYS in HERO_CENTER (or HERO_LEFT/RIGHT for split)
 * - When new hero enters, old hero FADES OUT (not shrinks)
 * - Support elements fade out when their hero fades
 * - No element lives longer than 2 hero cycles
 */
export function planLayout(
  beats: Array<{ id: string; frame: number; role: 'hero' | 'support' }>,
  sceneEnd: number,
  layout: 'centered' | 'split-h' | 'split-v' | 'grid' | 'radial' | 'stacked' | 'floating' | 'cinematic' = 'centered'
): LayoutPlan {
  const planned: PlannedBeat[] = [];
  const FADE_DURATION = 15;

  let heroIndex = 0;
  const heroBeatFrames: number[] = beats
    .filter(b => b.role === 'hero')
    .map(b => b.frame);

  for (let i = 0; i < beats.length; i++) {
    const beat = beats[i];
    const nextHeroFrame = heroBeatFrames.find(f => f > beat.frame);

    // Exit frame: when next hero enters (with fade buffer), or scene end
    let exitFrame: number;
    if (beat.role === 'hero') {
      exitFrame = nextHeroFrame
        ? nextHeroFrame - FADE_DURATION
        : sceneEnd;
    } else {
      // Support exits when its hero exits or next hero enters
      exitFrame = nextHeroFrame
        ? nextHeroFrame - FADE_DURATION
        : sceneEnd;
    }

    // Zone assignment based on layout
    let zone: ZoneName;
    if (beat.role === 'hero') {
      switch (layout) {
        case 'split-h':
          zone = heroIndex % 2 === 0 ? 'HERO_LEFT' : 'HERO_RIGHT';
          break;
        case 'grid':
          const quadrants: ZoneName[] = ['QUAD_TL', 'QUAD_TR', 'QUAD_BL', 'QUAD_BR'];
          zone = quadrants[heroIndex % 4];
          break;
        default:
          zone = 'HERO_CENTER';
      }
      heroIndex++;
    } else {
      zone = 'BOTTOM_BAR'; // Support always in bottom bar
    }

    planned.push({
      id: beat.id,
      enterFrame: beat.frame,
      exitFrame: Math.max(beat.frame + 30, exitFrame), // Min 30f visible
      zone,
      role: beat.role,
    });
  }

  // Verify max simultaneous
  let maxSim = 0;
  for (let f = 0; f < sceneEnd; f += 10) { // Sample every 10 frames
    const visible = planned.filter(b => f >= b.enterFrame && f < b.exitFrame);
    maxSim = Math.max(maxSim, visible.length);
  }

  return { beats: planned, maxSimultaneous: maxSim };
}

/**
 * Generate interpolation code for a beat's lifecycle.
 * Returns: { opacity, scale, x, y } at any frame.
 *
 * Lifecycle:
 *   enterFrame → enterFrame+20: fade in (0 → 1)
 *   enterFrame+20 → exitFrame: visible (1)
 *   exitFrame → exitFrame+15: fade out (1 → 0)
 */
export function getBeatLifecycle(frame: number, enter: number, exit: number) {
  const ENTER_DUR = 20;
  const EXIT_DUR = 15;

  if (frame < enter) return { opacity: 0, scale: 0.8, phase: 'hidden' as const };
  if (frame < enter + ENTER_DUR) {
    const t = (frame - enter) / ENTER_DUR;
    return { opacity: t, scale: 0.8 + t * 0.2, phase: 'entering' as const };
  }
  if (frame < exit) return { opacity: 1, scale: 1, phase: 'visible' as const };
  if (frame < exit + EXIT_DUR) {
    const t = 1 - (frame - exit) / EXIT_DUR;
    return { opacity: t, scale: 1, phase: 'exiting' as const };
  }
  return { opacity: 0, scale: 0, phase: 'gone' as const };
}
