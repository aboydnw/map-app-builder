# Skill: Writing Tests for maptool Components

## When to use
When writing unit tests for components, hooks, or utils in a project using `@maptool/core`.

## Test stack
- **Vitest** — test runner (Jest-compatible API)
- **React Testing Library** — component rendering and interaction
- **`@testing-library/user-event`** — realistic user event simulation
- **Playwright** — E2E and visual regression

## Template files

Complete, runnable test examples live in `templates/`:

| Template | Demonstrates |
|----------|-------------|
| `templates/MapLegend.test.tsx` | Component testing with props, rendered text assertions, and user interaction callbacks via `userEvent` |
| `templates/useAnimationClock.test.tsx` | Hook testing with `renderHook` and `act()` for state updates |
| `templates/useFeatureState.test.tsx` | Hook testing with multiple interaction modes (hover, click, multi-select) |
| `templates/FeatureTooltip.test.tsx` | Simple presentational component testing with children |
| `templates/buildTileUrl.test.ts` | Pure utility function testing with no React dependencies |

## Patterns

### Testing components

Use `render` and `screen` from React Testing Library. Assert on visible text and ARIA roles, not DOM structure. For user interactions, always use `userEvent.setup()` and `await` the interaction calls.

See `templates/MapLegend.test.tsx` for a full example with prop rendering and callback assertions, and `templates/FeatureTooltip.test.tsx` for a minimal presentational component test.

### Testing hooks

Use `renderHook` to mount hooks in isolation. Wrap all state-changing calls in `act()`. Test initial state, boundary conditions, and mode variations.

See `templates/useAnimationClock.test.tsx` for index clamping and loop behavior, and `templates/useFeatureState.test.tsx` for hover/click/multi-select interactions.

### Testing pure utils

Pure functions need no React wrappers — just import and assert. Focus on URL construction, parameter encoding, and edge cases.

See `templates/buildTileUrl.test.ts` for TiTiler URL construction testing.

## Common mistakes
- Forgetting `await` on `userEvent` calls — they return promises
- Forgetting `act()` around hook state updates
- Testing implementation details (class names, DOM structure) instead of behavior (text content, ARIA, callbacks)
- Skipping edge cases: empty arrays, boundary indices, null values

## Reference files
- `vitest.config.ts` — test runner config
- `src/test-setup.ts` — global test setup (`@testing-library/jest-dom`)
- `playwright.config.ts` — E2E config
- `src/components/MapLegend/MapLegend.test.tsx` — existing component tests
- `src/components/AnimationTimeline/AnimationTimeline.test.tsx` — existing component tests
- `src/hooks/useFeatureState.test.ts` — feature state hook tests
- `src/layers/GeoJSONLayer.test.ts` — GeoJSON layer tests
- `src/utils/stac-helpers.test.ts` — STAC utility tests
