# Skill: Add a Pixel Inspector

## When to use
When you want users to hover or click on a raster layer to see the underlying band values at that point — for example, inspecting temperature, elevation, or NDVI values from a COG.

## Prerequisites
- Working map app shell with a COG layer (see `setup-map-app` and `add-cog-layer` skills)
- A running TiTiler instance that supports the `/cog/point/{lng},{lat}` endpoint
- `VITE_TITILER_URL` set in `.env`

## Steps

### 1. Import maptool pieces

```tsx
import { usePixelInspector, PixelInspector } from "@maptool/core";
```

### 2. Set up the inspector hook

```tsx
const inspector = usePixelInspector({
  baseUrl: import.meta.env.VITE_TITILER_URL,
  cogUrl: "https://example.com/temperature.tif",
  debounceMs: 150,
});
```

The hook returns:
- `inspect(lng, lat)` — call this with coordinates to query the raster value
- `value` — the latest `PointValue` result (`{ coordinates, values }`) or `null`
- `isLoading` — whether a query is in flight
- `clear()` — reset the value and cancel pending requests

### 3. Wire up DeckGL hover events

Pass `inspect` to the DeckGL `onHover` callback to query on mouse move:

```tsx
<DeckGL
  viewState={viewState}
  onViewStateChange={({ viewState: vs }) => setViewState(vs as ViewState)}
  layers={layers}
  onHover={(info) => {
    if (info.coordinate) {
      inspector.inspect(info.coordinate[0], info.coordinate[1]);
    } else {
      inspector.clear();
    }
  }}
  controller
>
  <Map mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json" />
</DeckGL>
```

For click-to-inspect instead of hover:
```tsx
<DeckGL
  // ...
  onClick={(info) => {
    if (info.coordinate) {
      inspector.inspect(info.coordinate[0], info.coordinate[1]);
    }
  }}
>
```

### 4. Render the inspector panel

Place the `PixelInspector` component inside your map container:

```tsx
<PixelInspector
  value={inspector.value}
  isLoading={inspector.isLoading}
  position="top-right"
/>
```

### 5. Custom value formatting

By default, values display as raw numbers. Pass a `formatValue` function for better readability:

```tsx
<PixelInspector
  value={inspector.value}
  isLoading={inspector.isLoading}
  position="top-right"
  formatValue={(bandName, val) => {
    if (bandName === "b1") return `${val.toFixed(1)} °C`;
    return String(val);
  }}
/>
```

### 6. Combining with feature interaction

If you also have vector layers with tooltips, you can use both `usePixelInspector` and `useFeatureState` together. Route hover events to both:

```tsx
const featureState = useFeatureState();
const inspector = usePixelInspector({ baseUrl, cogUrl });

<DeckGL
  onHover={(info) => {
    featureState.onHover(info);
    if (info.coordinate) {
      inspector.inspect(info.coordinate[0], info.coordinate[1]);
    } else {
      inspector.clear();
    }
  }}
  // ...
>
```

### 7. Verify

Run `npm run dev` and confirm:
- [ ] Hovering over the raster shows the inspector panel with band values
- [ ] Moving the mouse updates values with a short debounce delay
- [ ] Moving off the map clears the inspector
- [ ] Coordinates display in the panel header
- [ ] Loading spinner appears briefly during fetch

## Common mistakes
- **TiTiler missing `/cog/point` endpoint** — older or custom TiTiler deployments may not support this endpoint. Verify by visiting `http://localhost:8000/docs` and checking for `/cog/point/{lng},{lat}`.
- **Not debouncing** — without debouncing, every pixel of mouse movement fires a network request. The default `debounceMs: 150` is a good balance. Increase it for slow connections or busy servers.
- **Querying outside COG bounds** — TiTiler returns a 404 or error for points outside the raster extent. The hook handles this gracefully by setting `value` to `null`.
- **Forgetting to call `clear()`** — if you don't clear the inspector when the mouse leaves the map, the last value will stay visible. Always call `inspector.clear()` when `info.coordinate` is undefined.
- **Wrong band names in `formatValue`** — TiTiler returns band names as `b1`, `b2`, etc. (1-indexed). Check the actual keys in `value.values` via console log if unsure.

## Reference files
- `src/hooks/usePixelInspector.ts` — `usePixelInspector` hook, `UsePixelInspectorOptions`
- `src/components/PixelInspector/PixelInspector.tsx` — `PixelInspector` component, `PixelInspectorProps`
- `src/utils/titiler.ts` — `fetchPointValue` function, `PointValue` type
