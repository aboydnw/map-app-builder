# Skill: Add Animated Arc Flows

## When to use
When visualizing directional flows between locations — trade routes, migration, supply chains, network connections.

## Prerequisites
- Working map app shell (see `setup-map-app` skill)
- Flow data with source/target coordinates

## Template files

Copy and adapt the templates in `templates/` for each step:

| File | Purpose |
|------|---------|
| `templates/flow-data.ts` | FlowData interface and sample data |
| `templates/arc-layer.tsx` | Basic static ArcLayer creation |
| `templates/animated-arc-layer.tsx` | Animated ArcLayer with useAnimationClock + getTilt |
| `templates/trips-layer.tsx` | TripsLayer alternative for smooth trail effects |
| `templates/arc-categories.tsx` | Category definitions and hex-to-RGB color mapping |
| `templates/arc-tooltip.tsx` | Tooltip integration with useFeatureState |

## Data sources

**OpenFlights** provides free airport and route data suitable for arc visualizations:
- Airports: `https://raw.githubusercontent.com/jpatokal/openflights/master/data/airports.dat` (CSV with name, city, IATA, lat, lng)
- Routes: `https://raw.githubusercontent.com/jpatokal/openflights/master/data/routes.dat` (CSV with source/dest airport IDs)

## Steps

### 1. Prepare flow data

Define a `FlowData` interface with source/target coordinate pairs and a value for sizing.

See `templates/flow-data.ts` for the interface and sample data.

### 2. Create the ArcLayer

Create a basic `ArcLayer` with width scaled by value.

See `templates/arc-layer.tsx` for a static arc layer factory function.

### 3. Add trail animation

Use `useAnimationClock` with `getTilt` to create a rotating arc effect that simulates motion. The key pattern: multiply `clock.currentIndex` by a factor (e.g. `* 6`) and pass it to `getTilt`, with an `updateTriggers` entry so deck.gl re-renders each frame.

See `templates/animated-arc-layer.tsx` for the full animated layer hook.

For smoother trail animation, consider using `TripsLayer` instead — see `templates/trips-layer.tsx`.

### 4. Color by category

Map category strings to RGB colors using a `Map` lookup, then pass the accessor to `getSourceColor`/`getTargetColor`.

See `templates/arc-categories.tsx` for category definitions and a categorized arc layer factory.

### 5. Add tooltip on hover

Wire `useFeatureState` to DeckGL's `onHover` and `getCursor`, then conditionally render a `FeatureTooltip`.

See `templates/arc-tooltip.tsx` for a reusable tooltip hook.

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

## Reference test app
- `tests/earthquake-arcs/` — working example with animated arcs using `useAnimationClock` and `getTilt` for arc animation
