import { advanceClock, failClock, rewardClock, formatHabitTimer, localDay, HabitClock } from '../habitClock';
import { calendarStatus, loggedMonths, groupFailuresByDay } from '../calendar';

const hour = 3600000;
const start = new Date(2026, 10, 1, 10).getTime();
const clock = (periodMs = 24 * hour): HabitClock => ({ deadlineAt: start + periodMs, periodMs, failures: 0, lastFailureDay: null, rewardedDay: null });

test.each([24, 48, 168])('a success adds %sh to the remaining balance, without a cap', hours => {
  const result = rewardClock(clock(hours * hour), start + 4 * hour, hours * hour);
  expect(result.deadlineAt - (start + 4 * hour)).toBe((hours * 2 - 4) * hour);
  expect(rewardClock(result, start + 5 * hour, hours * hour)).toEqual(result);
});
test('calendar question readiness is independent of a banked deadline', () => {
  const beforeMidnight = new Date(2026, 10, 1, 23, 59, 59).getTime();
  const result = rewardClock(clock(), beforeMidnight, 24 * hour);
  expect(result.rewardedDay).toBe(localDay(beforeMidnight));
  expect(result.rewardedDay).not.toBe(localDay(beforeMidnight + 1000));
  expect(result.deadlineAt).toBe(start + 48 * hour);
});
test('manual failure counts once per day and success restores parts without erasing history', () => {
  const failed = failClock(clock(), start + hour);
  expect(failClock(failed, start + 2 * hour).failures).toBe(1);
  const restored = rewardClock(failed, start + 3 * hour, 24 * hour);
  expect(restored.failures).toBe(0);
  expect(restored.history).toHaveLength(1);
  expect(failClock(restored, start + 4 * hour)).toEqual(restored);
});
test('offline deadlines detach five parts then stop; replay is idempotent', () => {
  const result = advanceClock(clock(), start + 100 * 24 * hour);
  expect(result.failures).toBe(5);
  expect(result.history?.map(f => f.level)).toEqual([1, 2, 3, 4, 5]);
  expect(advanceClock(result, start + 101 * 24 * hour)).toEqual(result);
  expect(() => rewardClock(result, start + 101 * 24 * hour, 24 * hour)).toThrow();
});
test('manual and expired failure on the same date do not remove two parts', () => {
  const failed = failClock(clock(), start + 23 * hour);
  expect(advanceClock(failed, start + 24 * hour).failures).toBe(1);
  expect(advanceClock(failed, start + 48 * hour).failures).toBe(2);
});
test('weekly expiry advances by one week, not by a calendar day', () => {
  const result = advanceClock(clock(168 * hour), start + 169 * hour);
  expect(result.failures).toBe(1);
  expect(result.deadlineAt).toBe(start + 336 * hour);
});
test('failure months and stages appear in Progress, later recovery wins that date', () => {
  const failed = failClock(clock(), start + hour);
  const history = failed.history!;
  const record = groupFailuresByDay(history)[localDay(start)];
  expect(loggedMonths([], history)).toEqual([{ year: 2026, month: 10 }]);
  expect(calendarStatus(record.day, [], record.day, record)).toBe('missed');
  expect(calendarStatus(record.day, [{ id: 's', timestamp: new Date(start + 2 * hour).toISOString(), trackType: 'main', intensity: 'medium', note: null }], record.day, record)).toBe('success');
});
test('timer uses days at 48 hours and seconds below it', () => {
  expect(formatHabitTimer(72 * hour)).toBe('3 days left');
  expect(formatHabitTimer(48 * hour)).toBe('2 days left');
  expect(formatHabitTimer(48 * hour - 1000)).toBe('47:59:59 left');
  expect(formatHabitTimer(0)).toBe('00:00:00 left');
});
