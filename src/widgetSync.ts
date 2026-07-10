import { Mood } from './types';

/** No-op on SDK 54 / Expo Go. Re-enable when building with expo-widgets (SDK 55+ dev build). */
export async function syncPetStatusWidget(
  _mood: Mood,
  _lastCheckInAt: string | null,
  _periodMs: number,
): Promise<void> {}
