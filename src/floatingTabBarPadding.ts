import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** Must match the gap used in `app/(tabs)/_layout.tsx` FloatingTabBar. */
export const FLOATING_TAB_BAR_BOTTOM_GAP = 12;

/**
 * Min height of the custom floating tab row (see `app/(tabs)/_layout.tsx`).
 * Used when `useBottomTabBarHeight()` is 0 because we don't use `BottomTabBar`.
 */
export const FLOATING_TAB_VISUAL_HEIGHT = 52;

/**
 * Extra bottom padding for scroll/content so it clears the floating tab panel.
 * Use with absolute `tabBarStyle` so the scene fills the screen behind the bar.
 */
export function useFloatingTabBarExtraPadding(): number {
  const measured = useBottomTabBarHeight();
  const tabBarInnerH = Math.max(measured, FLOATING_TAB_VISUAL_HEIGHT);
  const { bottom } = useSafeAreaInsets();
  const bottomPad = Math.max(bottom, FLOATING_TAB_BAR_BOTTOM_GAP) + 4;
  return tabBarInnerH + bottomPad + 8;
}
