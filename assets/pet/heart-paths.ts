/**
 * Filled and broken heart icons for the pet life bar.
 * Paths traced from the user-supplied reference assets.
 */

/** viewBox 0 0 48 44 */
export const HEART_FILLED_PATH =
  'M24 40.5C24 40.5 3.5 27 3.5 14.5C3.5 7 10.5 2.5 24 13C37.5 2.5 44.5 7 44.5 14.5C44.5 27 24 40.5 24 40.5Z';

/** Outline heart — same silhouette, drawn with stroke. */
export const HEART_OUTLINE_PATH = HEART_FILLED_PATH;

/** Zig-zag crack through the center (open path for stroke). */
export const HEART_CRACK_PATH = 'M24 6 L27 14.5 L20.5 20 L28.5 28 L18.5 36.5 L24 40';

export const HEART_STROKE_WIDTH = 3.8;

export const HEART_VIEWBOX = { w: 48, h: 44 } as const;
