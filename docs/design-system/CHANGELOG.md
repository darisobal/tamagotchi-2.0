# Design system changes

## 0.1.0-draft — 2026-11-18

Created [Tamagotchi design system](https://www.figma.com/design/rVMEM0ZI5L0oyzZtIQibkp) in the existing Business Professional plan. No new subscription or separate repository was needed.

- Added 69 variables: 20 primitives, 29 semantic colors and 20 dimensions. Semantic colors alias primitives; scopes and web code names were verified.
- Added eight shared text styles and a native page-gradient style.
- Built 12 component families with 49 variants, plus five supporting artwork/option components.
- Preserved the original pet paths, hats, confetti, rain, hearts and rainbow as native editable vectors. The source page still has its original seven frames; transfer copies were removed.
- Added component descriptions, editable properties, nested instances, color bindings, and nine application review screens.
- Reviewed controls, pet scenes, typography, colors, calendar alignment, long content, 320/430 px phone layouts and a 1024 px web layout. No complete-screen raster images or unstyled text remain in the review screens.
- Verified all 260 solid paints in main component definitions and their display boards are bound to variables, and all 56 text layers use shared styles. Nested instances retain their source bindings. Error fields always show their message; optional help remains a separate property.

Extensions beyond the source: hover/focus/pressed/disabled/loading/error states, a compact title style, a contained feedback variant, an explicit no-accessory option, and wrapping controls. Supporting/calendar line heights are normalized to 28/18 px. Review copy is lowercase and uses neutral missed-day feedback. Original reference copy and vector lettering remain intact.

Publication is pending. Figma requires moving the file from Drafts into a team folder; the Mac locked during that action. Cross-file import and update propagation are not yet verified. Application implementation and Code Connect mappings have not started.

The public app repository was inspected: `darisobal/tamagotchi-2.0`, main at `738299e` at the recorded inspection. Open PRs #1 and #3 were left untouched. The small design registry stays with the app; the visual library is maintained separately in Figma.
