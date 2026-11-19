# Font size audit — 18 November 2026

Scope: font sizes only. Original Figma source file eU62JH6PqW61UeGlLaGk7T, setup 4727:1899, calendar 4727:307, home states 4727:145, 4727:181, 4727:228, 4727:265. Read fresh design contexts for all six frames.

| Role | Figma at 430 px | Application at 430 px | At 350 px |
| --- | ---: | ---: | ---: |
| Page titles | 62 | 62 | 49.02 |
| Home feedback | 42 | 42 | 33.20 |
| Setup labels, pet name, buttons | 22 | 22 | 17.39 |
| Field values, month links, goal | 22 | 22 | 17.39 |
| Calendar weekday and day numbers | 14 | 14 | 11.07 |

The calendar's small text previously remained 14 px at narrow widths while titles scaled, distorting the hierarchy. It now follows the content ratio with a 10 px minimum at 320 px. Native accessibility font scaling remains enabled. Other reading text retains its existing 16 px minimum; navigation retains 12 px.

Screen inventory: Home (all mood states share Feedback), Setup, Progress, onboarding (three steps), auth including password recovery, reset password, standalone check-in, confirmation modal, restart modal, account conflict/recovery gate, and navigation. Redirect/loading routes contain no additional type. Shared title, label, body, supporting, and button styles are consistent. Confirmation/restart use the existing compact 42 px heading; there are no original Figma frames for these supporting flows. Account recovery buttons were the sole legacy 20 px primary-button exception; now use the shared 22 px button-size token. Secondary account-recovery explanation remains 16 px; close icon remains 18 px.

Validation: measured browser computed sizes for calendar title/weekdays/month links and setup labels/fields at 430 px; setup fields/home button and calendar text at 350 px; calendar text at 320 px. Native calendar accessibility tree checked; native 430 px source sizes unchanged. Supporting account/payment/recovery flows were source-audited, not transacted. All 96 unit tests pass. Typecheck retains the seven pre-existing SVG/widget errors, with no new errors. Screenshot: validation/font-audit-calendar-350.png.
