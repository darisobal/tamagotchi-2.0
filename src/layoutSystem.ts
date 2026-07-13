/**
 * Consistent layout system for screens with:
 * - Title
 * - Egg with pet
 * - Card/content
 * - Button
 *
 * This ensures buttons are always visible and clickable on all screen sizes.
 */

import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Spacing } from './theme';
import { useFloatingTabBarExtraPadding } from './floatingTabBarPadding';
import { petEggHeight } from './PetEggShell';

/**
 * Minimum clearance between bottom button and tab bar.
 * This ensures the button is never obscured and easy to tap.
 */
export const BUTTON_TAB_CLEARANCE = 16;

/**
 * Minimum vertical space reserved for button (height + margin).
 */
export const BUTTON_RESERVED_SPACE = 56 + Spacing.md + BUTTON_TAB_CLEARANCE;

/**
 * Title section approximate height (greeting + lives).
 */
export const TITLE_SECTION_HEIGHT = 52 + 4 + 42 + 8;

/**
 * Hero card approximate minimum height (when visible).
 */
export const HERO_CARD_MIN_HEIGHT = 180;

/**
 * Vertical padding around pet stage (top + bottom).
 */
export const PET_STAGE_VERTICAL_PADDING = 40 + 40;

/**
 * Maximum egg width on larger screens.
 */
export const MAX_EGG_WIDTH = 300;

/**
 * Minimum egg width on smaller screens.
 */
export const MIN_EGG_WIDTH = 220;

/**
 * Calculate responsive egg size based on available screen space.
 * Ensures the entire screen fits: title, egg, card, and button.
 */
export function useResponsiveEggSize() {
  const { height: windowHeight } = useWindowDimensions();
  const { top: safeTop, bottom: safeBottom } = useSafeAreaInsets();
  const tabBarExtraPad = useFloatingTabBarExtraPadding();

  // Available vertical space excluding safe areas and tab bar
  const availableHeight =
    windowHeight -
    safeTop -
    safeBottom -
    tabBarExtraPad -
    Spacing.lg - // top padding
    Spacing.xxl; // bottom base padding

  // Space needed for non-egg elements
  const nonEggSpace =
    TITLE_SECTION_HEIGHT +
    HERO_CARD_MIN_HEIGHT +
    BUTTON_RESERVED_SPACE +
    Spacing.sm + // gap between egg and card
    PET_STAGE_VERTICAL_PADDING;

  // Remaining space for egg
  const spaceForEgg = availableHeight - nonEggSpace;

  // Calculate egg width that fits in available space
  // Egg aspect ratio is 100:120 (width:height)
  const maxEggWidthForHeight = (spaceForEgg * 100) / 120;

  // Clamp between min and max
  const eggWidth = Math.max(
    MIN_EGG_WIDTH,
    Math.min(MAX_EGG_WIDTH, maxEggWidthForHeight)
  );

  const eggHeight = petEggHeight(eggWidth);
  const stageHeight = PET_STAGE_VERTICAL_PADDING + eggHeight;

  return {
    eggWidth,
    eggHeight,
    stageHeight,
  };
}

/**
 * Calculate proper bottom padding for ScrollView to ensure button visibility.
 */
export function useBottomPadding() {
  const tabBarExtraPad = useFloatingTabBarExtraPadding();
  // Add extra clearance to base padding
  return Spacing.xxl + tabBarExtraPad + BUTTON_TAB_CLEARANCE;
}
