# Layout System Documentation

## Overview
This document explains the consistent layout system implemented to ensure buttons are always visible and clickable across all screen sizes.

## Problem
On smaller screens, buttons at the bottom of screens (especially on the home screen when the pet has died) were being cut off or overlapping with the tab bar, making them difficult or impossible to click.

## Solution Architecture

### Layout Structure
Every screen with the standard layout follows this vertical structure:

```
┌─────────────────────────────┐
│ Safe Area Top               │
├─────────────────────────────┤
│ Title Section (~106px)      │
│ - Greeting text             │
│ - Pet lives icons           │
├─────────────────────────────┤
│ Pet Stage (Dynamic)         │
│ ┌─────────────────────────┐ │
│ │ Padding (40px)          │ │
│ │ ┌─────────────────────┐ │ │
│ │ │   Egg (Dynamic)     │ │ │
│ │ │   with Pet inside   │ │ │
│ │ └─────────────────────┘ │ │
│ │ Padding (40px)          │ │
│ └─────────────────────────┘ │
├─────────────────────────────┤
│ Hero Card (~180px min)      │
│ - Habit name                │
│ - Motto                     │
│ - (Button when alive)       │
├─────────────────────────────┤
│ Button (when dead)          │
│ 56px + margins              │
├─────────────────────────────┤
│ Bottom Padding              │
│ - Base padding (48px)       │
│ - Tab bar clearance         │
│ - Extra safety (16px)       │
├─────────────────────────────┤
│ Tab Bar                     │
├─────────────────────────────┤
│ Safe Area Bottom            │
└─────────────────────────────┘
```

## Key Components

### 1. Responsive Egg Sizing (`useResponsiveEggSize`)
- **Purpose**: Dynamically calculate egg dimensions based on available screen space
- **Constraints**: 
  - Minimum: 220px width
  - Maximum: 300px width
  - Maintains aspect ratio (100:120)
- **Calculation**: Works backwards from available space after accounting for all fixed elements

### 2. Bottom Padding (`useBottomPadding`)
- **Purpose**: Ensure consistent spacing below scrollable content
- **Components**:
  - Base padding: 48px (Spacing.xxl)
  - Tab bar height + safe area bottom
  - Additional clearance: 16px
- **Result**: Buttons always have adequate space above tab bar

### 3. Layout Constants
- `BUTTON_TAB_CLEARANCE`: 16px - minimum space between button and tab bar
- `BUTTON_RESERVED_SPACE`: 56px + margins + clearance
- `TITLE_SECTION_HEIGHT`: ~106px - greeting + lives
- `HERO_CARD_MIN_HEIGHT`: ~180px - minimum card size
- `PET_STAGE_VERTICAL_PADDING`: 80px - padding around egg
- `MAX_EGG_WIDTH`: 300px - upper limit
- `MIN_EGG_WIDTH`: 220px - lower limit

## Usage

### In a Screen Component
```typescript
import { useResponsiveEggSize, useBottomPadding } from '../../src/layoutSystem';

function MyScreen() {
  const { eggWidth, eggHeight, stageHeight } = useResponsiveEggSize();
  const bottomPadding = useBottomPadding();

  return (
    <SafeAreaView>
      <ScrollView
        contentContainerStyle={{ paddingBottom: bottomPadding }}
      >
        {/* Your content */}
        <PetStage 
          eggWidth={eggWidth}
          eggHeight={eggHeight}
          stageHeight={stageHeight}
        />
        {/* More content */}
      </ScrollView>
    </SafeAreaView>
  );
}
```

## Screens Using This System
- **Home Screen** (`app/(tabs)/index.tsx`): Full layout with responsive egg
- **Settings Screen** (`app/(tabs)/settings.tsx`): Consistent bottom padding
- **History Screen** (`app/(tabs)/history.tsx`): Consistent bottom padding

## Benefits
1. **Universal Compatibility**: Works on all screen sizes from small phones to tablets
2. **Guaranteed Accessibility**: Buttons are never obscured by tab bar
3. **Consistent UX**: Same spacing rules across all screens
4. **Maintainable**: Central location for layout logic
5. **Adaptive**: Automatically adjusts to different aspect ratios

## Technical Details

### Calculation Flow
1. Get window dimensions and safe area insets
2. Calculate total available height:
   ```
   availableHeight = windowHeight - safeTop - safeBottom - tabBarPad - basePadding
   ```
3. Subtract space for non-egg elements:
   ```
   nonEggSpace = title + card + button + padding
   ```
4. Calculate egg size that fits in remaining space:
   ```
   spaceForEgg = availableHeight - nonEggSpace
   eggWidth = clamp(spaceForEgg * aspectRatio, MIN, MAX)
   ```
5. Derive egg height and stage height from egg width

### Edge Cases Handled
- **Very small screens**: Egg shrinks to minimum size (220px)
- **Very large screens**: Egg caps at maximum size (300px)
- **Dead pet state**: Button rendered outside card still has clearance
- **Keyboard shown**: KeyboardAvoidingView handles input visibility
- **Different safe area insets**: Automatically accounts for notches, etc.

## Future Improvements
Consider adding:
- Device-specific presets for common screen sizes
- Orientation change handling (if landscape supported)
- Animation between layout states
- User preference for egg size within constraints
