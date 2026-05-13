# Location thumbnail images v2

## Status
- Branch: `feature/location-thumbnail-images-v2`
- Created: 2026-05-13
- Owner: Codex

## Problem
Generated location thumbnails currently share a similar bright wood-storage look. At the 40px size used in the location tree, kitchen, living room, bedroom, and bathroom are difficult to distinguish.

## Scope
- In:
  - Replace location thumbnails with seven WebP assets in `public/images/locations/`.
  - Point the app mapping to WebP and remove obsolete PNG/SVG location image assets.
  - Make each image recognizable in a small circular/square thumbnail by emphasizing room-defining objects.
- Out:
  - UI layout, labels, badges, icon overlays, or color-ring changes.
  - Changes to `lib/utils/location-images.ts` matching logic.

## Ambiguity Loop
Use this section before implementation. Keep asking until every blocker is resolved or intentionally deferred.

| Question | Decision | Status |
| --- | --- | --- |
| What is the first user-visible behavior? | The location tree thumbnails for room names are visually easier to identify at 40px. | Resolved |
| What must not change? | Location matching behavior and location UI structure stay unchanged. | Resolved |
| What is hard to test directly? | Subjective image quality is verified by browser screenshot inspection rather than unit tests. | Resolved |

## Agent Team
- 플랜전문가: clarify scope, non-goals, risks, and first slice.
- 테스트전문가: define behavior checks and TDD order.
- 프론트전문가: own UI/interaction design when UI is affected.
- 코드리뷰전문가: review regression risk and test gaps.
- QA전문가: run verification and record QA notes.

## TDD Plan
Use vertical slices: one behavior check, smallest implementation, repeat.

| Order | Behavior | Test or automation | Notes |
| --- | --- | --- | --- |
| 1 | All seven WebP assets exist at the public paths. | `file public/images/locations/*.webp` | Confirms replacement assets are valid image files. |
| 2 | Existing code still type-checks with WebP image paths. | `npm run type-check` | Mapping logic is unchanged; only file extensions change. |
| 3 | Thumbnails are distinguishable in the tree UI. | Playwright MCP screenshot pass | Visual QA for the user-facing concern. |

## Implementation Notes
- Affected routes: location explorer UI consumers only through static assets.
- Affected utility: `lib/utils/location-images.ts` now points location presets to `.webp` assets.
- Affected components: none directly.
- Affected lib/server modules: none.
- Data or migration changes: none.
- Asset prompts should request realistic Korean apartment interiors, 16:9 composition, no text, no phone mockups, and a large foreground room-defining subject.

## QA Plan
- Automated checks: `npm run workflow:verify`
- Browser checks: Playwright MCP pass using `docs/process/playwright-mcp-qa.md`
- API checks: not applicable.

## QA Notes
- Generated seven WebP assets from the replacement PNGs with `sharp` quality 85.
- Removed obsolete location PNG and SVG assets after the app mapping switched to WebP.
- `file public/images/locations/*.webp` passed: all seven files are valid 1672x941 WebP images.
- `npm run type-check` passed.
- `npm run workflow:verify` passed after removing obsolete PNG/SVG assets.
- Full explorer tree visual QA remains environment-dependent because the local route returned a data loading error during the previous browser pass.

## Commit Plan
- Suggested commit: `feat: improve location thumbnail images`
