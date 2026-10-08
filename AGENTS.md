# Tamagotchi — Agent Instructions

Cursor loads this file automatically for agent sessions in this project. Edit the **MIV** section below with instructions that should apply to every session.

## MIV

<!-- Minimum Instruction Version: system instructions for every agent session in this project. -->

### Cross-platform (mobile + web)

Every change must work on **both mobile and web**. That does not mean duplicating logic in separate implementations — reuse shared code as much as possible.

- Put shared UI, logic, and state in `src/`, `app/`, and `widgets/` so both platforms use the same code path by default.
- Only split when a platform truly requires it (e.g. `src/database.web.ts` vs `src/database.ts`). Keep platform-specific code minimal and isolated.
- Prefer `Platform.OS` checks or `.web.ts` / `.native.ts` file extensions over copy-pasting whole screens or components.
- When adding a feature, verify it behaves correctly on web and on mobile — not just the platform you are currently testing.

### Minimal design and purposeful copy

- Start with the minimum information and controls needed to complete the user's task.
- Every word, control, graphic, and visual element must serve a clear, necessary purpose. If it is optional or merely decorative, omit it by default.
- Before adding an element, ask: what would the user be unable to understand or do without it? If there is no concrete answer, do not add it.
- Make the next action obvious. Add a heading only when needed for orientation or instruction, and one short description only when the heading is insufficient. Never add a third layer of explanatory copy.
- Avoid redundant labels, repeated instructions, competing actions, and graphics that distract from the task. Keep each screen focused.
- Reveal secondary controls only when they become necessary in the flow; do not display them preemptively.
- Keep necessary accessibility labels, feedback, error recovery, and information required for an informed decision. Minimal design must remain understandable and usable.
- Review twice before delivery: first for necessity and clarity, then for brevity and visual focus. Remove anything that does not earn its place.

---

## Project overview

Expo (SDK 54) + React Native app with expo-router. Pixel-pet Tamagotchi with local SQLite storage, optional Supabase auth/sync, and a web target.

## Commands

| Task | Command |
|------|---------|
| Start dev server | `npm start` |
| Web (with auto-restart watchdog) | `npm run dev:watch` |
| Web | `npm run web` |
| iOS | `npm run ios` |
| Android | `npm run android` |
| Tests | `npm test` |
| Supabase setup | `npm run setup:supabase` |

## Project layout

```
app/           # expo-router screens and layouts
src/           # core logic, components, context, database, sync
widgets/       # widget UI
assets/        # images, pet art
supabase/      # schema
scripts/       # setup helpers
.cursor/rules/ # Cursor-specific rules (e.g. auto-reload browser on web changes)
```

## Conventions

- TypeScript throughout; shared types in `src/types.ts`
- App state in `src/context.tsx`; auth in `src/authContext.tsx`
- Pet logic in `src/logic.ts`; theme in `src/theme.ts`
- Prefer small, focused diffs; match existing patterns in surrounding code
- Do not commit secrets (`.env`); see `.env.example` for required vars
- **Lowercase copy:** all user-facing text (labels, buttons, errors, alerts) is lowercase — no title case or uppercase styling
- **Screen titles:** use `Type.screenTitle` (`Slab.black`) for page headlines — home greeting, setup, history, auth, check-in — so weight/size stay consistent
- **Screen descriptions:** use `Type.screenDescription` (`Slab.bold`, `FontSize.lg`) for the supporting line under a title (auth tagline, setup blurb, history count, check-in prompt)

## Related Cursor config

- `.cursor/rules/` — scoped rules with glob patterns (use for file-specific or tool-specific behavior)
- This file — portable, project-wide agent instructions
