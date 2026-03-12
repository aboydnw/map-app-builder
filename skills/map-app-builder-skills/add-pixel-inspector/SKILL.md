# Skill: Add a Pixel Inspector

## When to use
When you want users to hover or click on a raster layer to see the underlying band values at that point — for example, inspecting temperature, elevation, or NDVI values from a COG.

## Prerequisites
- Working map app shell with a COG layer (see `setup-map-app` and `add-cog-layer` skills)
- A running TiTiler instance that supports the `/cog/point/{lng},{lat}` endpoint
- `VITE_TITILER_URL` set in `.env`

## Template files

| File | Description |
|------|-------------|
| `templates/pixel-inspector-example.tsx` | Complete App with hover-to-inspect, custom formatting, and combined feature interaction |

## Steps

### 1. Set up the inspector

See `templates/pixel-inspector-example.tsx` for the complete integration. The key pieces:

- **`usePixelInspector` hook** — returns `inspect(lng, lat)`, `value`, `isLoading`, and `clear()`. Pass it your TiTiler base URL and the COG URL to query.
- **DeckGL `onHover`** — route hover events to `inspector.inspect()` when coordinates exist, and `inspector.clear()` when the mouse leaves.
- **`PixelInspector` component** — renders the value panel. Place it inside the map container.
- **`formatValue` callback** — customize band value display (e.g. `"b1"` → `"23.5 °C"`).

For **click-to-inspect** instead of hover, use DeckGL's `onClick` instead of `onHover`:
```tsx
onClick={(info) => {
  if (info.coordinate) {
    inspector.inspect(info.coordinate[0], info.coordinate[1]);
  }
}}
```

### 2. Combining with feature interaction

If you also have vector layers with tooltips, route hover events to both `usePixelInspector` and `useFeatureState` — see the template file for the combined pattern.

### 3. Verify

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
