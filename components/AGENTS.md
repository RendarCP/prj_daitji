# Component Guidelines

## Scope
Applies to shared UI and feature components under `components/`.

## Rules
- Component files and exports use PascalCase.
- Keep reusable components behavior-focused and avoid page-specific data fetching.
- Prefer existing `components/ui`, `components/features`, and local styling conventions before adding a new abstraction.
- Use accessible controls, labels, focus states, and keyboard behavior for interactive elements.
- Use lucide icons for icon buttons when an icon exists.
- Do not introduce broad visual restyles while implementing a narrow feature.

## Verification
- Add or update behavior tests when a component exposes meaningful state transitions.
- For visual or interaction changes, verify with Playwright MCP across desktop and mobile-sized viewports.
