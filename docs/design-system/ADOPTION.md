# Application adoption — library v0.1.1

Implemented on `codex/tamagotchi-redesign`, based on setup commit `9aa1e65`. The application is ready for draft review; adoption is not marked complete because native runtime review and Code Connect publication remain open. This does not change the published Figma library version or merge setup PR #6.

## Implementation

- Shared React Native controls, page layout, pet stages and calendar serve mobile and web. Hepta Slab headings and Aleo reading text use the published palette, outlines and radii. The content column is capped at 430 px; narrow titles and growing controls support 320 px layouts.
- Setup, home, progress, onboarding, authentication, password reset, check-in confirmation and restart checkout use the shared components. Existing storage, sync, auth and purchase implementations remain in place. Reward collection and check-in details/deletion remain accessible.
- Setup uses an explicit save action. Saved colours outside the new palette remain selectable. Legacy hat preferences remain stored, but the redesigned artwork uses the library poses and the authored `none` accessory choices. Existing selfie pets retain their home rendering.
- Home maps the existing mood and celebration count to library poses. Continue dismisses the celebration locally and returns to the question. A negative answer acknowledges “not yet” without writing a failed check-in. The existing cadence and three-heart rules still determine missed/dead states.
- Calendar dates are generated locally, Monday first, including leap years and year boundaries. Missing records are never inferred to be failures. Multiple check-ins share a double-success cell; paid restarts remain in accessible labels and details. Month navigation includes a return to this month when needed.
- Existing setup/home/progress navigation remains because the source provides no opened menu or new routing contract. No accessory artwork or destinations were invented.

## Artwork and component correspondence

The 22 SVG files in `assets/design-system` came from the published library's design context. [artwork-provenance.json](artwork-provenance.json) records the source frame/control, exported name and checksum. Original SVG paths and root dimensions are unchanged. `Artwork.tsx` places the exported pieces at their original geometry and scales wrappers proportionally. The separately exported body fill (`6dd10`) is black in the export; its fill is bound at runtime to the saved pet colour. Swatch fill is similarly bound without changing its black selection ring. The missed pose remains black.

[application-components.json](application-components.json) records the verified Figma-to-source correspondence for all 12 component families. These are source references, not published Code Connect mappings. The connected Business workspace reports a Professional plan; the Code Connect workflow requires an Organization or Enterprise plan. Publication was not attempted and no account plan was changed.

The payment action adds a contextual loading label (`processing…` / `waiting for store…`) to the shared button. Its default loading copy remains the library's `saving…`. Password inputs remain single-line; general text fields grow with their content.

## Validation — 18 November 2026

| Check | Result |
| --- | --- |
| Unit tests | 91 tests across 12 suites passed, including five calendar tests and the existing cadence, rewards, purchases, sync and onboarding suites. |
| Web production export | Passed; 13 routes; temporary visual fixtures removed. |
| iOS / Android production exports | Both passed, including local SVG assets and fonts. These are bundle checks, not device interaction tests. |
| TypeScript | Seven existing errors remain in `EmptyFace.tsx`, `LineArtPet.tsx`, `PetFigure.tsx` and `widgets/PetStatusWidget.tsx`. Baseline `9aa1e65` has nine errors with the same installed dependencies; none were introduced by the migrated code. |
| Web runtime | Local-only onboarding, saved setup choices/reload, successful check-in/confirmation, coupon collection/access, calendar navigation/details, and continue-to-prompt checked. No cloud data or real payments used. |
| Responsive / states | 320, 430 and 1024 px inspected. Long name/habit/action text, selected colours, keyboard focus, hover/pressed, disabled/loading and field errors checked. Missed/double-success poses checked through temporary local fixtures. |
| Native runtime | iPhone simulator prepared with Expo Go; inspection blocked by the locked Mac. iOS and Android keyboard, safe-area, screen-reader and interaction checks remain open. |
| External flows | Live Supabase email/recovery/sync and store purchase transactions were not exercised. Their existing code and unit coverage are retained. |

Review passed internally for necessity/clarity, then consistency/visual focus. It found and corrected a split narrow “coupons” label, long-name clipping, selected month visibility and loading text contrast.

## Review images

- [Home, idle, 430 px](validation/home-idle-430.jpg)
- [Home, success, 1024 px](validation/home-success-1024.jpg)
- [Calendar, 320 px](validation/calendar-320.jpg)
- [Setup, 430 px](validation/setup-430.jpg)
- [Long pet name, 320 px](validation/setup-long-name-320.jpg)
- [Double-success fixture, 430 px](validation/double-success-430.jpg)
- [Control fixture, 320 px](validation/controls-320.jpg)

Before adoption is complete: inspect the native runtime, publish Code Connect when the workspace supports it, and review the draft application PR. Nothing was merged or deployed.
