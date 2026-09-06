/** Figma Subtract / Exclude ticket paths (374×424 artboard). */

/** Main coupon body — flat tear edge on top, scalloped bottom (node 4267:2473). */
export const COUPON_BODY_PATH =
  'M0 0 H374 V404 C362.524 404 353.102 412.787 352.092 424 H21.9082 C20.8977 412.787 11.476 404 0 404 V0 Z';

/** Peek stub — rounded top corners, flat bottom at perforation (first 120px of ticket). */
export const COUPON_STUB_PATH =
  'M358 0 C366.837 0 374 7.16345 374 16 V120 H0 V16 C0 7.16345 7.16345 0 16 0 H358 Z';

/** Full ticket for list / static views (node 4267:2469). */
export const COUPON_FULL_PATH =
  'M358 0 C366.837 0 374 7.16345 374 16 V404 C362.524 404 353.102 412.787 352.092 424 H21.9082 C20.8977 412.787 11.476 404 0 404 V16 C0 7.16345 7.16345 0 16 0 H358 Z';

export const COUPON_ARTBOARD = {
  width: 374,
  mainHeight: 424,
  peekHeight: 120,
  topCornerRadius: 16,
  notchRadius: 12,
  perforationInset: 22,
} as const;
