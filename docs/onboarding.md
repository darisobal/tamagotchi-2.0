# First-use journey

New profiles start as guests in `/onboarding`. The three steps collect a nonblank habit, cadence and pet name. Drafts persist in profile preferences, including the current step. Existing stored profiles keep their habits/history and skip the journey. Account creation is optional; the home invitation appears after a real check-in and coupon collection when Supabase is configured. “later” persists dismissal; account access remains in setup.

## Timing

Cadences are rolling **24, 48 and 168 hour** intervals, not calendar days. `prefs.planStartedAt` begins the first interval without writing a check-in, streak, celebration or coupon. A real completion resets the anchor to `lastCheckInAt`, restores three hearts and follows the existing confirmation/reward flow. Every elapsed missed interval costs one heart, including before the first completion. Three consecutive misses means death. Home displays the concrete local deadline, or the next heart-loss deadline when overdue. Changing cadence in setup uses the existing timer anchor with the new interval. Legacy profiles without a plan timestamp retain their previous first-check-in behavior.

## Profiles and account transitions

Web profiles have separate localStorage keys. Native SQLite profiles have separate databases. The first resolved identity claims the legacy `tamagotchi.db` in place; later identities use separate files. Existing SQLite rows migrate once; onboarding drafts are not reclassified as legacy profiles on relaunch. Repository operations capture their storage instance so an in-flight write cannot cross into another identity during sign-out.

A guest plan is copied only into a verified empty account. The initial cloud write is insert-only (or a compare-and-swap of an existing empty snapshot), preventing a concurrent existing cloud plan from being overwritten. A failed cloud read is never treated as an empty account. When both plans exist, users choose account progress or return to the guest plan; the guest copy is retained. A marker avoids prompting again for the same guest snapshot.

Cloud writes keep a pending marker. On relaunch, unsynced account edits and cloud data require an explicit choice; choosing device progress clearly states that it replaces the cloud snapshot. Before using cloud progress, the device copy is retained under the identity-specific `tamagotchi_account_backup_<id>` AsyncStorage key. The backup is for recovery, not an additional visible plan. Cloud configuration is still required for real accounts and cross-device sync.

## Verification

Unit/integration coverage exercises blank habits, routing, all cadence boundaries, first completion, guest transfer decisions, web reloads/profile isolation, real SQLite migrations/draft persistence and transactional rollback. The native tests use Node 24's SQLite engine through a small Expo API bridge; they do not replace testing Expo SQLite on an actual device.
