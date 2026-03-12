# Skill: Add a PMTiles Raster Layer with Legend

## When to use
When you have a pre-rendered raster PMTiles archive (e.g. climate data, land cover, satellite imagery) and want to display it on the map with a manually configured legend.

## Prerequisites
- Working map app shell (see `setup-map-app` skill)
- `pmtiles` and `@tanstack/react-query` installed (see `setup-map-app` skill, PMTiles section)
- A publicly accessible raster PMTiles URL

## Template files

| File | Description |
|------|-------------|
| `templates/pmtiles-raster-example.tsx` | Complete app with PMTiles protocol registration, `usePMTiles` metadata, `createPMTilesRasterLayer`, bounds fitting, and categorical legend |
| `templates/maplibre-terrain.tsx` | MapLibre 3D terrain integration using Mapterhorn global DEM PMTiles with Terrarium encoding |

## Steps

### 1. Register the PMTiles protocol

The protocol must be registered once before any PMTiles layers load. Do this in your App component or a top-level effect. Call `createPMTilesProtocol()` from `@maptool/core`, then pass `protocol.tile` to MapLibre's `addProtocol`. Clean up on unmount with `removeProtocol` and `cleanup()`.

See `templates/pmtiles-raster-example.tsx` for the full pattern.

### 2. Fetch metadata and fit the map

Use `usePMTiles({ url })` to fetch archive metadata (bounds, zoom range). Use the returned `metadata.bounds` with `WebMercatorViewport.fitBounds()` to center the map on the data extent.

### 3. Create the raster layer

Call `createPMTilesRasterLayer()` with the PMTiles URL (prefixed with `pmtiles://`), bounds, minZoom, and maxZoom from metadata. Pass the resulting layer to `<DeckGL layers={[...]} />`.

### 4. Add a manual legend

Raster PMTiles have baked-in colors — the archive contains pre-rendered image tiles, so there is no colormap to apply at runtime. You must configure the legend manually to match the source's color scheme.

Use `<MapLegend>` with `type: "categorical"` for classified data (land cover, etc.) or `type: "continuous"` for gradient data (temperature, etc.). Both examples are shown in `templates/pmtiles-raster-example.tsx`.

For continuous data, use a configuration like:
```tsx
{
  type: "continuous",
  id: "temperature",
  title: "Temperature",
  unit: "°C",
  domain: [-20, 40],
  colors: ["#2166ac", "#67a9cf", "#fddbc7", "#ef8a62", "#b2182b"],
  ticks: 5,
}
```

### 5. PMTiles for MapLibre terrain (raster-dem)

PMTiles raster archives can also serve as MapLibre terrain sources for 3D elevation. The Mapterhorn global DEM uses Terrarium encoding (not Mapbox encoding) — set `encoding: "terrarium"` in the source config.

See `templates/maplibre-terrain.tsx` for the complete pattern.

### 6. Verify

Run `npm run dev` and confirm:
- [ ] Raster tiles load and are visible on the map
- [ ] Map fits to the data extent on load
- [ ] Legend appears with colors matching the raster tiles
- [ ] Zoom in/out works within the min/max zoom range
- [ ] No console errors about pmtiles protocol

## Common mistakes
- **Forgetting to register the PMTiles protocol** — tiles will fail to load with a `pmtiles://` URL scheme error. The `addProtocol` call must happen before any layer tries to fetch tiles.
- **Not prefixing the URL with `pmtiles://`** — the layer URL must start with `pmtiles://` for the protocol handler to intercept tile requests. The raw HTTPS URL won't work.
- **Trying to apply a colormap at runtime** — raster PMTiles contain pre-rendered image tiles. Unlike COG layers served through TiTiler, you cannot change the colormap. The legend must be manually configured to match whatever colors were baked in during tile generation.
- **Missing `@tanstack/react-query`** — `usePMTiles` requires a `QueryClientProvider` ancestor. See `setup-map-app` skill for provider setup.
- **Using `loading` instead of `isLoading`** — `usePMTiles` returns `isLoading` (React Query convention), not `loading` like `useTitiler`.

## Reference files
- `src/utils/pmtiles.ts` — `createPMTilesProtocol`, `fetchPMTilesMetadata`
- `src/hooks/usePMTiles.ts` — `usePMTiles` hook, `UsePMTilesOptions`
- `src/layers/PMTilesRasterLayer.ts` — `createPMTilesRasterLayer`, `PMTilesRasterLayerOptions`
- `src/components/MapLegend/types.ts` — legend configuration types

## Reference test app
- `tests/coastal-explorer/` — working example with PMTiles raster terrain and protocol registration
