# Skill: Add Animation to a Map

## When to use
When your map data has a temporal dimension and needs playback controls.

## Template files

- `templates/timestamps.ts` — Timestamp definitions and COG URL mapping
- `templates/animation-setup.tsx` — Full animation setup (clock, clamping, layer, timeline)
- `templates/keyboard-shortcuts.tsx` — Keyboard shortcuts for playback control
- `templates/stac-animation.tsx` — STAC-based temporal animation pattern

## Steps

### 1. Define ordered timestamps

```tsx
import type { Timestep } from "@maptool/core";
```

See `templates/timestamps.ts` for the data structure: an array of `Timestep` objects and a `cogUrlsByIndex` record mapping each frame index to its COG URL.

### 2–5. Set up animation clock, clamping, layer binding, and timeline

See `templates/animation-setup.tsx` for the complete pattern that:
- Creates a clock with `useAnimationClock` (fps, loop, speed)
- Clamps the animation index when the timestamp list changes (e.g. new STAC results)
- Binds the current frame to a TiTiler-backed COG layer
- Renders the `AnimationTimeline` UI with play/pause, step controls, and speed control

### 6. Optional keyboard shortcuts

See `templates/keyboard-shortcuts.tsx` for a reusable hook that binds Space (play/pause), ArrowLeft (step back), and ArrowRight (step forward).

## For STAC-based temporal animation

When timestamps come from a STAC catalog using stac-react, see `templates/stac-animation.tsx` for the pattern that uses `useStacSearch` to discover items, `extractTimestamps` to build the timeline, and `getSTACItemAssets` to resolve COG URLs per frame.

## Common mistakes
- **Not clamping index on data change** — if timestamps shrink, `currentIndex` can be out of bounds
- **FPS too high for raster data** — tiles take time to load; 1-4 FPS is typical for COG animation
- **Missing `formatLabel`** — default format may not match your temporal resolution (monthly, yearly, etc.)
- **Missing `StacApiProvider`** — stac-react hooks require the provider (see `setup-map-app` skill)
- **STAC date-relative search returning no items** — if you search for "last N days/hours" but the collection's temporal coverage has ended (e.g. `noaa-cdr-sea-surface-temperature-optimum-interpolation` stops at mid-2024), the search returns empty and no animation frames exist. Always query the most recent items first with `sortby desc` and no date filter to discover the actual data range, then build time-relative windows from that. Alternatively, reverse the results to get ascending order for the animation timeline.

## Reference files
- `src/hooks/useAnimationClock.ts` — clock hook with full return type
- `src/utils/stac-helpers.ts` — `extractTimestamps` returns `{ time: number; itemId: string }[]`
- `src/components/AnimationTimeline/types.ts` — all timeline props
- [`stac-react`](https://github.com/developmentseed/stac-react) — STAC search hooks
