# maptool v0.1.0 — Post-Test Fixes

> Execute these phases in order. After each phase, run `npm run build` and confirm the change worked before moving on. Report what files you changed and any issues encountered.

---

## Phase 1: Fix Tailwind CSS Build (CRITICAL)

### Problem
The built `dist/style.css` only contains CSS custom properties and font-family rules. None of the Tailwind utility classes used in components (e.g. `mt-absolute`, `mt-flex`, `mt-rounded-lg`, `mt-z-10`) are compiled into the output. This means **all maptool components render completely unstyled for consumers**.

### Root Cause
`src/styles.css` imports the three CSS files but never includes `@tailwind` directives. PostCSS/Tailwind never scans the component `.tsx` files for utility class usage.

### Fix

**Edit `src/styles.css`** — replace the entire file with:

```css
@tailwind utilities;

@import "./styles/base.css";
@import "./styles/legend.css";
@import "./styles/timeline.css";
```

We only need `@tailwind utilities` (not `base` or `components`) because:
- We don't want to inject Tailwind's CSS reset into consumer apps
- All our classes are utility classes with the `mt-` prefix
- The `mt-` prefix (configured in `tailwind.config.ts`) prevents collisions with consumer Tailwind setups

### Verify

1. Run `npm run build`
2. Open `dist/style.css`
3. Confirm it now contains rules like `.mt-absolute`, `.mt-flex`, `.mt-z-10`, `.mt-rounded-lg`, etc.
4. The file should be significantly larger than before (likely 5-20KB instead of ~500 bytes)
5. Confirm CSS custom properties from `base.css` are still present at the top

### Status report
After completing this phase, report:
- Size of `dist/style.css` before and after
- Whether Tailwind utility classes are present in the output
- Any build warnings or errors

---

## Phase 2: Add `rescale` prop to `useTitiler`

### Problem
`useTitiler` auto-detects rescale range from band statistics, but consumers cannot override it. This blocks use cases like NDVI normalization where you want a fixed `[-1, 1]` domain regardless of the data's actual range.

### Fix

**Edit `src/hooks/useTitiler.ts`:**

1. Add `rescale` to the options interface:

```typescript
export interface UseTitilerOptions {
  baseUrl: string;
  url: string;
  colormap?: string;
  bidx?: number;
  /** Manual rescale range [min, max]. Overrides auto-detection from statistics. */
  rescale?: [number, number];
  autoFetchInfo?: boolean;
  autoFetchStatistics?: boolean;
}
```

2. Destructure `rescale` from the options in the hook function signature:

Change:
```typescript
export function useTitiler({
  baseUrl,
  url,
  colormap = "viridis",
  bidx = 1,
  autoFetchInfo = true,
  autoFetchStatistics = true
}: UseTitilerOptions): UseTitilerReturn {
```

To:
```typescript
export function useTitiler({
  baseUrl,
  url,
  colormap = "viridis",
  bidx = 1,
  rescale: manualRescale,
  autoFetchInfo = true,
  autoFetchStatistics = true
}: UseTitilerOptions): UseTitilerReturn {
```

3. Update the `rescaleRange` memo to prefer manual rescale:

Change the existing `rescaleRange` memo to:
```typescript
  const rescaleRange = useMemo<[number, number] | null>(() => {
    if (manualRescale) return manualRescale;
    const band = statistics?.["1"];
    if (!band) return null;
    if (typeof band.percentile_2 === "number" && typeof band.percentile_98 === "number") {
      return [band.percentile_2, band.percentile_98];
    }
    if (typeof band.min === "number" && typeof band.max === "number") {
      return [band.min, band.max];
    }
    return null;
  }, [manualRescale, statistics]);
```

4. Update the `tileUrl` memo to use `rescaleRange` instead of recomputing from statistics:

Change the existing `tileUrl` memo to:
```typescript
  const tileUrl = useMemo(() => {
    if (!baseUrl || !url) return null;
    return buildTileUrl(baseUrl, { url, bidx, colormap, rescale: rescaleRange ?? undefined });
  }, [baseUrl, url, bidx, colormap, rescaleRange]);
```

This also fixes a subtle bug: previously `tileUrl` computed its own rescale from stats independently of `rescaleRange`, meaning the legend domain and the tile rendering could theoretically diverge.

### Verify

1. Run `npm run build` — no errors
2. Run `npm run lint` — no type errors
3. Check that `UseTitilerOptions` in `dist/hooks/useTitiler.d.ts` includes the `rescale` field

### Status report
After completing this phase, report:
- The final state of `UseTitilerOptions` interface
- The final state of the `rescaleRange` and `tileUrl` memos
- Any type errors

---

## Phase 3: Update All Skills

### Problem
Skills have accuracy issues discovered during Cursor testing: TypeScript errors in sample code, missing setup steps, wrong prop names for `useSTAC`, and insufficient verification instructions.

### 3a. Fix `skills/setup-map-app/SKILL.md`

Replace the entire file with:

````markdown
# Skill: Setup a Map Application

## When to use
When creating a map app from scratch with React, deck.gl, MapLibre GL JS, and `@maptool/core`.

## Prerequisites
- Node.js 18+
- npm or pnpm

## Steps

### 1. Scaffold the project

```bash
npm create vite@latest my-map-app -- --template react-ts
cd my-map-app
```

### 2. Install dependencies

For local development against the maptool repo:
```bash
npm install @maptool/core@file:../map-app-builder
```

Or if published to npm:
```bash
npm install @maptool/core
```

Then install map dependencies:
```bash
npm install @deck.gl/core @deck.gl/layers @deck.gl/geo-layers @deck.gl/react maplibre-gl react-map-gl
```

### 3. Reset default CSS for full-screen map

Replace the contents of `src/index.css` with:
```css
html, body, #root {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
}
```

This removes Vite's default centering/padding styles that prevent the map from filling the viewport.

### 4. Create the base map component

Replace `src/App.tsx` with:
```tsx
import { useState } from "react";
import DeckGL from "@deck.gl/react";
import { Map } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import "@maptool/core/styles.css";

const INITIAL_VIEW = {
  longitude: -95.7,
  latitude: 37.1,
  zoom: 4,
  pitch: 0,
  bearing: 0,
};

type ViewState = typeof INITIAL_VIEW;

export default function App() {
  const [viewState, setViewState] = useState(INITIAL_VIEW);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <DeckGL
        viewState={viewState}
        onViewStateChange={({ viewState: vs }) => setViewState(vs as ViewState)}
        layers={[]}
        controller
      >
        <Map mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json" />
      </DeckGL>
    </div>
  );
}
```

Note the `as ViewState` cast on `onViewStateChange` — this is required because deck.gl's callback types are broader than our state type.

### 5. Add environment values

Create `.env` in the project root:
```env
VITE_TITILER_URL=https://titiler.xyz
```

### 6. Verify

```bash
npm run dev
```

Confirm:
- [ ] Map fills the entire browser viewport (no white borders/padding)
- [ ] CARTO Positron basemap renders with labels
- [ ] Zoom/pan controls work
- [ ] No TypeScript errors in the terminal

## Common mistakes
- Forgetting to import `maplibre-gl/dist/maplibre-gl.css` — map renders but controls are unstyled
- Forgetting to import `@maptool/core/styles.css` — maptool components render but are unstyled
- Not replacing default Vite CSS — map won't fill viewport
- Using `mapboxgl` imports instead of `maplibre-gl` — different libraries
- Missing the `as ViewState` cast — TypeScript strict mode error

## Reference files
- `templates/basic-app/src/App.tsx` — complete starter app
- `templates/basic-app/package.json` — dependency reference
````

### 3b. Fix `skills/add-cog-layer/SKILL.md`

Replace the entire file with:

````markdown
# Skill: Add a COG Layer with Legend

## When to use
When you have a Cloud Optimized GeoTIFF URL and want to visualize it with TiTiler tiles and a color legend.

## Prerequisites
- Working map app shell (see `setup-map-app` skill)
- A TiTiler instance URL (public default: `https://titiler.xyz`)
- A publicly accessible COG URL

## Steps

### 1. Import maptool pieces

```tsx
import { MapLegend, createCOGLayer, useColorScale, useTitiler } from "@maptool/core";
```

### 2. Connect TiTiler

Inside your component:
```tsx
const titiler = useTitiler({
  baseUrl: import.meta.env.VITE_TITILER_URL ?? "https://titiler.xyz",
  url: "YOUR_COG_URL_HERE",
  colormap: "viridis",
});
```

The hook will:
1. Fetch COG info (bounds, zoom levels, band metadata)
2. Fetch band statistics (min, max, percentiles)
3. Auto-detect rescale range from percentile_2/percentile_98
4. Construct an XYZ tile URL with the colormap applied

To use a fixed domain instead of auto-detection, pass `rescale`:
```tsx
const titiler = useTitiler({
  baseUrl: "https://titiler.xyz",
  url: "https://example.com/ndvi.tif",
  colormap: "RdYlGn",
  rescale: [-1, 1],  // overrides auto-detection
});
```

### 3. Build matching legend colors

```tsx
const colorScale = useColorScale({
  domain: titiler.rescaleRange ?? [0, 1],
  colormap: "viridis",  // must match the colormap in useTitiler
  steps: 8,
});
```

### 4. Create layer

```tsx
import { useMemo } from "react";

const layers = useMemo(
  () =>
    titiler.tileUrl
      ? [createCOGLayer({ id: "my-cog", tileUrl: titiler.tileUrl, bounds: titiler.info?.bounds })]
      : [],
  [titiler.tileUrl, titiler.info?.bounds]
);
```

Pass `layers` to the `<DeckGL>` component's `layers` prop.

### 5. Add legend overlay

Place this inside your map container div, as a sibling to `<DeckGL>`:
```tsx
{titiler.rescaleRange ? (
  <MapLegend
    layers={[{
      type: "continuous",
      id: "my-cog",
      title: "My Data Layer",
      unit: "m",
      domain: titiler.rescaleRange,
      colors: colorScale.colors,
      ticks: 5,
    }]}
    position="bottom-left"
    collapsible
  />
) : null}
```

### 6. Handle loading and error states

```tsx
{titiler.loading ? <div className="absolute top-4 left-4 bg-white p-2 rounded shadow text-sm">Loading...</div> : null}
{titiler.error ? <div className="absolute top-4 left-4 bg-red-50 text-red-700 p-2 rounded shadow text-sm">{titiler.error}</div> : null}
```

### 7. Verify

Run `npm run dev` and confirm:
- [ ] Raster tiles load and are visible on the map
- [ ] Legend panel appears in bottom-left with correct colormap gradient
- [ ] Tick labels show the data domain range
- [ ] If `toggler: true` is set, clicking the checkbox hides/shows the layer
- [ ] Collapsing the legend header hides the content

## Common mistakes
- **Mismatched colormap names** between `useTitiler` and `useColorScale` — legend colors won't match tiles
- **Not guarding null `tileUrl`** before creating the layer — will crash on first render before stats load
- **Private COG URLs** that TiTiler can't access — tiles will 404 silently
- **Using `isLoading` instead of `loading`** — the hook returns `loading`, not `isLoading`

## Reference files
- `src/hooks/useTitiler.ts` — hook source, `UseTitilerOptions` interface
- `src/utils/titiler.ts` — `buildTileUrl` function
- `src/utils/colormaps.ts` — available colormap names: viridis, magma, inferno, plasma, cividis, coolwarm, RdYlGn, RdBu, YlOrRd, Blues, Greens
- `src/layers/COGLayer.ts` — `createCOGLayer` and `COGLayerOptions`
- `src/components/MapLegend/types.ts` — all legend configuration types
````

### 3c. Fix `skills/add-animation/SKILL.md`

Replace the entire file with:

````markdown
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
  baseUrl: import.meta.env.VITE_TITILER_URL ?? "https://titiler.xyz",
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
````

### 3d. Fix `skills/add-stac-layer/SKILL.md`

Replace the entire file with:

````markdown
# Skill: Add a STAC Layer

## When to use
When you want to search a STAC catalog, select items, and render assets on the map.

## Popular public STAC APIs
- **Earth Search (Element 84)**: `https://earth-search.aws.element84.com/v1`
  - Collections: sentinel-2-l2a, landsat-c2-l2, cop-dem-glo-30, naip
- **Microsoft Planetary Computer**: `https://planetarycomputer.microsoft.com/api/stac/v1`
  - Note: Requires token signing for asset URLs
- **NASA CMR STAC**: `https://cmr.earthdata.nasa.gov/stac`

## Steps

### 1. Search the STAC catalog

```tsx
import { useSTAC, useTitiler, useColorScale, MapLegend, createCOGLayer } from "@maptool/core";

// Note: pass `collections` as an array, not `collectionId`
const stac = useSTAC({
  apiUrl: "https://earth-search.aws.element84.com/v1",
  collections: ["sentinel-2-l2a"],
  bbox: [-122.5, 37.5, -122.0, 38.0],
  datetime: "2024-06-01/2024-06-30",
  limit: 10,
  autoSearch: true,
});
```

### 2. Select an item and get its COG URL

```tsx
import { useEffect } from "react";

useEffect(() => {
  if (!stac.selectedItem && stac.items.length > 0) {
    stac.selectItem(stac.items[0]);
  }
}, [stac.items, stac.selectedItem]);

const cogAssets = stac.getCOGUrls();
// Common asset names: "visual", "B04", "red", "data" — varies by collection
const activeUrl = cogAssets.find((a) => a.name === "visual")?.href
  ?? cogAssets[0]?.href
  ?? "";
```

### 3. Visualize with TiTiler + legend

```tsx
const titiler = useTitiler({
  baseUrl: import.meta.env.VITE_TITILER_URL ?? "https://titiler.xyz",
  url: activeUrl,
  colormap: "viridis",
});

const colorScale = useColorScale({
  domain: titiler.rescaleRange ?? [0, 1],
  colormap: "viridis",
  steps: 8,
});

const layers = useMemo(
  () => titiler.tileUrl
    ? [createCOGLayer({ id: "stac-item", tileUrl: titiler.tileUrl, bounds: titiler.info?.bounds })]
    : [],
  [titiler.tileUrl, titiler.info?.bounds]
);
```

### 4. Add legend and metadata display

```tsx
{titiler.rescaleRange ? (
  <MapLegend
    layers={[{
      type: "continuous",
      id: "stac-item",
      title: stac.selectedItem?.collection ?? "STAC Layer",
      domain: titiler.rescaleRange,
      colors: colorScale.colors,
      ticks: 5,
    }]}
  />
) : null}

{stac.selectedItem ? (
  <div className="absolute top-4 right-4 bg-white p-3 rounded shadow max-w-xs text-sm">
    <div className="font-semibold">{stac.selectedItem.id}</div>
    <div className="text-gray-500">{String(stac.selectedItem.properties.datetime)}</div>
    <div className="text-gray-500">Collection: {stac.selectedItem.collection}</div>
  </div>
) : null}
```

### 5. Alternative: use `createSTACLayer` shortcut

For simpler cases, skip `useTitiler` and use the STAC layer wrapper directly:
```tsx
import { createSTACLayer } from "@maptool/core";

const layers = stac.selectedItem
  ? [createSTACLayer({
      id: "stac-quick",
      baseUrl: import.meta.env.VITE_TITILER_URL ?? "https://titiler.xyz",
      item: stac.selectedItem,
      assetName: "visual",  // optional — defaults to first compatible asset
      colormap: "viridis",
    })]
  : [];
```

Note: `createSTACLayer` throws if no compatible asset is found, so guard with `stac.selectedItem` check.

## Common mistakes
- **Using `collectionId` instead of `collections`** — `useSTAC` extends `STACSearchParams` which expects `collections: string[]`
- **Planetary Computer URLs expire** — you need their `planetary-computer` npm package to sign asset URLs before passing to TiTiler
- **Asset names vary by collection** — always inspect `stac.getCOGUrls()` output to find the right asset name
- **POST search not supported everywhere** — some STAC APIs only support GET. Check the API docs if searches fail.

## Reference files
- `src/hooks/useSTAC.ts` — `UseSTACOptions` interface (extends `STACSearchParams`)
- `src/utils/stac.ts` — `STACSearchParams`, `getSTACItemAssets`, `extractTimestamps`
- `src/layers/STACLayer.ts` — `createSTACLayer` and `STACLayerOptions`
````

### 3e. Fix `skills/write-tests/SKILL.md`

Replace the entire file with:

````markdown
# Skill: Writing Tests for maptool Components

## When to use
When writing unit tests for components, hooks, or utils in a project using `@maptool/core`.

## Test stack
- **Vitest** — test runner (Jest-compatible API)
- **React Testing Library** — component rendering and interaction
- **`@testing-library/user-event`** — realistic user event simulation
- **Playwright** — E2E and visual regression

## Patterns

### Testing MapLegend

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { MapLegend } from "@maptool/core";

describe("MapLegend", () => {
  const layers = [{
    type: "continuous" as const,
    id: "temp",
    title: "Temperature",
    unit: "°C",
    domain: [0, 40] as [number, number],
    colors: ["#313695", "#ffffbf", "#a50026"],
    ticks: 3,
  }];

  it("renders title with unit", () => {
    render(<MapLegend layers={layers} />);
    expect(screen.getByText("Temperature (°C)")).toBeInTheDocument();
  });

  it("calls onLayerToggle when toggler clicked", async () => {
    const onToggle = vi.fn();
    const user = userEvent.setup();
    render(
      <MapLegend
        layers={[{ ...layers[0], toggler: true, visible: true }]}
        onLayerToggle={onToggle}
      />
    );
    await user.click(screen.getByRole("button", { name: /toggle temperature/i }));
    expect(onToggle).toHaveBeenCalledWith("temp", false);
  });
});
```

### Testing useAnimationClock

```tsx
import { renderHook, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useAnimationClock } from "@maptool/core";

describe("useAnimationClock", () => {
  it("initializes at index 0, not playing", () => {
    const { result } = renderHook(() =>
      useAnimationClock({ totalFrames: 10, fps: 2 })
    );
    expect(result.current.currentIndex).toBe(0);
    expect(result.current.isPlaying).toBe(false);
  });

  it("clamps setIndex to valid range", () => {
    const { result } = renderHook(() =>
      useAnimationClock({ totalFrames: 5, fps: 2 })
    );
    act(() => result.current.setIndex(99));
    expect(result.current.currentIndex).toBe(4);
    act(() => result.current.setIndex(-1));
    expect(result.current.currentIndex).toBe(0);
  });

  it("stepForward wraps when looping", () => {
    const { result } = renderHook(() =>
      useAnimationClock({ totalFrames: 3, fps: 2, loop: true })
    );
    act(() => result.current.setIndex(2));
    act(() => result.current.stepForward());
    expect(result.current.currentIndex).toBe(0);
  });
});
```

### Testing pure utils

```tsx
import { describe, it, expect } from "vitest";
import { buildTileUrl } from "@maptool/core";

describe("buildTileUrl", () => {
  it("constructs valid TiTiler URL", () => {
    const url = buildTileUrl("https://titiler.xyz", {
      url: "https://example.com/data.tif",
      colormap: "viridis",
      bidx: 1,
      rescale: [0, 100],
    });
    expect(url).toContain("{z}/{x}/{y}");
    expect(url).toContain("colormap_name=viridis");
    expect(url).toContain("rescale=0%2C100");
  });
});
```

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
````

### Verify phase 3

After replacing all 5 skill files, confirm:
- [ ] No broken markdown formatting (check code fences, headings)
- [ ] All import paths reference `@maptool/core` (not relative paths into src/)
- [ ] The `useSTAC` examples all use `collections: [...]` not `collectionId`
- [ ] The `useTitiler` examples mention the new `rescale` option

### Status report
Report which skill files were changed and any issues encountered.

---

## Phase 4: Add README.md

Create `README.md` in the repo root with:

````markdown
# @maptool/core

React components and hooks for building map applications with [deck.gl](https://deck.gl) and [MapLibre GL JS](https://maplibre.org/).

## Install

```bash
npm install @maptool/core
```

Peer dependencies:
```bash
npm install react react-dom @deck.gl/core @deck.gl/layers @deck.gl/geo-layers @deck.gl/react maplibre-gl
```

## Quick Start

```tsx
import { useState } from "react";
import DeckGL from "@deck.gl/react";
import { Map } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import "@maptool/core/styles.css";  // required for component styling

import { MapLegend, useTitiler, useColorScale, createCOGLayer } from "@maptool/core";

export default function App() {
  const [viewState, setViewState] = useState({
    longitude: -95.7, latitude: 37.1, zoom: 4, pitch: 0, bearing: 0,
  });
  type ViewState = typeof viewState;

  const titiler = useTitiler({
    baseUrl: "https://titiler.xyz",
    url: "https://example.com/my-data.tif",
    colormap: "viridis",
  });

  const { colors } = useColorScale({
    domain: titiler.rescaleRange ?? [0, 1],
    colormap: "viridis",
    steps: 8,
  });

  const layers = titiler.tileUrl
    ? [createCOGLayer({ id: "cog", tileUrl: titiler.tileUrl, bounds: titiler.info?.bounds })]
    : [];

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <DeckGL
        viewState={viewState}
        onViewStateChange={({ viewState: vs }) => setViewState(vs as ViewState)}
        layers={layers}
        controller
      >
        <Map mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json" />
      </DeckGL>

      {titiler.rescaleRange ? (
        <MapLegend
          layers={[{
            type: "continuous",
            id: "cog",
            title: "Data",
            domain: titiler.rescaleRange,
            colors,
            ticks: 5,
          }]}
        />
      ) : null}
    </div>
  );
}
```

## Components

- **`MapLegend`** — Continuous color ramps and categorical swatches with collapsible panels, layer toggling, and full ARIA support.
- **`AnimationTimeline`** — Play/pause, step, speed control, and scrubber for temporal data. Supports single-timestamp and time-window modes.

## Hooks

- **`useAnimationClock`** — requestAnimationFrame-based playback clock with speed control.
- **`useTitiler`** — Connects to a TiTiler instance, fetches COG metadata/statistics, builds tile URLs.
- **`useSTAC`** — Searches STAC catalogs and manages item selection.
- **`useColorScale`** — Generates color arrays from named colormaps for legend rendering.
- **`useTimeRange`** — Dual-handle time window state management.

## Layer Helpers

- **`createCOGLayer`** — Creates a deck.gl TileLayer configured for TiTiler COG tiles.
- **`createSTACLayer`** — Creates a COG layer directly from a STAC item.

## Colormaps

Built-in: `viridis`, `magma`, `inferno`, `plasma`, `cividis`, `coolwarm`, `RdYlGn`, `RdBu`, `YlOrRd`, `Blues`, `Greens`.

## Cursor Skills

The `skills/` directory contains prompt documents for AI coding assistants. See `skills/README.md`.

## Theming

Override CSS custom properties to theme all components:
```css
:root {
  --mt-bg: rgba(255, 255, 255, 0.9);
  --mt-accent: #3b82f6;
  --mt-border: #e5e7eb;
  --mt-text-primary: #111827;
  --mt-radius: 8px;
}
```

Dark mode: set `data-theme="dark"` on any ancestor element.

## License

MIT
````

### Verify phase 4

- [ ] README renders correctly in a markdown preview
- [ ] Quick start code example uses correct imports and API

### Status report
Report that the README was created.

---

## Final Verification

After all four phases, run:
```bash
npm run build
npm run test
```

Then verify `dist/style.css` contains Tailwind utility classes, `dist/index.d.ts` includes `rescale` in `UseTitilerOptions`, and all tests pass.

Report the full build output and test results.