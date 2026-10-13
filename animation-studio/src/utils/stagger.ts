/**
 * Stagger Framework
 *
 * Calculate timing offsets for element sequences.
 * Supports multiple stagger directions for visual variety.
 * Uses Remotion.random() for deterministic "random" direction.
 */

import { random } from "remotion";

export type StaggerDirection = "forward" | "reverse" | "center" | "random";

/**
 * Calculate the stagger index for an element in a sequence.
 *
 * - forward: 0, 1, 2, 3, ...
 * - reverse: N-1, N-2, ..., 0
 * - center: distance from center (center = 0, edges = max)
 * - random: Fisher-Yates shuffle (deterministic via seed)
 */
export function calculateStaggerIndex(
  index: number,
  total: number,
  direction: StaggerDirection,
  seed?: string
): number {
  switch (direction) {
    case "forward":
      return index;

    case "reverse":
      return total - 1 - index;

    case "center": {
      const mid = (total - 1) / 2;
      return Math.abs(index - mid);
    }

    case "random": {
      // Fisher-Yates shuffle (deterministic)
      const indices = Array.from({ length: total }, (_, i) => i);
      for (let i = total - 1; i > 0; i--) {
        const j = Math.floor(
          random(seed ? `${seed}-stagger-${i}` : `stagger-${i}`) * (i + 1)
        );
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }
      return indices[index];
    }
  }
}

/**
 * Get the frame delay for an element based on its stagger position.
 *
 * @param index - Element index in the sequence
 * @param total - Total elements
 * @param direction - Stagger direction
 * @param delayPerItem - Frames between each item's entrance
 * @param seed - Optional seed for "random" direction
 */
export function getStaggerDelay(
  index: number,
  total: number,
  direction: StaggerDirection,
  delayPerItem: number,
  seed?: string
): number {
  const staggerIdx = calculateStaggerIndex(index, total, direction, seed);
  return Math.round(staggerIdx * delayPerItem);
}

/**
 * Generate an array of frame delays for all items in a sequence.
 * Useful for pre-computing all timing before rendering.
 */
export function getStaggerDelays(
  total: number,
  direction: StaggerDirection,
  delayPerItem: number,
  seed?: string
): number[] {
  return Array.from({ length: total }, (_, i) =>
    getStaggerDelay(i, total, direction, delayPerItem, seed)
  );
}
