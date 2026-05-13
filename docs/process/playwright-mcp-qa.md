# Playwright MCP QA

Use this checklist after implementing UI, routing, form, modal, or browser-behavior changes.

## Setup

1. Start the app with `npm run dev`.
2. Open `http://localhost:3000` through Playwright MCP.
3. Test both a desktop viewport and a mobile-sized viewport.

## Required Checks

- Page loads without console errors relevant to the changed feature.
- Primary happy path works end to end.
- Empty, loading, and error states affected by the feature are reachable or intentionally documented as not applicable.
- Text does not overlap or overflow interactive controls.
- Keyboard focus order and button/link semantics are usable.
- Screenshots or a short recording are captured for PR context when the change is visual.

## When Browser QA Is Not Practical

Document the blocker in the active plan under `QA Notes`, then add the closest available automated check, such as a route handler check, unit-level behavior test, or mocked integration path.
