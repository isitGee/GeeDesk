/**
 * Anti-Bias Shuffling Engine
 *
 * Ensures that multiple-choice options, hypotheses, diagnostic choices,
 * and sequence steps are NEVER presented in a predictable authoring order.
 * Shuffles items deterministically per session attempt or randomly.
 */

// Simple 32-bit integer hash for reproducible pseudo-random sequence per session
function xfnv1a(str: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  }
  return h >>> 0;
}

// Mulberry32 pseudo-random generator
function mulberry32(seed: number): () => number {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Shuffles an array using Fisher-Yates.
 * If a seed is provided, the shuffle is deterministic for that seed.
 * If no seed is provided, uses Math.random().
 */
export function shuffleArray<T>(array: T[], seed?: string): T[] {
  const result = [...array];
  const rng = seed ? mulberry32(xfnv1a(seed)) : Math.random;

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }
  return result;
}

/**
 * Shuffles options for a specific question/diagnosis in a session.
 * Uses sessionId + componentId as salt to guarantee stability within an attempt
 * but complete randomization between different attempts and tickets.
 */
export function randomizeOptions<T extends { id: string }>(
  items: T[],
  sessionId: string,
  salt = "options"
): T[] {
  if (!items || items.length <= 1) return items;
  return shuffleArray(items, `${sessionId}:${salt}`);
}

/**
 * Statistical audit utility to verify that over multiple runs,
 * correct answers are distributed evenly across positions.
 */
export function auditPositionDistribution<T extends { id: string; isCorrect?: boolean }>(
  items: T[],
  iterations = 1000
): Record<number, number> {
  const distribution: Record<number, number> = {};
  for (let i = 0; i < items.length; i++) {
    distribution[i] = 0;
  }

  for (let iter = 0; iter < iterations; iter++) {
    const seed = `audit-run-${iter}`;
    const shuffled = shuffleArray(items, seed);
    const correctIndex = shuffled.findIndex((item) => item.isCorrect);
    if (correctIndex !== -1) {
      distribution[correctIndex] = (distribution[correctIndex] ?? 0) + 1;
    }
  }

  return distribution;
}
