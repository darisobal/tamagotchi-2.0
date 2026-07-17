import AsyncStorage from '@react-native-async-storage/async-storage';

const PENDING_KEY = 'tamagotchi_pending_paid_restart';

/** Grant a one-shot entitlement after a successful €1 restart purchase. */
export async function grantPendingPaidRestart(): Promise<void> {
  await AsyncStorage.setItem(PENDING_KEY, '1');
}

export async function hasPendingPaidRestart(): Promise<boolean> {
  const v = await AsyncStorage.getItem(PENDING_KEY);
  return v === '1';
}

/**
 * Consume the pending restart entitlement.
 * Returns true if an entitlement was present and cleared.
 */
export async function consumePendingPaidRestart(): Promise<boolean> {
  const had = await hasPendingPaidRestart();
  if (!had) return false;
  await AsyncStorage.removeItem(PENDING_KEY);
  return true;
}

export async function clearPendingPaidRestart(): Promise<void> {
  await AsyncStorage.removeItem(PENDING_KEY);
}
