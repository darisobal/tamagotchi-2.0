# Tamagotchi

The current redesigned app lives on the `main` branch. It includes the shared mobile/web design system, pet customization, simplified onboarding, progress calendar, and animated check-in feedback.

[Try the published app](https://tamagotchi-habit-pet.daryasobal.chatgpt.site/)

## Run locally

Use Node.js 20.19 or newer and npm.

```sh
git clone https://github.com/darisobal/tamagotchi-2.0.git
cd tamagotchi-2.0
npm ci
npm run web
```

For an existing checkout, commit or stash your own changes first, switch to `main`, then run `git pull --ff-only` and `npm ci`. Restart any previously running development server.

The app works locally without Supabase credentials. User data stays on that device/browser. See `.env.example` for optional cloud configuration; do not commit credentials.

For mobile, run `npm run ios` or `npm run android` with the corresponding development environment installed.

## Design system

- [Design-system guide and registry](docs/design-system/README.md)
- [Shared application components](src/design-system)
- [Figma library](https://www.figma.com/design/rVMEM0ZI5L0oyzZtIQibkp?node-id=9-63)
- [Application changes and verification](docs/design-system/ADOPTION.md)

Figma v0.2.0 supplies the visual foundations. The latest pet accessories and motion are implemented in the app; their Figma reconciliation is still pending. Figma and GitHub do not synchronize automatically.

## Validation

```sh
npm test -- --runInBand
npm run build
```

There are existing TypeScript errors in legacy SVG components and optional widget dependencies, recorded in the adoption notes.
