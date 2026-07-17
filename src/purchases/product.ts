/**
 * App Store / Play Billing product for restarting after the pet dies.
 *
 * Create a **consumable** in-app purchase with this exact product id in
 * App Store Connect and Google Play Console (price €1.00 / local equivalent).
 * Apple and Google require StoreKit / Play Billing for this digital unlock —
 * do not charge via Stripe or a custom card form in production iOS/Android builds.
 */
export const RESTART_PRODUCT_ID = 'com.tamagotchi.app.restart';

/** Fallback display when the store has not returned a localized price yet. */
export const RESTART_PRICE_LABEL = '€1';

export const RESTART_PRODUCT_TITLE = 'restart pet';

export const RESTART_PRODUCT_DESCRIPTION =
  'unlock a fresh start with three hearts after your pet dies.';

/**
 * Stripe-style test card for the **web / Expo Go mock** checkout only.
 * Real App Store / Play purchases use the system payment sheet (sandbox Apple ID
 * or Play license tester) — not a card form inside the app.
 */
export const MOCK_TEST_CARD = {
  number: '4242 4242 4242 4242',
  expiry: '12/30',
  cvc: '123',
  name: 'test user',
} as const;
