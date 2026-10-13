/**
 * Deterministic Particle Simulator
 *
 * Core principle: NO stored state between frames. Each render call
 * re-simulates all particles from birth to current frame using
 * seeded randomness via Remotion.random().
 *
 * Adapted from remotion-bits, enhanced for V5:
 * - Enforces Rule #14 minimums (radius >= 6, opacity >= 0.15)
 * - Includes glow state per particle
 */

import { random } from "remotion";
import type {
  Particle,
  SimulationConfig,
  SpawnerConfig,
  BehaviorConfig,
  Vector3,
} from "./types";
import { movement } from "./behaviors";

const DEFAULT_MIN_RADIUS = 6;
const DEFAULT_MIN_OPACITY = 0.15;

function createParticle(
  spawner: SpawnerConfig,
  index: number,
  birthFrame: number
): Particle {
  const seedBase = `${spawner.id}-${index}`;
  const seed = random(seedBase) * 999999;

  // Position: center of area + random offset
  const px =
    (spawner.position?.x ?? 0) +
    (spawner.area
      ? (random(`${seedBase}-px`) - 0.5) * spawner.area.width
      : 0);
  const py =
    (spawner.position?.y ?? 0) +
    (spawner.area
      ? (random(`${seedBase}-py`) - 0.5) * spawner.area.height
      : 0);
  const pz =
    (spawner.position?.z ?? 0) +
    (spawner.area?.depth
      ? (random(`${seedBase}-pz`) - 0.5) * spawner.area.depth
      : 0);

  // Velocity: base + variance
  const vx =
    (spawner.velocity?.x ?? 0) +
    (spawner.velocity?.varianceX
      ? (random(`${seedBase}-vx`) - 0.5) * 2 * spawner.velocity.varianceX
      : 0);
  const vy =
    (spawner.velocity?.y ?? 0) +
    (spawner.velocity?.varianceY
      ? (random(`${seedBase}-vy`) - 0.5) * 2 * spawner.velocity.varianceY
      : 0);
  const vz =
    (spawner.velocity?.z ?? 0) +
    (spawner.velocity?.varianceZ
      ? (random(`${seedBase}-vz`) - 0.5) * 2 * spawner.velocity.varianceZ
      : 0);

  // Scale with variance
  const baseScale = spawner.scale ?? 1;
  const scaleVar = spawner.scaleVariance
    ? (random(`${seedBase}-s`) - 0.5) * 2 * spawner.scaleVariance
    : 0;

  // Lifespan with variance
  const baseLife = spawner.lifespan ?? 120;
  const lifeVar = spawner.lifespanVariance
    ? (random(`${seedBase}-l`) - 0.5) * 2 * spawner.lifespanVariance
    : 0;

  return {
    id: `${spawner.id}-${index}`,
    index,
    seed,
    birthFrame,
    lifespan: Math.max(baseLife + lifeVar, 10),
    position: { x: px, y: py, z: pz },
    velocity: { x: vx, y: vy, z: vz },
    acceleration: { x: 0, y: 0, z: 0 },
    scale: Math.max(baseScale + scaleVar, 0.1),
    rotation: 0,
    opacity: 1,
    glowRadius: 0,
    glowIntensity: 0,
    age: 0,
  };
}

function spawnParticles(spawner: SpawnerConfig, frame: number): Particle[] {
  const particles: Particle[] = [];
  const start = spawner.startFrame ?? 0;
  if (frame < start) return particles;

  let idx = 0;

  // Burst: all spawn at startFrame
  if (spawner.burst && spawner.burst > 0) {
    for (let i = 0; i < spawner.burst; i++) {
      particles.push(createParticle(spawner, idx++, start));
    }
  }

  // Rate: continuous spawning
  if (spawner.rate && spawner.rate > 0) {
    const framesActive = frame - start;
    const totalFromRate = Math.floor(framesActive * spawner.rate);
    for (let i = 0; i < totalFromRate; i++) {
      const birth = start + Math.floor(i / spawner.rate);
      particles.push(createParticle(spawner, idx++, birth));
    }
  }

  return particles;
}

export function simulateParticles(config: SimulationConfig): Particle[] {
  const { frame, fps, spawners, behaviors } = config;
  const minRadius = config.minRadius ?? DEFAULT_MIN_RADIUS;
  const minOpacity = config.minOpacity ?? DEFAULT_MIN_OPACITY;

  const allParticles: Particle[] = [];

  for (const spawner of spawners) {
    const spawned = spawnParticles(spawner, frame);

    for (const particle of spawned) {
      const age = frame - particle.birthFrame;
      if (age < 0 || age > particle.lifespan) continue;

      // Reset to spawn state, then simulate frame by frame
      const p = { ...particle };
      // Re-derive spawn state
      const fresh = createParticle(
        spawner,
        particle.index,
        particle.birthFrame
      );
      p.position = { ...fresh.position };
      p.velocity = { ...fresh.velocity };
      p.acceleration = { x: 0, y: 0, z: 0 };
      p.scale = fresh.scale;
      p.rotation = 0;
      p.opacity = 1;
      p.glowRadius = 0;
      p.glowIntensity = 0;

      // Simulate from birth to current frame
      for (let f = particle.birthFrame; f <= frame; f++) {
        p.age = f - particle.birthFrame;
        const ctx = { frame: f, fps };

        // Apply behaviors (gravity, drag, wiggle, etc.)
        for (const behavior of behaviors) {
          behavior.handler(p, p.age, ctx);
        }

        // Apply movement (velocity -> position)
        movement(p, p.age, ctx);
      }

      // V5 Rule #14: enforce minimums
      p.opacity = Math.max(p.opacity, minOpacity);
      p.scale = Math.max(p.scale, minRadius / 10); // scale 0.6 at radius 6

      // Apply max limit per spawner
      allParticles.push(p);
    }
  }

  // Apply max limits
  for (const spawner of spawners) {
    if (spawner.max) {
      const spawnerParticles = allParticles.filter(
        (p) => p.id.startsWith(spawner.id)
      );
      if (spawnerParticles.length > spawner.max) {
        // Keep newest (highest birthFrame)
        spawnerParticles.sort((a, b) => b.birthFrame - a.birthFrame);
        const toRemove = new Set(
          spawnerParticles.slice(spawner.max).map((p) => p.id)
        );
        for (let i = allParticles.length - 1; i >= 0; i--) {
          if (toRemove.has(allParticles[i].id)) {
            allParticles.splice(i, 1);
          }
        }
      }
    }
  }

  return allParticles;
}
