# Tamagotchi redesign handoff

**Version 0.1.1 was handed off on 2026-11-18 to the new “Implement Tamagotchi design system” chat, created at Darya's request. Setup is complete; application adoption is tracked in that chat.**

Use the new [Tamagotchi design system](https://www.figma.com/design/rVMEM0ZI5L0oyzZtIQibkp), its [review screens](https://www.figma.com/design/rVMEM0ZI5L0oyzZtIQibkp?node-id=1-69), and the verified IDs and component properties in `components.json`. Read `README.md`, `tokens.json`, `status.json` and `CHANGELOG.md` first. The original redesign is linked in the registry for provenance.

The library is published in Business → Team project and enabled in Business Visual. [Connected examples](https://www.figma.com/design/eU62JH6PqW61UeGlLaGk7T?node-id=4744-461) verify remote component, variable and style imports at 320/430 px phone and 1024 px web widths. A v0.1.0 → v0.1.1 correction was accepted through Figma's library updates and reached the existing instances with their properties preserved. See `consumer-verification.json`. The registry is maintained on `codex/tamagotchi-design-system` in the existing app repository.

The new visual language uses Hepta Slab headings, Aleo reading text, the green gradient, coral pet artwork, 20 px control corners and 3 px outlines. Replace the legacy visual theme only after the setup gates pass. Preserve authentication, SQLite/Supabase state, check-in cadence, rewards, purchases and existing setup/home/progress routes. Keep mobile and web on shared components.

Implement reusable components before migrating screens. Use the exact original pet artwork; export the native library assets rather than redrawing the pets or flattening whole screens. Add and load Aleo as needed. Keep text lowercase, allow long labels/values to wrap, retain focus and disabled/loading/error states, and provide accessible date/status labels. Build real calendar logic; the Figma months are examples.

Hair/clothing artwork and opened navigation behavior were not supplied. Use the documented no-accessory choice and preserve existing routes; report any product decision needed before inventing new assets or destinations. The visual library is not permission to change application behavior.

Once matching app components exist, add verified Code Connect mappings. Report mobile and web validation, the adopted library version and any remaining gaps before marking adoption complete.

Setup gates have passed and the handoff has been dispatched. The setup documentation is shared in [draft PR #6](https://github.com/darisobal/tamagotchi-2.0/pull/6). Keep implementation changes on a separate branch and PR; record mobile/web validation and adoption separately from these setup checks.
