# Tamagotchi redesign handoff

**Pending dispatch. Do not start implementation while `status.json` has `readyForImplementation: false`.**

Use the new [Tamagotchi design system](https://www.figma.com/design/rVMEM0ZI5L0oyzZtIQibkp), its [review screens](https://www.figma.com/design/rVMEM0ZI5L0oyzZtIQibkp?node-id=1-69), and the verified IDs and component properties in `components.json`. Read `README.md`, `tokens.json`, `status.json` and `CHANGELOG.md` first. The original redesign is linked in the registry for provenance.

The new visual language uses Hepta Slab headings, Aleo reading text, the green gradient, coral pet artwork, 20 px control corners and 3 px outlines. Replace the legacy visual theme only after the setup gates pass. Preserve authentication, SQLite/Supabase state, check-in cadence, rewards, purchases and existing setup/home/progress routes. Keep mobile and web on shared components.

Implement reusable components before migrating screens. Use the exact original pet artwork; export the native library assets rather than redrawing the pets or flattening whole screens. Add and load Aleo as needed. Keep text lowercase, allow long labels/values to wrap, retain focus and disabled/loading/error states, and provide accessible date/status labels. Build real calendar logic; the Figma months are examples.

Hair/clothing artwork and opened navigation behavior were not supplied. Use the documented no-accessory choice and preserve existing routes; report any product decision needed before inventing new assets or destinations. The visual library is not permission to change application behavior.

Once matching app components exist, add verified Code Connect mappings. Report mobile and web validation, the adopted library version and any remaining gaps before marking adoption complete.

Before dispatch, the design-system agent must publish the library, verify import/update behavior in a consumer file, and identify the intended existing Tamagotchi developer chat. No message has been sent yet.
