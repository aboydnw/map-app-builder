# Skill: Add Animated Arc Flows

## When to use
When visualizing directional flows between locations — trade routes, migration, supply chains, network connections.

## Prerequisites
- Working map app shell (see `setup-map-app` skill)
- Flow data with source/target coordinates

## Steps

### 1. Prepare flow data

```tsx
interface FlowData {
  source: [number, number]; // [lng, lat]
  target: [number, number];
  value: number;
  category?: string;
}

const flows: FlowData[] = [
  { source: [-95.7, 37.1], target: [2.3, 48.9], value: 1500, category: "grain" },
  { source: [-95.7, 37.1], target: [139.7, 35.7], value: 800, category: "tech" },
  { source: [116.4, 39.9], target: [-95.7, 37.1], value: 2200, category: "manufacturing" },
];
```

### 2. Create the ArcLayer

```tsx
import { ArcLayer } from "@deck.gl/layers";

const arcLayer = new ArcLayer({
  id: "flows",
  data: flows,
  getSourcePosition: (d) => d.source,
  getTargetPosition: (d) => d.target,
  getSourceColor: [0, 128, 255],
  getTargetColor: [255, 128, 0],
  getWidth: (d) => Math.sqrt(d.value) / 5,
  widthUnits: "pixels",
  pickable: true,
});
```

### 3. Add trail animation

Use the `currentTime` prop with `getHeight` to create an animated "traveling" effect:

```tsx
import { useAnimationClock } from "@maptool/core";

const clock = useAnimationClock({ totalFrames: 120, fps: 30, loop: true });

const arcLayer = new ArcLayer({
  id: "flows",
  data: flows,
  getSourcePosition: (d) => d.source,
  getTargetPosition: (d) => d.target,
  getSourceColor: [0, 128, 255],
  getTargetColor: [255, 128, 0],
  getWidth: (d) => Math.sqrt(d.value) / 5,
  widthUnits: "pixels",
  getHeight: 0.5,
  getTilt: clock.currentIndex * 3,  // rotates arc for visual motion
  pickable: true,
  transitions: {
    getTilt: { duration: 33, type: "interpolation" },
  },
});
```

For smoother trail animation, consider using `TripsLayer`:

```tsx
import { TripsLayer } from "@deck.gl/geo-layers";

const tripsLayer = new TripsLayer({
  id: "flow-trails",
  data: flows,
  getPath: (d) => [d.source, d.target],
  getTimestamps: () => [0, 1],
  getColor: [0, 180, 255],
  getWidth: (d) => Math.sqrt(d.value) / 5,
  widthUnits: "pixels",
  currentTime: (clock.currentIndex / 120) % 1,
  trailLength: 0.4,
  fadeTrail: true,
});
```

### 4. Color by category

```tsx
import type { CategoryEntry } from "@maptool/core";

const categories: CategoryEntry[] = [
  { value: "grain", color: "#4CAF50", label: "Grain" },
  { value: "tech", color: "#2196F3", label: "Technology" },
  { value: "manufacturing", color: "#FF9800", label: "Manufacturing" },
];

const colorMap = new Map(categories.map((c) => {
  const n = parseInt(c.color.replace("#", ""), 16);
  return [c.value, [(n >> 16) & 255, (n >> 8) & 255, n & 255] as [number, number, number]];
}));

const arcLayer = new ArcLayer({
  id: "flows",
  data: flows,
  getSourcePosition: (d) => d.source,
  getTargetPosition: (d) => d.target,
  getSourceColor: (d) => colorMap.get(d.category) ?? [200, 200, 200],
  getTargetColor: (d) => colorMap.get(d.category) ?? [200, 200, 200],
  getWidth: (d) => Math.sqrt(d.value) / 5,
  widthUnits: "pixels",
  pickable: true,
});
```

### 5. Add tooltip on hover

```tsx
import { useFeatureState, FeatureTooltip } from "@maptool/core";

const featureState = useFeatureState();

// On DeckGL:
<DeckGL onHover={featureState.onHover} getCursor={featureState.getCursor}>

// Tooltip:
{featureState.hoveredFeature && featureState.hoverCoordinates && (
  <FeatureTooltip x={featureState.hoverCoordinates.x} y={featureState.hoverCoordinates.y}>
    <strong>{String(featureState.hoveredFeature.category)}</strong>
    <div>Volume: {Number(featureState.hoveredFeature.value).toLocaleString()}</div>
  </FeatureTooltip>
)}
```

### 6. Verify

- [ ] Arcs render between source and target points
- [ ] Arc width reflects flow magnitude
- [ ] Colors match categories
- [ ] Animation runs smoothly (30fps target)
- [ ] Hovering an arc shows tooltip
- [ ] Legend reflects category colors

## Common mistakes
- **Coordinates in wrong order** — deck.gl uses `[longitude, latitude]`, not `[lat, lng]`
- **Arc width too small/large** — use `Math.sqrt(value)` or `Math.log(value)` scaling for large value ranges
- **TripsLayer path format** — `getPath` must return an array of `[lng, lat]` points; for arcs, interpolate intermediate points for a smooth curve
- **Missing auto-play** — call `clock.setPlaying(true)` on mount or provide a play button

## Reference files
- `@deck.gl/layers` — `ArcLayer`
- `@deck.gl/geo-layers` — `TripsLayer`
- `src/hooks/useAnimationClock.ts` — animation clock for trail timing
- `src/hooks/useFeatureState.ts` — hover/click state
