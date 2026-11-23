# Tamagotchi design system

**v0.2.0 is published** in Business → Team project. It reconciles the approved application changes and has 15 reviewed library screens plus 15 connected examples. The original seven source frames remain intact. Application adoption and device checks are tracked separately; see [status](status.json) and [adoption](adoption.json).

## Sources

- [Canonical Figma library](https://www.figma.com/design/rVMEM0ZI5L0oyzZtIQibkp?node-id=9-63) and [review screens](https://www.figma.com/design/rVMEM0ZI5L0oyzZtIQibkp?node-id=1-69).
- [Original redesign](https://www.figma.com/design/eU62JH6PqW61UeGlLaGk7T?node-id=4727-144) and [connected application examples](https://www.figma.com/design/eU62JH6PqW61UeGlLaGk7T?node-id=4744-461).
- [Tokens](tokens.json): 69 variables, eight base text styles, nine Figma-only responsive styles and the page gradient.
- [Components](components.json): 13 families, 54 variants and five supporting assets with verified IDs, keys and properties.
- [Reconciliation evidence](reconciliation-verification.json), [release history](CHANGELOG.md), and [developer handoff](HANDOFF.md).

The connected examples contain 302 remote instances, with no detached/local components or screen rasters. An existing calendar instance received the published update while keeping its month override. [v0.1.1 connection evidence](consumer-verification.json) remains available as history.

## Agent workflow

1. Read this guide and status.json. Resolve IDs and properties from the registry; never guess them.
2. Load the relevant Figma skills, start a session, and inspect the component description, states, bindings and screenshot. Search this library before making a new asset.
3. Compose screens with instances, semantic variables and shared styles. Change ordinary content through properties; keep instances connected.
4. Maintain reusable changes in the library first. Keep one-off screen composition in the application design file.
5. Review necessity and clarity, then consistency and visual focus. Check narrow and wide screens, wrapping content, focus, disabled/loading/error states and accessible labels.
6. Publish, accept updates in the consumer file, and verify actual geometry and preserved overrides. If a builder key returns a stale cached definition, resolve the current remote definition through the Plugin API and use its verified ID; do not detach it.
7. Record the release, affected IDs, evidence, migration needs and adoption status. Hand off the exact version; verify mobile and web before marking implementation complete.

MCP is an explicit inspect/change/validate workflow, not automatic two-way synchronization. Code Connect is unavailable on the current Professional plan; the local component correspondence and MCP library workflow remain usable without an upgrade.

## Current visual contract

Match the original Figma capitalization and emphasis: Day, Set up, Goal and DOUBLE Success! Supporting flows use sentence case. Preserve user-entered values, localized dates and external messages. The former lowercase-only rule is superseded.

At the 430px source viewport, content is 382px wide with 24px margins. Use Hepta Slab Bold 62/65 for page titles, ExtraBold 42/48 for feedback, Bold 22/28 for labels and 22/48 for buttons; use Aleo Regular 22/44 for body, Bold 22/28 for support and Regular 14/18 for calendar labels. Scale by `min(1, (viewportWidth - 48) / 382)`, keeping reading text at least 16px, calendar text at least 10px, navigation text 12px, and targets at least 44px. Preserve accessibility font scaling. Figma-only adapter sizes compensate instance transforms; they are not application tokens.

Scale original 382×438 pet scenes uniformly. Setup has a white bordered card, name above the pet and no hat; long names grow the card without stretching the artwork. Idle is unframed. Preserve the original vectors, circular confetti, poses and decorations.

Setup order is Name → Colour → Hair → Clothes → Habit → **Check in every**. Show **24h / 48h / Weekly** directly in one row. Colour choices stay on one horizontally scrollable row. Hair and Clothes now offer None plus original vector accessories: curls, spikes, side swoop; striped T-shirt, waistcoat, scarf. Picker thumbnails and pet overlays share PetAccessories paths. Selected hair replaces the default hat. This application extension is pending Figma library reconciliation. Fields are white, source height 72px, radius 20px and grow for long values.

Use `SelectionOption` for choices and `SelectionTile` as its accessory wrapper. Every selection state keeps a white surface and black Aleo text. Selected gets a 2px outline, unselected an invisible outline, and keyboard focus a distinct outline. Action buttons such as Save keep their action styling. The remaining grey disabled-selection implementation mismatch is recorded in adoption.json.

Progress starts with the month-year title, such as Nov 2026. There is no outer white calendar card. Source cells are 57×81 on a 54×78 pitch, with 3px shared outlines, 20px corners, 8px date inset and a 58px final column. Use real Monday-first dates; missing/future dates stay empty. Artwork represents saved outcomes only. The Figma month is an editable example, not a date engine: changing the title requires updating every date/status instance.

Below the calendar, show This year or the older year and only month links with saved check-ins. Month links are transparent and outlined. The former `month-chip` was renamed `month-link` with its Figma ID/key preserved; the application renders links inline in Progress and has no `MonthChip` export.

No Logs/Coupons tabs, coupon earning/overlay, home hearts/details expansion, or Progress detail/delete controls remain in this contract. Preserve persisted data, authentication, synchronization, habit cadence, existing routes and game/restart behavior. The source supplies no new opened-menu behavior; do not invent destinations.

## Ownership and release gates

Darya owns product and visual decisions. The design-system agent maintains reusable Figma assets and records. The application agent implements the identified version and reports gaps before inventing replacements. Keep the visual library separate in Figma and the small registry with the existing application repository.

Before marking setup ready, verify source provenance, foundations, component contracts, screenshots, bindings, publication, remote imports and an existing-instance update. Record application adoption separately. Minor releases can add components/states; document changed visual behavior explicitly and preserve valid IDs. Use major releases for incompatible public properties. Keep personal details, secrets and temporary asset URLs out of public records.

The 23 November application update adds a banked countdown, daily question reset, five progressive failure states, and failure history in Progress. These rules supersede the earlier repeat-check-in flow; details and Figma reconciliation status are in ADOPTION.md.

Current implementation and validation: [ADOPTION.md](ADOPTION.md), [adoption.json](adoption.json), [application-components.json](application-components.json).
