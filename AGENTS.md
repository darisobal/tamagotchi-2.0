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

---

## Project overview

Expo (SDK 54) + React Native app with expo-router. Pixel-pet Tamagotchi with local SQLite storage, optional Supabase auth/sync, and a web target.

## Commands

| Task | Command |
|------|---------|
| Start dev server | `npm start` |
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
