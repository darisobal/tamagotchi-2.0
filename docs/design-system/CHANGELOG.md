# Design system changes

## 0.1.1 — 2026-11-18

Published a compatible correction restoring the original ground vector (`4727:180`) inside `pet-stage`'s idle variant. The path remains editable and its stroke is bound to `color/art/ink`. Figma published the updated pet-stage and its calendar dependencies; no component properties or token contracts changed.

Enabled the library in Business Visual and built four connected examples on a separate page: 320/430 px daily screens, a calendar and a 1024 px web screen. Verified 122 remote instances, imported spacing/text/gradient assets, the expected fonts, and no complete-screen rasters or unstyled text. Accepted the published patch in the consumer file and confirmed the ground appeared in all three existing idle instances while their overrides remained intact. The final binding audit passed for 261 solid paints and 56 styled text layers in main definitions.

Setup is complete. Developer dispatch awaits identification of the intended chat. Application migration and Code Connect have not started.

## 0.1.0 — 2026-11-18

Created [Tamagotchi design system](https://www.figma.com/design/rVMEM0ZI5L0oyzZtIQibkp) in the existing Business Professional plan. No new subscription or separate repository was needed.

- Added 69 variables: 20 primitives, 29 semantic colors and 20 dimensions. Semantic colors alias primitives; scopes and web code names were verified.
- Added eight shared text styles and a native page-gradient style.
- Built 12 component families with 49 variants, plus five supporting artwork/option components.
- Preserved the original pet paths, hats, confetti, rain, hearts and rainbow as native editable vectors. The source page still has its original seven frames; transfer copies were removed.
- Added component descriptions, editable properties, nested instances, color bindings, and nine application review screens.
- Reviewed controls, pet scenes, typography, colors, calendar alignment, long content, 320/430 px phone layouts and a 1024 px web layout. No complete-screen raster images or unstyled text remain in the review screens.
- Verified all 260 solid paints in main component definitions and their display boards are bound to variables, and all 56 text layers use shared styles. Nested instances retain their source bindings. Error fields always show their message; optional help remains a separate property.

Extensions beyond the source: hover/focus/pressed/disabled/loading/error states, a compact title style, a contained feedback variant, an explicit no-accessory option, and wrapping controls. Supporting/calendar line heights are normalized to 28/18 px. Review copy is lowercase and uses neutral missed-day feedback. Original reference copy and vector lettering remain intact.

Moved the file from Business Drafts into Team project and published all 69 variables, nine styles and 17 component assets. The subsequent patch release records the completed cross-file import and update test.

The public app repository was inspected: `darisobal/tamagotchi-2.0`, main at `738299e` at the recorded inspection. Open PRs #1 and #3 were left untouched. The small design registry stays with the app; the visual library is maintained separately in Figma.
