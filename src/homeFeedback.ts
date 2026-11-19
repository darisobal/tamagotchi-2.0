import { toDateString } from './logic';
import { CheckIn, MAIN_TRACK } from './types';

/** Success feedback resets each local calendar day, independently of the streak. */
export function successStageForDay(checkIns: CheckIn[], now = new Date()): 'success' | 'double-success' {
  const today = toDateString(now);
  const count = checkIns.filter(checkIn =>
    checkIn.trackType === MAIN_TRACK && toDateString(new Date(checkIn.timestamp)) === today
  ).length;
  return count > 1 ? 'double-success' : 'success';
}
