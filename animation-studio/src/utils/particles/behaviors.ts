/**
 * Particle Behavior Factories
 *
 * Pure functions that mutate particle state during simulation.
 * Adapted from remotion-bits + V5 custom behaviors (glow, rotation).
 * All use Remotion.random() for deterministic per-particle variance.
 */

import { random } from "remotion";
import type { BehaviorConfig, ParticleBehaviorHandler } from "./types";

// ── Core: Movement (applies velocity) ─────────────────

export const movement: ParticleBehaviorHandler = (p) => {
  p.position.x += p.velocity.x;
  p.position.y += p.velocity.y;
  p.position.z += p.velocity.z;
  p.velocity.x += p.acceleration.x;
  p.velocity.y += p.acceleration.y;
  p.velocity.z += p.acceleration.z;
  p.acceleration.x = 0;
  p.acceleration.y = 0;
  p.acceleration.z = 0;
};

// ── Gravity ───────────────────────────────────────────

export function createGravity(force: {
  x?: number;
  y?: number;
  z?: number;
  varianceX?: number;
  varianceY?: number;
  varianceZ?: number;
}): BehaviorConfig {
  return {
    handler: (p) => {
      const vx = force.varianceX
        ? (random(`grav-x-${p.seed}`) - 0.5) * 2 * force.varianceX
        : 0;
      const vy = force.varianceY
        ? (random(`grav-y-${p.seed}`) - 0.5) * 2 * force.varianceY
        : 0;
      const vz = force.varianceZ
        ? (random(`grav-z-${p.seed}`) - 0.5) * 2 * force.varianceZ
        : 0;
      p.acceleration.x += (force.x ?? 0) + vx;
      p.acceleration.y += (force.y ?? 0) + vy;
      p.acceleration.z += (force.z ?? 0) + vz;
    },
  };
}

// ── Drag (velocity damping) ───────────────────────────

export function createDrag(
  factor: number,
  variance?: number
): BehaviorConfig {
  return {
    handler: (p) => {
      const v = variance
        ? factor + (random(`drag-${p.seed}`) - 0.5) * 2 * variance
        : factor;
      const d = 1 - Math.min(v, 0.99);
      p.velocity.x *= d;
      p.velocity.y *= d;
      p.velocity.z *= d;
    },
  };
}

// ── Wiggle (sin-based noise) ──────────────────────────

export function createWiggle(
  magnitude: number,
  frequency: number,
  magnitudeVariance?: number
): BehaviorConfig {
  return {
    handler: (p, age, ctx) => {
      const mag = magnitudeVariance
        ? magnitude +
          (random(`wiggle-mag-${p.seed}`) - 0.5) * 2 * magnitudeVariance
        : magnitude;
      const phase = random(`wiggle-phase-${p.seed}`) * Math.PI * 2;
      const t = age / ctx.fps;
      p.acceleration.x += Math.sin(t * frequency * Math.PI * 2 + phase) * mag;
      p.acceleration.y +=
        Math.cos(t * frequency * Math.PI * 2 + phase + 1.5) * mag;
    },
  };
}

// ── Opacity Over Life ─────────────────────────────────

export function createOpacityOverLife(
  startOpacity: number,
  endOpacity: number,
  startVariance?: number,
  endVariance?: number
): BehaviorConfig {
  return {
    handler: (p) => {
      const progress = Math.min(p.age / Math.max(p.lifespan, 1), 1);
      const sv = startVariance
        ? (random(`opacity-s-${p.seed}`) - 0.5) * 2 * startVariance
        : 0;
      const ev = endVariance
        ? (random(`opacity-e-${p.seed}`) - 0.5) * 2 * endVariance
        : 0;
      const s = Math.max(startOpacity + sv, 0);
      const e = Math.max(endOpacity + ev, 0);
      p.opacity = s + (e - s) * progress;
    },
  };
}

// ── Scale Over Life ───────────────────────────────────

export function createScaleOverLife(
  startScale: number,
  endScale: number,
  startVariance?: number,
  endVariance?: number
): BehaviorConfig {
  return {
    handler: (p) => {
      const progress = Math.min(p.age / Math.max(p.lifespan, 1), 1);
      const sv = startVariance
        ? (random(`scale-s-${p.seed}`) - 0.5) * 2 * startVariance
        : 0;
      const ev = endVariance
        ? (random(`scale-e-${p.seed}`) - 0.5) * 2 * endVariance
        : 0;
      p.scale = startScale + sv + (endScale + ev - (startScale + sv)) * progress;
    },
  };
}

// ── Rotation Over Life (V5 custom) ────────────────────

export function createRotationOverLife(
  startDeg: number,
  endDeg: number,
  variance?: number
): BehaviorConfig {
  return {
    handler: (p) => {
      const progress = Math.min(p.age / Math.max(p.lifespan, 1), 1);
      const v = variance
        ? (random(`rot-${p.seed}`) - 0.5) * 2 * variance
        : 0;
      p.rotation = startDeg + v + (endDeg - startDeg) * progress;
    },
  };
}

// ── Glow Over Life (V5 custom — Rule #14 boxShadow) ──

export function createGlowOverLife(
  startRadius: number,
  endRadius: number,
  startIntensity: number,
  endIntensity: number
): BehaviorConfig {
  return {
    handler: (p) => {
      const progress = Math.min(p.age / Math.max(p.lifespan, 1), 1);
      p.glowRadius = startRadius + (endRadius - startRadius) * progress;
      p.glowIntensity =
        startIntensity + (endIntensity - startIntensity) * progress;
    },
  };
}
