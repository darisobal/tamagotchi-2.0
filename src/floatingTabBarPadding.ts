import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Border, FontSize } from './theme';

/** Must match `app/(tabs)/_layout.tsx` BottomTextTabBar. */
export const TAB_BAR_DIVIDER = Border.tabDivider;
export const TAB_BAR_LABEL_LINE = FontSize.tab + 12;
export const TAB_BAR_INDICATOR_GAP = 7;
export const TAB_BAR_INDICATOR = Border.tabIndicator;
export const TAB_BAR_TOP_PAD = 12;

/**
 * Visual height of the flat bottom tab bar (divider + labels + active indicator).
 * Used when `useBottomTabBarHeight()` is 0 because we use a custom tab bar.
 */
export const TAB_BAR_VISUAL_HEIGHT =
  TAB_BAR_DIVIDER +
  TAB_BAR_TOP_PAD +
  TAB_BAR_LABEL_LINE +
  TAB_BAR_INDICATOR_GAP +
  TAB_BAR_INDICATOR;

/**
 * Extra bottom padding for scroll/content so it clears the bottom tab bar.
 */
export function useFloatingTabBarExtraPadding(): number {
  const measured = useBottomTabBarHeight();
  const tabBarInnerH = Math.max(measured, TAB_BAR_VISUAL_HEIGHT);
  const { bottom } = useSafeAreaInsets();
  return tabBarInnerH + bottom + 24;
}
