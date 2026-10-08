const mockSingle = jest.fn();
const mockInsert = jest.fn();
const mockUpsert = jest.fn();
const mockConditionalUpdate = jest.fn();
jest.mock('../supabase', () => ({
  isSupabaseConfigured: true,
  getSupabase: () => ({ from: () => ({
    select: () => ({ eq: () => ({ maybeSingle: mockSingle }) }),
    insert: mockInsert, upsert: mockUpsert,
    update: () => ({ eq: () => ({ eq: () => ({ select: () => ({ maybeSingle: mockConditionalUpdate }) }) }) }),
  }) }),
}));
import { createUserSnapshot, pullUserSnapshot, pushUserSnapshot } from '../sync';
import { normalizeUserPrefs } from '../types';
const snapshot = { prefs: normalizeUserPrefs({}), tracks: [], checkIns: [] };
beforeEach(() => jest.clearAllMocks());
test('network failure is not an empty cloud account', async () => {
  mockSingle.mockResolvedValue({ error: { message: 'offline' }, data: null });
  await expect(pullUserSnapshot('user')).rejects.toThrow('could not load');
  mockSingle.mockResolvedValue({ error: null, data: null });
  await expect(pullUserSnapshot('user')).resolves.toBeNull();
});
test('first guest transfer cannot overwrite a concurrently created account', async () => {
  mockInsert.mockResolvedValue({ error: { code: '23505' } });
  await expect(createUserSnapshot('user', snapshot)).resolves.toBe(false);
  expect(mockUpsert).not.toHaveBeenCalled();
  mockInsert.mockResolvedValue({ error: null });
  await expect(createUserSnapshot('user', snapshot)).resolves.toBe(true);
});
test('failed uploads surface failure so pending local edits are retained', async () => {
  mockUpsert.mockResolvedValue({ error: { message: 'offline' } });
  await expect(pushUserSnapshot('user', snapshot)).rejects.toThrow('saved on this device');
});

test('an existing empty snapshot is replaced only while it still matches', async () => {
  mockConditionalUpdate.mockResolvedValue({ data: null, error: null });
  await expect(createUserSnapshot('user', snapshot, snapshot)).resolves.toBe(false);
  mockConditionalUpdate.mockResolvedValue({ data: { user_id: 'user' }, error: null });
  await expect(createUserSnapshot('user', snapshot, snapshot)).resolves.toBe(true);
  expect(mockUpsert).not.toHaveBeenCalled();
});
