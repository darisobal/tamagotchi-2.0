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
 * Returns null only when unconfigured or no row exists; network errors must not be mistaken for an empty account.
 */
export async function pullUserSnapshot(userId: string): Promise<UserSnapshot | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from(TABLE)
    .select('snapshot')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw new Error('could not load your saved account. your local progress is safe.');
  if (!data?.snapshot) return null;
  return data.snapshot as UserSnapshot;
}

/** Push local state to Supabase so it follows the user across devices. */
export async function pushUserSnapshot(userId: string, snapshot: UserSnapshot): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;

  const { error } = await supabase.from(TABLE).upsert(
    {
      user_id: userId,
      snapshot,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  );
  if (error) throw new Error('progress is saved on this device; cloud sync could not finish.');
}

export function canSyncToCloud(): boolean {
  return isSupabaseConfigured;
}

/** First guest upload is conditional: a concurrently created cloud plan must survive. */
export async function createUserSnapshot(userId: string, snapshot: UserSnapshot, expectedEmpty: UserSnapshot | null = null): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;
  if (expectedEmpty) {
    // Compare-and-swap the exact verified empty snapshot, never a changed plan.
    const { data, error } = await supabase.from(TABLE)
      .update({ snapshot, updated_at: new Date().toISOString() })
      .eq('user_id', userId).eq('snapshot', JSON.stringify(expectedEmpty))
      .select('user_id').maybeSingle();
    if (error) throw new Error('could not save your guest progress to the account.');
    return Boolean(data);
  }
  const { error } = await supabase.from(TABLE).insert({ user_id: userId, snapshot, updated_at: new Date().toISOString() });
  if (error?.code === '23505') return false;
  if (error) throw new Error('could not save your guest progress to the account. it is still safe on this device.');
  return true;
}
