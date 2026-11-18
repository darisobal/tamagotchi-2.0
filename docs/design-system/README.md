# Tamagotchi design system

Status: version **0.1.1** is published in Business → Team project. Cross-file imports and a published update were verified in Business Visual. Setup is complete and `readyForImplementation` is true. The handoff was sent to the dedicated “Implement Tamagotchi design system” chat; application adoption is tracked there. Setup records are shared in [draft PR #6](https://github.com/darisobal/tamagotchi-2.0/pull/6).

## Sources

- New visual source: [Business Visual — Redesign Tamagothci](https://www.figma.com/design/eU62JH6PqW61UeGlLaGk7T/Business-Visual?node-id=4727-144).
- Canonical library: [Tamagotchi design system](https://www.figma.com/design/rVMEM0ZI5L0oyzZtIQibkp?node-id=9-63), owned by the Business team.
- [Connected examples in Business Visual](https://www.figma.com/design/eU62JH6PqW61UeGlLaGk7T?node-id=4744-461): phone, web and calendar compositions using the published library.
- [Foundations](tokens.json): 69 variables, eight text styles, the page gradient, verified Figma IDs and marked usability extensions.
- [Component registry](components.json): 12 component families and five supporting assets, with actual IDs, keys, properties and source nodes.
- [Setup status](status.json): readiness gates and Git snapshot.
- [Connection verification](consumer-verification.json): imported keys, remote bindings and before/after update evidence.
- [Change log](CHANGELOG.md): version history and validation evidence.
- [Implementation handoff](HANDOFF.md): gated instructions for the application agent.

The seven original frames remain intact as design references. Their native pet vectors were copied into the library, converted into reusable components, and bound to shared colors. The application file has a separate `[library] tamagotchi` page with 122 remote instances. Its spacing variable, text style and gradient style are imported from the library. The v0.1.1 ground-path correction reached all three existing idle scenes without changing their instance properties.

## Agent workflow

1. Read this guide and status.json. Resolve the canonical Figma file and component IDs from the registry; never guess IDs.
2. Load the relevant Figma skills. Start a Figma MCP session and reuse its session ID throughout the task.
3. Read the specific component, its description, variants, variable bindings and screenshot before designing. Search the selected library before creating a new asset.
4. Compose application designs with instances, semantic variables and shared text styles. Keep instances connected. Do not copy raw visual values or detach components to change an ordinary property.
5. If a reusable gap exists, update the library first. Keep one-off screen composition in the application design file.
6. Review necessity and clarity, then consistency and visual focus. Check narrow mobile and wide web layouts, focus, disabled/loading/error states, long text, and accessible status labels.
7. Record the change, affected component IDs, before/after evidence and migration needs. Update the registry and token snapshot from verified Figma values.
8. Publish or update the library, then verify an import and an existing instance update in the application design file. In Figma, open Assets → Libraries → Updates and select the relevant library changes. Check “Show updates for all pages” when the connected examples are on another page. Confirm the changed node and preserved overrides after accepting the update.
9. Hand off an exact version and reviewed component links to the implementation agent. Verify mobile and web before calling implementation complete.

A tool connection is not automatic two-way synchronization. Agents explicitly inspect, modify, validate and record each change. Code Connect is added only when matching application components exist and their mappings have been verified.

## Ownership and changes

Darya owns product and visual decisions. The design-system agent maintains reusable assets and their documentation. The application agent implements an identified library version and reports any gaps before inventing replacements.

Use patch versions for corrections that preserve meaning and properties; minor versions for additive tokens, states or components; major versions for incompatible properties or changed visual/interaction contracts. Deprecate replaced components with a replacement link before removal. Preserve valid IDs during updates.

Record each release with its date, changed assets, compatibility impact, validation evidence and application adoption status. Keep proposed extensions separate from source-derived decisions until review.

## Visual contract

The new source uses Hepta Slab Bold headlines, Hepta Slab ExtraBold feedback titles, Aleo body text, a green page gradient, coral pet artwork, 20 px rounded controls and 3 px outlines. The existing app's blue pet and mood backgrounds are legacy values, not defaults for the new library.

Match capitalization to the original Figma designs, including sentence case and intentional emphasis. Use sentence case for supporting flows without source copy. Preserve user-entered values and locale-formatted dates. The former lowercase-only rule was removed at Darya’s request on 18 November 2026. Missing hair/clothing artwork must not be represented as finished assets. Do not add speculative dark themes, decorative shadows or extra controls.

The source is 430 px wide with 24 px page margins. Review examples cover 320 px and 430 px phone layouts and a centered 430 px column on a 1024 px web viewport. At 430 px, buttons and fields use the source 72 px height. On narrower screens, typography, controls and spacing scale with the content width; controls keep a 44 px minimum target and primary reading text keeps a 16 px minimum. Small calendar/navigation text is preserved, and native accessibility font scaling remains enabled. Fields grow for long values. Setup content must scroll. Keep colour option rows on one horizontally scrollable line when they exceed the viewport. Setup follows the original source order: Name, Colour, Hair, Clothes, Habit, Check In.

The calendar examples use correct October and November 2026 date alignment. They are editable examples, not a date engine. Changing only the month label does not change the dates: update every day instance too. Implement real month lengths and weekday alignment, and distinguish future/missing history from failed check-ins. Calendar cells are read-only; use the same pet-stage instances and accessible date/status labels.

Text and boolean properties belong to their component set. Use the property names and variant values recorded in `components.json`; do not invent property keys. `check-in-actions` exposes its nested `negative` and `positive` button instances for label edits. `pet-stage` exposes its nested `pet` instance for pose edits. `selection-tile` has an artwork swap property and an explicit `none` choice; additional accessories need real artwork.

## Navigation and implementation boundaries

Current routes are setup, home and progress. The source includes a menu action but does not define its destination or opened state. Reuse the button treatment for that action; do not invent a new navigation model or remove current destinations.

The redesign is visual. Preserve existing authentication, local storage, synchronization, habit cadence, rewards, purchase behavior and history unless Darya requests a product change.

Do not wire new tokens into the running application before the library is reviewed and ready. Keep public repository content free of personal details, credentials and temporary Figma asset URLs.

## Setup completion gates

- Canonical Figma file and page links recorded.
- Foundations created with semantic aliases, targeted scopes and code syntax.
- Source-faithful artwork and reusable components created with properties and states.
- Instance-based review examples checked at mobile and web widths.
- Token bindings, styles, component IDs and naming verified.
- Library publication, cross-file import and update propagation verified.
- Versioned registry and change log updated.

No gate may be marked complete from a successful tool call alone. Send the prepared handoff to the identified Tamagotchi developer chat only after these setup gates pass. Track dispatch and application adoption separately from setup readiness; publication does not mean the running application has migrated.

Application implementation and validation are recorded separately in [ADOPTION.md](ADOPTION.md), [adoption.json](adoption.json) and [application-components.json](application-components.json).

### Application selection controls

Use `SelectionOption` from `src/design-system/Controls.tsx` for text choices and `SelectionTile` for accessory choices. Both share a white surface, 20 px source radius, and 2 px selected outline (scaled with the layout); unselected outlines are transparent. Text choices use the shared Aleo body typography. Keyboard focus remains visible and radio state is exposed to assistive technology. Use `Button` for actions such as Save, not as a selectable option. Reuse these components for equivalent controls on new or existing screens; keep page-specific code to labels, values, and arrangement.
