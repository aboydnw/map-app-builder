# Skill: Add Animation to a Map

## When to use
When your map data has a temporal dimension and needs playback controls.

## Steps

### 1. Define ordered timestamps

```tsx
import type { Timestep } from "@maptool/core";

const timestamps: Timestep[] = [
  { time: "2024-01-01T00:00:00Z" },
  { time: "2024-01-02T00:00:00Z" },
  { time: "2024-01-03T00:00:00Z" },
  // ... more timestamps
];

// Map each timestamp index to its COG URL
const cogUrlsByIndex: Record<number, string> = {
  0: "https://example.com/data-20240101.tif",
  1: "https://example.com/data-20240102.tif",
  2: "https://example.com/data-20240103.tif",
};
```

### 2. Set up the animation clock

```tsx
import { useAnimationClock } from "@maptool/core";

const clock = useAnimationClock({
  totalFrames: timestamps.length,
  fps: 2,
  loop: true,
  initialSpeed: 1,
});
```

### 3. Clamp index when data changes

If your timestamp list can change (e.g. new STAC search results), clamp the animation index:
```tsx
import { useEffect } from "react";

useEffect(() => {
  if (clock.currentIndex >= timestamps.length && timestamps.length > 0) {
    clock.setIndex(0);
  }
}, [timestamps.length, clock.currentIndex, clock.setIndex]);
```

### 4. Bind current frame to your layer source

```tsx
const currentCogUrl = cogUrlsByIndex[clock.currentIndex] ?? "";

const titiler = useTitiler({
  baseUrl: import.meta.env.VITE_TITILER_URL,
  url: currentCogUrl,
  colormap: "viridis",
});

const layers = useMemo(
  () => titiler.tileUrl
    ? [createCOGLayer({ id: "animated-cog", tileUrl: titiler.tileUrl, bounds: titiler.info?.bounds })]
    : [],
  [titiler.tileUrl, titiler.info?.bounds]
);
```

### 5. Render timeline UI

```tsx
import { AnimationTimeline } from "@maptool/core";

<AnimationTimeline
  timestamps={timestamps}
  currentIndex={clock.currentIndex}
  onIndexChange={clock.setIndex}
  isPlaying={clock.isPlaying}
  onPlayingChange={clock.setPlaying}
  speed={clock.speed}
  onSpeedChange={clock.setSpeed}
  formatLabel={(time) => {
    const d = new Date(time);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }}
  showStepControls
  showSpeedControl
/>
```

### 6. Optional keyboard shortcuts

```tsx
useEffect(() => {
  const onKey = (e: KeyboardEvent) => {
    if (e.code === "Space") { e.preventDefault(); clock.togglePlay(); }
    if (e.code === "ArrowLeft") clock.stepBack();
    if (e.code === "ArrowRight") clock.stepForward();
  };
  window.addEventListener("keydown", onKey);
  return () => window.removeEventListener("keydown", onKey);
}, [clock]);
```

## For STAC-based temporal animation

When timestamps come from a STAC catalog:

```tsx
import { useSTAC, useAnimationClock, AnimationTimeline } from "@maptool/core";
import { extractTimestamps } from "@maptool/core";

// Search — note: useSTAC uses `collections` (array), not `collectionId`
const stac = useSTAC({
  apiUrl: "https://earth-search.aws.element84.com/v1",
  collections: ["sentinel-2-l2a"],
  bbox: [-122.5, 37.5, -122.0, 38.0],
  datetime: "2024-01-01/2024-06-30",
  autoSearch: true,
});

// Extract sorted timestamps with item IDs
const temporal = extractTimestamps(stac.items);
const timestamps: Timestep[] = temporal.map((t) => ({ time: t.time }));

// Map timestamp index → STAC item for asset lookup
const getItemForIndex = (index: number) => {
  const entry = temporal[index];
  if (!entry) return null;
  return stac.items.find((item) => item.id === entry.itemId) ?? null;
};

// On each frame, select the matching item and get its COG URL
useEffect(() => {
  const item = getItemForIndex(clock.currentIndex);
  if (item) stac.selectItem(item);
}, [clock.currentIndex]);

const cogUrls = stac.getCOGUrls();
const activeUrl = cogUrls[0]?.href ?? "";
```

## Common mistakes
- **Using `collectionId` instead of `collections`** — `useSTAC` extends `STACSearchParams` which has `collections: string[]`
- **Not clamping index on data change** — if timestamps shrink, `currentIndex` can be out of bounds
- **FPS too high for raster data** — tiles take time to load; 1-4 FPS is typical for COG animation
- **Missing `formatLabel`** — default format may not match your temporal resolution (monthly, yearly, etc.)

## Reference files
- `src/hooks/useAnimationClock.ts` — clock hook with full return type
- `src/hooks/useSTAC.ts` — `UseSTACOptions` extends `STACSearchParams`
- `src/utils/stac.ts` — `extractTimestamps` returns `{ time: number; itemId: string }[]`
- `src/components/AnimationTimeline/types.ts` — all timeline props
