# Application adoption — current review

Figma library **v0.2.0** reconciles Darya’s approved implementation changes on 18 November 2026. The application’s last recorded adopted base version remains v0.1.1 until the developer verifies the new contract. [PR #7](https://github.com/darisobal/tamagotchi-2.0/pull/7) remains in draft; no merge or deployment was made.

The current contract is in [README.md](README.md), the verified [component correspondence](application-components.json), and [reconciliation evidence](reconciliation-verification.json). It supersedes the historical reward, details, month-chip and normalized-copy behavior described below. Setup now uses “Check in every” with 24h / 48h / Weekly; Progress uses the month-year title, shared outlined calendar cells and saved-month links. Coupon earning/overlays and home/progress detail controls are removed; stored data and game/restart logic remain.

The implementation chat’s latest consistency run passed **96 tests in 13 suites**. The prior seven baseline type errors, Android runtime review and screen-reader review remain open. Existing production-export results below are historical checks, not new reconciliation runs. Code Connect remains unavailable on Professional; local mappings and the published MCP library work without an upgrade.

One current visual mismatch remains: disabled `SelectionOption` uses a grey background in application code; the approved component keeps a white surface. The application agent owns this correction and final adoption verification.

The following record is retained as historical evidence. Removed-flow checks describe what was tested at that time, not the current product contract.

# Historical application adoption — library v0.1.1

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

### v0.2.0 selection follow-up — 18 November 2026

SelectionOption now keeps its white background when disabled, matching the published library. SelectionTile inherits this shared behavior. Web inspection confirmed all five selected/unselected/disabled/tile examples remain white, disabled semantics remain present, and keyboard focus reaches the enabled option. The temporary verification route was removed. Dedicated native disabled-state, Android and screen-reader runtime review remain pending; adoption is not marked complete.

### Direct home check-in — 18 November 2026

Home always displays the question card and answer buttons for living pets, including after a saved check-in and on reopening. Pet artwork continues to reflect stored mood/outcomes. “I did it” saves directly with the existing duplicate-submission guard, loading and error behavior. “Ja lox” leaves history unchanged and shows encouragement without replacing the question. Removed the confirmation modal, randomized confirmation copy and its obsolete tests, plus the Continue/celebration-dismissal state. Dead-pet restart behavior remains separate. Published Figma examples have not yet been updated for this interaction revision.

### Negative-answer state — 18 November 2026

“Ja lox” now selects the existing missed PetStage (coral-red background, black pet with white outlines and tears), shows “Nu ty i LOX! / SHAME / on you!” as plain feedback, and keeps both answers available. This temporary answer state does not write a completed check-in or alter hearts. A successful direct check-in clears it; a failed save preserves it. Reopening starts with the home question. Verified on web and iPhone simulator. This supersedes the encouragement-only negative-answer behavior above.

### Successful-answer feedback — 18 November 2026

A successful direct check-in now selects an in-session celebration: the first success shows the white success pet card and “You’re real / gangsta! / Wooooooop!” with the goal and a Menu button. Existing repeated-success progression remains double success. Menu returns to the question; reload starts on the question even when persisted mood is happy. Home uses one answer state (question/missed/success), with no separate confirmation screen. Verified the first-success and Menu flow with a fresh browser test profile.

### Continue returns home — 18 November 2026

The celebration action is now Continue (supersedes Menu). It clears the in-session answer and restores the normal standing/idle pet and question with both answer buttons. Saved happy mood no longer leaves a celebration card on the question screen. Saved check-in history and repeated-success counts are preserved. Verified Continue → idle pet/actions on the iPhone simulator.

### Same-day double success — 18 November 2026

Home success feedback now counts saved check-ins on the local calendar day, independently of the streak. The first uses the white success card; the second and every subsequent success that day use the existing lavender double-success scene and three-line title “DOUBLE / Success! / Keep going!”. Continue returns to idle Home and retains history. The next day starts at the first-success tier. All 98 tests pass, including daily reset and repeated successes. Shared web/native implementation; Figma examples remain pending.

### Two-step onboarding — 18 November 2026

Removed the Meet pet step, pet-name field, hearts preview and associated price lookup. Onboarding now contains Name your habit and How often?; Let’s start commits the plan from the second step and opens Home. Existing pet names remain intact and can be edited in Setup. Legacy drafts at step three resume at step two. Shared implementation serves web and native. All 98 tests and the web export pass; existing unrelated type-check errors remain.

### Home spacing — 18 November 2026

Halved the idle Home gap from the pet ground line to the question card (approximately 112 to 56 source pixels), preserving artwork size and other outcome spacing. Shared Home uses a scaled -70px top margin to account for the authored scene’s trailing whitespace. Web visual check and production export passed.

### Hair and clothes — 18 November 2026

Added original vector hairstyles (curls, spikes, side swoop) and clothes (striped T-shirt, waistcoat, scarf) using the pet’s black outlines and existing palette. Shared SelectionTile supports artwork children; white surfaces and selected outlines remain unchanged. Choices preview immediately, save with preferences on web/native, and render in Home outcome poses. Native storage adds nullable columns with None defaults for legacy profiles. All 99 tests pass, including accessory persistence. Figma components have not yet been reconciled for these new assets.

Accessory visual verification: all three pairs inspected on web, selection and live shirt preview confirmed in iPhone Simulator after full reload. Saved web choices rendered in idle, missed and double-success poses.

### Missed-state animation — 18 November 2026

The original blue-drop SVG loops downward over 4.2 seconds with a subtle sideways wobble. The original loose-leg path begins at the body, hops outward over one second and rests at its authored endpoint before repeating. Artwork paths, card dimensions and colours are unchanged. Reduced-motion preferences and compact calendar scenes retain the static original. Shared React Native Animated implementation uses the native driver on mobile and stops loops on unmount. Visually checked on web and iPhone; 99 tests pass.

### Success flip and loose-leg correction — 18 November 2026

First-success pet loops from upright to handstand, kicks its original leg strokes at their attachment points, and flips back. Confetti floats, sways and scales uniformly; reduced-motion and calendar previews remain static. Missed-state loose leg now starts rotated 100 degrees about its own centre at the same vertical level as the other leg, holds for 800ms, then hops and rotates to its authored detached endpoint. Temporary visual-review route removed before release. All 99 tests pass; existing unrelated type errors remain.

### Home idle motion — 18 November 2026

The shared idle pet moves gently ±6 artwork pixels, taking 3 seconds per direction after a short centered entrance. Ground and You arrow remain stationary. Setup and calendar pets stay static; reduced-motion preferences disable the loop. Web movement was verified in the rendered view, the shared mobile Home rendered in Simulator, and the production export passed. Published as Sites version 14.

### Double-success decoration motion — 18 November 2026

Original d0ef1 vectors are split losslessly into rainbow and three heart layers. Rainbow breathes over 4.2 seconds; hearts pulse, bob up to 6 artwork pixels and tilt 3–5 degrees on staggered 2.3–3 second loops. Shared native/web Animated implementation; reduced motion and calendar/compact scenes retain the static original. Web transforms and iPhone Simulator rendering verified, production export passed. Type checking reports only the seven existing legacy SVG/widget errors. Sites version 15; Figma motion reconciliation remains pending.

### Banked countdown and five failure stages — 23 November 2026

Home shows a small 16px countdown under the idle ground line (under the card for result states). Balances of 48 hours or more use whole days; smaller balances display hours, minutes and seconds. One successful check-in per local calendar day adds the selected 24h/48h/week interval to the remaining balance, with no upper cap. The success phrase replaces the question and actions until local midnight, including after reopening. This supersedes the earlier same-day repeat/Continue flow; legacy double-success history remains visible.

An expired deadline records a failure and advances the interval, including while the app was closed. Explicit failure and expiry cannot remove two parts on the same local date. Consecutive failures detach left leg, right leg, left arm, right arm, then head; the fifth state collapses the body. Success restores all parts. Original SVG paths are separated into shared layers; reduced-motion and calendar artwork show static fallen positions. Existing restart/payment behavior is retained.

Failure records persist with the banked deadline in the track snapshot on web and native SQLite. Check-in and updated clock are saved together. Legacy profiles keep their last deadline and check-in history. Cadence changes keep already-banked time and apply the new duration to subsequent intervals/rewards. Progress includes failure-only months and renders the recorded failure stage; later success on the same date shows recovery, with the failure record retained.

Validation: 111 tests passed, including time accumulation for all cadences, calendar-midnight separation, duplicate suppression, offline expiry, recovery, calendar outcomes, and native/web persistence. Fresh web flow verified timer → failure → Progress → success → reload; iPhone Simulator verified automatic missed stages and restored success with 24 hours added. Existing seven legacy SVG/widget TypeScript errors remain unchanged. Figma reconciliation is pending.

### Today in Progress — 23 November 2026

The device-local current date uses a 5px coral (#FF7254) outline, compared with the standard 3px black calendar stroke. Cell dimensions, shared edges and 20px corner radius are preserved. The highlight sits above neighbouring strokes and is announced as Today for screen readers. Verified on web and iPhone Simulator.
