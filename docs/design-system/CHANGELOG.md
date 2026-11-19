# Design system changes

## 0.2.0 — 2026-11-18

Reconciled Darya’s approved application changes in the published Figma library and connected designs. Original capitalization replaces normalized lowercase; pet scenes retain 382×438 proportions, setup places the name above a hatless pet, and long names grow safely. Setup now exposes Check in every with 24h / 48h / Weekly. Added the shared white SelectionOption family, wrapped SelectionTile around it, corrected colour circles/dots, and retained explicit focus/disabled states.

Rebuilt the calendar as transparent shared outlined cells with a month-year title, real Monday-first dates, an explicit missing state and saved-month links. Renamed month-chip to month-link without changing its ID/key. Removed coupon/detail UI from current examples and documented the approved preserved-data boundary.

The library retains 69 variables and eight base typography styles, with nine Figma-only responsive styles. It now has 13 component families, 54 variants and five supporting assets. Reviewed 15 library screens and 15 connected screens at 320/350/430px plus 1024px web. All 302 consumer instances remain remote; the seven original reference frames remain intact.

Verified 297 bound solid paints and 61 styled text layers in main definitions. Corrected stale white field and coral artwork fallback colours without changing token bindings or vector geometry. Accepted an existing calendar update with its override preserved; resolved stale builder imports through current remote IDs. See reconciliation-verification.json for evidence. Application adoption remains pending the shared disabled-selection correction and remaining device/accessibility checks; the latest implementation run reported 96 passing tests. No app source, merge, deployment or account upgrade was part of this reconciliation.

## 0.1.1 — 2026-11-18

Published a compatible correction restoring the original ground vector (`4727:180`) inside `pet-stage`'s idle variant. The path remains editable and its stroke is bound to `color/art/ink`. Figma published the updated pet-stage and its calendar dependencies; no component properties or token contracts changed.

Enabled the library in Business Visual and built four connected examples on a separate page: 320/430 px daily screens, a calendar and a 1024 px web screen. Verified 122 remote instances, imported spacing/text/gradient assets, the expected fonts, and no complete-screen rasters or unstyled text. Accepted the published patch in the consumer file and confirmed the ground appeared in all three existing idle instances while their overrides remained intact. The final binding audit passed for 261 solid paints and 56 styled text layers in main definitions.

Setup is complete. The records were pushed in draft PR #6, and the handoff was dispatched to the new “Implement Tamagotchi design system” chat at Darya's request. Application migration and Code Connect are tracked separately in that chat.

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

## Historical application correction — before v0.2.0

- Preserve the original 382 × 438 card proportions across all states and calendar previews.
- Supersede the lowercase-only application rule with original Figma capitalization at the user's request. Published library version remains 0.1.1.
