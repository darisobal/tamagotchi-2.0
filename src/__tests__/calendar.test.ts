import { buildMonthGrid, loggedMonths, calendarStatus, groupCheckInsByDay, planDayNumber } from '../calendar';
import { CheckIn } from '../types';

const checkIn = (timestamp: string, id = timestamp): CheckIn => ({ id, timestamp, trackType: 'main', intensity: 'medium', note: null });

describe('progress calendar', () => {
  it('aligns November 2026 to Monday-first weeks', () => {
    const grid = buildMonthGrid(2026, 10);
    expect(grid.slice(0, 6)).toEqual(Array(6).fill(null));
    expect(grid[6]).toEqual({ date: '2026-11-01', day: 1 });
    expect(grid[35]).toEqual({ date: '2026-11-30', day: 30 });
    expect(grid).toHaveLength(42);
  });
  it('handles leap years, December rollover, and Monday starts', () => {
    expect(buildMonthGrid(2024, 1).filter(Boolean)).toHaveLength(29);
    expect(buildMonthGrid(2025, 1).filter(Boolean)).toHaveLength(28);
    expect(buildMonthGrid(2026, 12).find(Boolean)?.date).toBe('2027-01-01');
    expect(buildMonthGrid(2026, 5)[0]?.day).toBe(1);
  });
  it('does not turn missing history into failure', () => {
    expect(calendarStatus('2026-11-01', [], '2026-11-18')).toBe('missing');
    expect(calendarStatus('2026-11-18', [], '2026-11-18')).toBe('missing');
    expect(calendarStatus('2026-11-19', [], '2026-11-18')).toBe('future');
  });
  it('uses local dates and distinguishes repeated successes without changing entries', () => {
    const first = checkIn(new Date(2026, 10, 18, 0, 10).toISOString(), 'first');
    const second = checkIn(new Date(2026, 10, 18, 23, 55).toISOString(), 'second');
    const days = groupCheckInsByDay([first, second]);
    expect(days['2026-11-18']).toEqual([second, first]);
    expect(calendarStatus('2026-11-18', [first], '2026-11-18')).toBe('success');
    expect(calendarStatus('2026-11-18', days['2026-11-18'], '2026-11-18')).toBe('double-success');
  });
  it('counts plan days across DST using calendar dates and guards legacy missing anchors', () => {
    expect(planDayNumber(new Date(2026, 2, 28, 23).toISOString(), [], new Date(2026, 2, 30, 1))).toBe(3);
    expect(planDayNumber(null, [], new Date(2026, 10, 18))).toBe(1);
    expect(planDayNumber('invalid')).toBe(1);
  });
});

describe('logged month navigation', () => {
  it('omits empty months and deduplicates entries within each local month', () => {
    expect(loggedMonths([
      checkIn(new Date(2026, 9, 3).toISOString()),
      checkIn(new Date(2026, 9, 9).toISOString()),
      checkIn(new Date(2026, 11, 1).toISOString()),
      checkIn(new Date(2025, 11, 31).toISOString()),
      checkIn('invalid'),
    ])).toEqual([{ year: 2026, month: 9 }, { year: 2026, month: 11 }, { year: 2025, month: 11 }]);
    expect(loggedMonths([])).toEqual([]);
  });
});
