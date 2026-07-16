import { useAppState } from './context';
import { getStateTheme } from './stateTheme';

/** Page + tab-bar background driven by the pet's current mood/state. */
export function useMoodBackground(): string {
  const { mood } = useAppState();
  return getStateTheme(mood).bg;
}
