import { Platform } from 'react-native';
import { RESTART_PRODUCT_ID, RESTART_PRICE_LABEL } from './product';

export type PurchaseMethod = 'store' | 'mock';

export type PurchaseRestartResult =
  | { ok: true; method: PurchaseMethod; displayPrice: string }
  | { ok: false; cancelled?: boolean; needsMock?: boolean; error?: string };

export type StoreAvailability = {
  available: boolean;
  displayPrice: string;
  /** True when we should show the mock card sheet (web / Expo Go / missing product). */
  useMockCheckout: boolean;
};

function isNativeStorePlatform(): boolean {
  return Platform.OS === 'ios' || Platform.OS === 'android';
}

/**
 * Probe whether App Store / Play Billing can handle the restart product.
 * Falls back to mock checkout on web, Expo Go, or when the product is not configured.
 */
export async function getRestartStoreAvailability(): Promise<StoreAvailability> {
  if (!isNativeStorePlatform()) {
    return {
      available: false,
      displayPrice: RESTART_PRICE_LABEL,
      useMockCheckout: true,
    };
  }

  try {
    const iap = await import('expo-iap');
    await iap.initConnection();
    const products = await iap.fetchProducts({
      skus: [RESTART_PRODUCT_ID],
      type: 'in-app',
    });
    const product = products?.[0];
    const displayPrice =
      (product && 'displayPrice' in product && product.displayPrice) ||
      RESTART_PRICE_LABEL;

    if (!product) {
      return {
        available: false,
        displayPrice,
        useMockCheckout: true,
      };
    }

    return {
      available: true,
      displayPrice: String(displayPrice),
      useMockCheckout: false,
    };
  } catch {
    return {
      available: false,
      displayPrice: RESTART_PRICE_LABEL,
      useMockCheckout: true,
    };
  }
}

/**
 * Start a real StoreKit / Play Billing purchase for the consumable restart.
 * Call only when `getRestartStoreAvailability().available` is true.
 */
export async function purchaseRestartViaStore(): Promise<PurchaseRestartResult> {
  if (!isNativeStorePlatform()) {
    return { ok: false, needsMock: true };
  }

  try {
    const iap = await import('expo-iap');
    await iap.initConnection();

    const products = await iap.fetchProducts({
      skus: [RESTART_PRODUCT_ID],
      type: 'in-app',
    });
    const product = products?.[0];
    if (!product) {
      return { ok: false, needsMock: true, error: 'restart product not found in store' };
    }

    const displayPrice =
      ('displayPrice' in product && product.displayPrice
        ? String(product.displayPrice)
        : RESTART_PRICE_LABEL);

    return await new Promise<PurchaseRestartResult>((resolve) => {
      let settled = false;

      const finish = (result: PurchaseRestartResult) => {
        if (settled) return;
        settled = true;
        successSub.remove();
        errorSub.remove();
        resolve(result);
      };

      const successSub = iap.purchaseUpdatedListener(async (purchase) => {
        if (purchase.productId !== RESTART_PRODUCT_ID) return;
        try {
          await iap.finishTransaction({ purchase, isConsumable: true });
          finish({ ok: true, method: 'store', displayPrice });
        } catch (err) {
          finish({
            ok: false,
            error: err instanceof Error ? err.message.toLowerCase() : 'could not finish purchase',
          });
        }
      });

      const errorSub = iap.purchaseErrorListener((error) => {
        const code = String(error.code ?? '').toLowerCase();
        const cancelled =
          code.includes('user-cancelled') ||
          code.includes('usercancelled') ||
          code.includes('cancelled');
        if (cancelled) {
          finish({ ok: false, cancelled: true });
          return;
        }
        finish({
          ok: false,
          error: (error.message || 'purchase failed').toLowerCase(),
        });
      });

      void iap
        .requestPurchase({
          request: {
            apple: { sku: RESTART_PRODUCT_ID },
            google: { skus: [RESTART_PRODUCT_ID] },
          },
          type: 'in-app',
        })
        .catch((err: unknown) => {
          finish({
            ok: false,
            needsMock: true,
            error: err instanceof Error ? err.message.toLowerCase() : 'store unavailable',
          });
        });
    });
  } catch (err) {
    return {
      ok: false,
      needsMock: true,
      error: err instanceof Error ? err.message.toLowerCase() : 'store unavailable',
    };
  }
}

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
  await new Promise((r) => setTimeout(r, 600));

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
