/**
 * Particle Physics Engine — Type Definitions
 *
 * Adapted from remotion-bits, enhanced for V5 pipeline:
 * - Minimum radius/opacity enforcement (Rule #14)
 * - Glow behavior for boxShadow
 * - Rotation tracking
 */

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface Particle {
  id: string;
  index: number;
  seed: number;
  birthFrame: number;
  lifespan: number;
  position: Vector3;
  velocity: Vector3;
  acceleration: Vector3;
  scale: number;
  rotation: number;
  opacity: number;
  glowRadius: number;
  glowIntensity: number;
  age: number;
}

export interface SpawnerConfig {
  id: string;
  rate?: number;
  burst?: number;
  startFrame?: number;
  max?: number;
  position?: Partial<Vector3>;
  area?: { width: number; height: number; depth?: number };
  velocity?: {
    x?: number;
    y?: number;
    z?: number;
    varianceX?: number;
    varianceY?: number;
    varianceZ?: number;
  };
  scale?: number;
  scaleVariance?: number;
  lifespan?: number;
  lifespanVariance?: number;
}

export type ParticleBehaviorHandler = (
  particle: Particle,
  age: number,
  ctx: { frame: number; fps: number }
) => void;

export interface BehaviorConfig {
  handler: ParticleBehaviorHandler;
}

export interface SimulationConfig {
  frame: number;
  fps: number;
  spawners: SpawnerConfig[];
  behaviors: BehaviorConfig[];
  /** V5 Rule #14: minimum particle radius (default 6) */
  minRadius?: number;
  /** V5 Rule #14: minimum particle opacity (default 0.15) */
  minOpacity?: number;
}
