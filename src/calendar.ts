import { CheckIn } from './types';
import { toDateString } from './logic';

export type CalendarStatus = 'future' | 'missing' | 'success' | 'double-success' | 'missed';
export type MonthCell = { date: string; day: number } | null;

/** Monday-first local calendar, including only enough empty cells to finish the final week. */
export function buildMonthGrid(year: number, month: number): MonthCell[] {
  const first = (new Date(year, month, 1).getDay() + 6) % 7;
  const count = new Date(year, month + 1, 0).getDate();
  const cells: MonthCell[] = Array.from({ length: first }, () => null);
  for (let day = 1; day <= count; day++) cells.push({ date: toDateString(new Date(year, month, day)), day });
  while (cells.length % 7) cells.push(null);
  return cells;
}

export function groupCheckInsByDay(checkIns: CheckIn[]) {
  const days: Record<string, CheckIn[]> = {};
  for (const checkIn of checkIns) {
    const date = new Date(checkIn.timestamp);
    if (!Number.isFinite(date.getTime())) continue;
    const key = toDateString(date);
    (days[key] ??= []).push(checkIn);
  }
  for (const entries of Object.values(days)) entries.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  return days;
}

/** No negative check-ins are persisted by the existing app. An absent entry never proves failure. */
export function calendarStatus(date: string, entries: CheckIn[] = [], today = toDateString(new Date())): CalendarStatus {
  if (date > today) return 'future';
  if (entries.length > 1) return 'double-success';
  if (entries.length === 1) return 'success';
  return 'missing';
}

export function planDayNumber(planStartedAt?: string | null, checkIns: CheckIn[] = [], now = new Date()): number {
  const first = planStartedAt ?? checkIns.map(entry => entry.timestamp).sort()[0];
  if (!first) return 1;
  const start = new Date(first);
  if (!Number.isFinite(start.getTime())) return 1;
  // Calendar days, not elapsed 24-hour periods (which differ across DST changes).
  return Math.max(1, Math.floor((Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) - Date.UTC(start.getFullYear(), start.getMonth(), start.getDate())) / 86400000) + 1);
}

/** Only months backed by valid persisted check-ins are navigation destinations. */
export function loggedMonths(checkIns: CheckIn[]) {
  const unique = new Map<string, { year: number; month: number }>();
  for (const entry of checkIns) {
    const date = new Date(entry.timestamp);
    if (!Number.isFinite(date.getTime())) continue;
    const year = date.getFullYear(), month = date.getMonth();
    unique.set(`${year}-${month}`, { year, month });
  }
  return [...unique.values()].sort((a, b) => b.year - a.year || a.month - b.month);
}
