import { successStageForDay } from '../homeFeedback';
import { CheckIn } from '../types';

const entry = (day: number, hour = 12): CheckIn => ({
  id: `${day}-${hour}`, trackType: 'main', intensity: 'medium', note: null,
  timestamp: new Date(2026, 10, day, hour).toISOString(),
});
const today = new Date(2026, 10, 18, 23, 59);

test('first success today ignores previous days in a streak', () => {
  expect(successStageForDay([entry(17), entry(17, 13), entry(18)], today)).toBe('success');
});
test.each([2, 3, 4])('%i successes today keep double success', count => {
  expect(successStageForDay(Array.from({ length: count }, (_, i) => entry(18, i)), today)).toBe('double-success');
});
test('resets at the next local midnight', () => {
  expect(successStageForDay([entry(18), entry(18, 23), entry(19, 0)], new Date(2026, 10, 19, 0, 1))).toBe('success');
});
