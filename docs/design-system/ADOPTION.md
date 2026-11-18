# Application adoption — library v0.1.1

Implemented on `codex/tamagotchi-redesign`, based on setup commit `9aa1e65`. The application is in draft review in [PR #7](https://github.com/darisobal/tamagotchi-2.0/pull/7); adoption is not marked complete because remaining device/accessibility review and Code Connect publication remain open. This does not change the published Figma library version or merge setup PR #6.

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

The payment action adds a contextual loading label (`processing…` / `waiting for store…`) to the shared button. Its default loading copy remains the library's `saving…`. Password inputs remain single-line; general text fields grow with their content. Fields with a submit action now submit and blur on the keyboard action key on iOS and web; ordinary multiline notes retain line breaks. Capitalization now follows the original Figma designs and sentence case in supporting flows; user values, locale-formatted dates and external messages are no longer forced to lowercase.

## Validation — 18 November 2026

| Check | Result |
| --- | --- |
| Unit tests | 91 tests across 12 suites passed, including five calendar tests and the existing cadence, rewards, purchases, sync and onboarding suites. |
| Web production export | Passed; 13 routes; temporary visual fixtures removed. |
| iOS / Android production exports | Both passed, including local SVG assets and fonts. These are bundle checks, not device interaction tests. |
| TypeScript | Seven existing errors remain in `EmptyFace.tsx`, `LineArtPet.tsx`, `PetFigure.tsx` and `widgets/PetStatusWidget.tsx`. Baseline `9aa1e65` has nine errors with the same installed dependencies; none were introduced by the migrated code. |
| Web runtime | Local-only onboarding, saved setup choices/reload, successful check-in/confirmation, coupon collection/access, calendar navigation/details, and continue-to-prompt checked. No cloud data or real payments used. |
| Responsive / states | 320, 430 and 1024 px inspected. Long name/habit/action text, selected colours, keyboard focus, hover/pressed, disabled/loading and field errors checked. Missed/double-success poses checked through temporary local fixtures. |
| iOS runtime | iPhone 16 Plus, iOS 18.6, Expo Go 54.0.7: local onboarding, software-keyboard next, growing long fields, setup saving, fonts/SVGs, safe areas, check-in confirmation, reward collection, success/continue and calendar record/details checked. Controls below the viewport were invoked through accessibility actions; this does not establish touch reachability. |
| Native scrolling / remaining review | Resolved on iPhone Simulator: Darya confirmed click-and-hold upward dragging scrolls on 18 November 2026. The scrolled home screen shows Continue and Details above the tab bar. Automated dragging behaves like a tap and is not reliable evidence of scroll failure. Setup colour and interval selections were checked through accessibility actions; Android runtime and VoiceOver/TalkBack remain open. |
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
- [iPhone confirmation with visible actions](validation/ios-confirmation.png)
- [iPhone success with a long goal, initial viewport](validation/ios-success-long-goal.png)

Before adoption is complete: finish Android and screen-reader review, publish Code Connect when the workspace supports it, and review the draft application PR. Nothing was merged or deployed.

## Card proportions and capitalization correction — 18 November 2026

The shared stage now scales a single 382 × 438 canvas uniformly instead of shrinking width while retaining a fixed height. Setup, idle, success, missed and double-success were reviewed on web at 320 and 430 px and on iPhone 16 Plus. Cards measure 272 × 311.87 at 320 px and 382 × 438 at 430 px; the wide layout retains 382 × 438. Calendar miniatures use the same proportions. A wrapped setup name extends its container without stretching the artwork. Setup uses the source white card and hat-free pet.

Original Figma source nodes: 4727:145, 4727:181, 4727:228, 4727:265 and 4727:1899 in eU62JH6PqW61UeGlLaGk7T. Screenshots: `validation/proportions-{state}-{430|ios}.png`.

At the user's request, original Figma capitalization supersedes the v0.1.1 lowercase examples throughout the application. The lowercase Cursor rule was removed and AGENTS.md updated. Supporting flows use sentence case; user values and locale formatting retain their casing. This is an application correction, not a new Figma library publication.

Validation: 91 tests pass; seven existing type errors remain, with no new errors. Native state artwork was inspected before the Mac relocked; the scrolling report was subsequently resolved by user-confirmed manual dragging (see below).

## Setup and screen-detail review — 18 November 2026

Compared the running setup with source 4727:1899, and home with source 4727:145/181/228/265. Setup now follows Name → Colour → Hair → Clothes → Habit → Check In. At 430 px, label tops match the source exactly: 603, 755, 903, 1051, 1199 and 1351 px. Fields retain the source white fill, 72 px height, 24 px text inset and 16 px label gap. Sections have 36 px spacing. The card remains white, bordered and proportional.

Colour options are 68 px circles in one horizontally scrollable row, separated by 12 px, with a 10 px selected dot. They use dynamic native controls so saved custom colours remain supported. The selected accessory tile is white with a 2 px outline; empty source placeholders are not exposed as fake choices. Check In uses the source Every / 24h layout and opens the existing 24-hour, 48-hour and weekly choices when pressed. Values remain editable and Save retains its existing persistence behavior.

Home restores the idle white question card, source feedback widths and spacing, source action labels, and exact idle arrow/ground positioning. Calendar columns and status miniatures were visually checked against the library frame; actual dates/history and existing navigation remain functional rather than copying static sample data.

Web checks: 430 px source coordinates, 320 px horizontal colour access and preview update, interval open/select/close, home idle and calendar. Evidence: `validation/detail-setup-430.png`, `validation/detail-home-idle.png`. The Mac was subsequently unlocked and this pass rechecked on iPhone (see below).

## iPhone follow-up — 18 November 2026

After unlocking, the revised setup card, wrapped name, Name-before-Colour order, white fields, horizontal colour row, selected dot, accessory tile outlines and Every / 24h control were inspected on iPhone 16 Plus / iOS 18.6. Purple then Coral selection and Daily → Every two days → Daily changes succeeded through accessibility actions. Original values were restored without saving new preferences. Darya confirmed manual touch-style scrolling works; the scrolled home shows its Continue action and Details. No app code change was needed for scrolling.

Evidence: `validation/ios-scroll-confirmed.png`, `validation/ios-setup-controls.png`. This closes the reported scrolling blocker, not the outstanding Android or screen-reader review.

## Responsive typography correction — 18 November 2026

Audit found that the pet canvas scaled to the available content width while typography, fields and colour controls retained their 430 px source sizes. At the roughly 350 px preview width this made text and controls oversized relative to the card. Shared ResponsiveText and ResponsiveTextInput now scale authored font size/line height by the same content ratio, capped at the original source size. Controls, option sizes, section gaps and page spacing scale with them. The discontinuous title breakpoint was replaced by proportional sizing.

At 350 px: 22 px reading/label text becomes 17.39 px, 42 px feedback becomes 33.20 px, and colour options become 53.76 px. At 320 px, primary reading text has a 16 px floor; existing 14 px calendar text and smaller navigation labels are preserved. Native accessibility font scaling is still enabled. At 430 px and wider, source typography and the 72 px field height are unchanged.

Applied to setup, home, progress, onboarding, auth/reset, check-in, confirmation, restart and profile/error flows via shared text and controls. Coupon/reward artwork already scales its typography with its own artboard and remains on that path to avoid double scaling. Web runtime checked setup at 320/350/430, home and confirmation at 350; calendar and supporting flow callsites audited. iPhone 16 Plus setup inspected with long name/habit values. Auth/recovery/store flows were source-audited, not newly transacted.

Validation: 94 tests / 13 suites pass, including proportional feedback and readable minimum checks. Seven baseline type errors remain, no new errors. Evidence: `validation/type-setup-350.png`, `validation/type-home-350.png`.
