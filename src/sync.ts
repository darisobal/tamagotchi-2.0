import { getSupabase, isSupabaseConfigured } from './supabase';
import { CheckIn, TrackState, UserPrefs } from './types';

export interface UserSnapshot {
  prefs: UserPrefs;
  tracks: TrackState[];
  checkIns: CheckIn[];
}

const TABLE = 'user_snapshots';

/**
 * Pull the user's saved snapshot from Supabase (if configured).
 * Returns null when offline, unconfigured, or no row yet.
 */
export async function pullUserSnapshot(userId: string): Promise<UserSnapshot | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from(TABLE)
    .select('snapshot')
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !data?.snapshot) return null;
  return data.snapshot as UserSnapshot;
}

/** Push local state to Supabase so it follows the user across devices. */
export async function pushUserSnapshot(userId: string, snapshot: UserSnapshot): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;

  await supabase.from(TABLE).upsert(
    {
      user_id: userId,
      snapshot,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  );
}

export function canSyncToCloud(): boolean {
  return isSupabaseConfigured;
}
