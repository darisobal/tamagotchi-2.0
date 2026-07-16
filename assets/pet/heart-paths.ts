/**
 * Filled and broken heart icons for the pet life bar.
 * Paths from Figma `heart-filled 1` / `heart-empty 1` (Tamagotchi 2.0).
 *
 * ViewBox includes padding so the thick stroke isn’t clipped — a clipped tip
 * reads as a flat “ground” line under the heart.
 */

/** Padded viewBox: content ~0…141 × 0…133, plus room for stroke overflow. */
export const HEART_VIEWBOX = {
  minX: -10,
  minY: -12,
  w: 161,
  h: 157,
} as const;

/** Solid / outline heart silhouette. */
export const HEART_FILLED_PATH =
  'M70.4485 122.55C21.6985 84.6333 0.0318252 52.1333 10.8652 25.05C21.6985 -2.03332 59.6152 3.38335 70.4485 41.3C81.2818 3.38335 119.198 -2.03332 130.032 25.05C140.865 52.1333 119.198 84.6333 70.4485 122.55Z';

/** Outline heart — same silhouette, drawn with stroke. */
export const HEART_OUTLINE_PATH = HEART_FILLED_PATH;

/**
 * Zig-zag crack through the center (open path for stroke).
 * Stops short of the tip — no stem above the cleft and no flat bar at the bottom.
 */
export const HEART_CRACK_PATH =
  'M54.1985 30.4667L75.8652 62.9667L48.7818 79.2167L86.6985 111.717';

export const HEART_STROKE_WIDTH = 16.25;
export const HEART_CRACK_STROKE_WIDTH = 13.5417;
