import { RESTART_PRICE_LABEL } from './product';
import type { PurchaseRestartResult } from './purchaseRestart';

/** Digits-only card number check for the mock checkout (Stripe test brand). */
export function isValidMockCardNumber(raw: string): boolean {
  const digits = raw.replace(/\D/g, '');
  return digits === '4242424242424242';
}

export function isValidMockExpiry(raw: string): boolean {
  const m = raw.trim().match(/^(\d{2})\s*\/\s*(\d{2})$/);
  if (!m) return false;
  const month = Number(m[1]);
  const year = 2000 + Number(m[2]);
  if (month < 1 || month > 12) return false;
  const now = new Date();
  const exp = new Date(year, month, 0, 23, 59, 59);
  return exp.getTime() >= now.getTime();
}

export function isValidMockCvc(raw: string): boolean {
  return /^\d{3,4}$/.test(raw.trim());
}

/**
 * Complete the mock (€1) purchase used on web and when StoreKit is unavailable.
 * Validates the same test card number developers use with Stripe sandboxes.
 */
export async function purchaseRestartViaMock(input: {
  cardNumber: string;
  expiry: string;
  cvc: string;
}): Promise<PurchaseRestartResult> {
  await new Promise((r) => setTimeout(r, 50));

  if (!isValidMockCardNumber(input.cardNumber)) {
    return { ok: false, error: 'use the test card 4242 4242 4242 4242' };
  }
  if (!isValidMockExpiry(input.expiry)) {
    return { ok: false, error: 'enter a valid future expiry (mm/yy)' };
  }
  if (!isValidMockCvc(input.cvc)) {
    return { ok: false, error: 'enter a valid cvc' };
  }

  return { ok: true, method: 'mock', displayPrice: RESTART_PRICE_LABEL };
}
