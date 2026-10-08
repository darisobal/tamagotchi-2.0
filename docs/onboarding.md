# First-use journey

Signed-out users start at `/auth`, using the existing combined sign-in/account-creation flow. After authentication, accounts without a saved plan enter `/onboarding`; existing profiles keep their habits/history and go home. The three steps collect a nonblank habit, cadence and pet name. Drafts persist in profile preferences, including the current step. Direct onboarding, tab and check-in links require sign-in.

## Timing

Cadences are rolling **24, 48 and 168 hour** intervals, not calendar days. `prefs.planStartedAt` begins the first interval without writing a check-in, streak, celebration or coupon. A real completion resets the anchor to `lastCheckInAt`, restores three hearts and follows the existing confirmation/reward flow. Every elapsed missed interval costs one heart, including before the first completion. Three consecutive misses means death. Home displays the concrete local deadline, or the next heart-loss deadline when overdue. Changing cadence in setup uses the existing timer anchor with the new interval. Legacy profiles without a plan timestamp retain their previous first-check-in behavior.

## Profiles and account transitions

Web profiles have separate localStorage keys. Native SQLite profiles have separate databases. The first resolved identity claims the legacy `tamagotchi.db` in place; later identities use separate files. Existing SQLite rows migrate once; onboarding drafts are not reclassified as legacy profiles on relaunch. Repository operations capture their storage instance so an in-flight write cannot cross into another identity during sign-out.

Previously stored guest plans remain on the device but are no longer automatically imported into accounts. A newly created account starts its own setup; returning accounts load their own progress.

Cloud writes keep a pending marker. On relaunch, unsynced account edits and cloud data require an explicit choice; choosing device progress clearly states that it replaces the cloud snapshot. Before using cloud progress, the device copy is retained under the identity-specific `tamagotchi_account_backup_<id>` AsyncStorage key. The backup is for recovery, not an additional visible plan. Cloud configuration is still required for real accounts and cross-device sync.

## Verification

Unit/integration coverage exercises blank habits, routing, all cadence boundaries, first completion, guest transfer decisions, web reloads/profile isolation, real SQLite migrations/draft persistence and transactional rollback. The native tests use Node 24's SQLite engine through a small Expo API bridge; they do not replace testing Expo SQLite on an actual device.
