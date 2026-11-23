# Tamagotchi v0.2.1 handoff

Pet patch: v0.2.1 is published and accepted in Business Visual. Setup/idle use source `4792:1906`, with the hat optional and off by default in every pose. The implementation chat has completed the matching local app change and web/iPhone checks. Read [pet-update.json](pet-update.json) for current evidence; application deployment is separate. The earlier v0.2.0 reconciliation notes below are historical context.

The [published library](https://www.figma.com/design/rVMEM0ZI5L0oyzZtIQibkp) and [review screens](https://www.figma.com/design/rVMEM0ZI5L0oyzZtIQibkp?node-id=1-69) now reconcile Darya’s approved implementation changes. [Connected examples](https://www.figma.com/design/eU62JH6PqW61UeGlLaGk7T?node-id=4744-461) use current remote definitions. Read README.md, status.json, components.json, tokens.json and reconciliation-verification.json before further visual changes.

The original handoff created “Implement Tamagotchi design system” at Darya’s request. Continue implementation there on `codex/tamagotchi-redesign` / [draft PR #7](https://github.com/darisobal/tamagotchi-2.0/pull/7); do not recreate the setup or merge/deploy as part of reconciliation.

Adopt original capitalization; uniformly scaled 382×438 scenes; setup name above the hatless pet; Name → Colour → Hair → Clothes → Habit → Check in every with 24h / 48h / Weekly; shared white selection controls; responsive source typography; and the transparent calendar with shared outlines and saved-month links. Remove obsolete coupon/detail UI as approved, preserving stored data and game/restart logic. IDs and keys are preserved except for the new SelectionOption family and missing-date variant. MonthChip is no longer an application export; the month-link mapping points to inline Progress code.

One source discrepancy remains: `SelectionOption` in `src/design-system/Controls.tsx` uses `gray-disabled` when disabled. The approved shared component keeps white in every state. Correct this through the shared component, then verify settings and onboarding equivalents, focus and disabled accessibility state on mobile and web. Record adoption of v0.2.0 only after this check.

The latest implementation consistency run reported 96 passing tests in 13 suites. Prior production exports are historical evidence; this design-only pass did not rerun them. Seven existing type errors, Android runtime review and screen-reader review remain open. Code Connect is unavailable on Professional; retain verified local correspondence and the working MCP flow without upgrading or claiming publication.

No application source files were changed by this reconciliation. Figma-only responsive styles are display adapters, not new app font sizes. No merge, deployment, account upgrade or new repository is needed for this release.
