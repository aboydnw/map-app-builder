# Skill: Add a STAC Layer

## When to use
When you want to search a STAC catalog, select items, and render assets on the map.

## Prerequisites
- Working map app shell (see `setup-map-app` skill)
- `stac-react` and `@tanstack/react-query` installed
- App wrapped with `QueryClientProvider` and `StacApiProvider` (see `setup-map-app` skill)

## Template files

| File | Description |
|------|-------------|
| [`templates/stac-layer-example.tsx`](templates/stac-layer-example.tsx) | Full example: useStacSearch + item selection + useTitiler + MapLegend |
| [`templates/stac-shortcut.tsx`](templates/stac-shortcut.tsx) | Simplified pattern using createSTACLayer (no manual TiTiler wiring) |
| [`templates/planetary-computer-utils.ts`](templates/planetary-computer-utils.ts) | `buildPCTileUrl` for PC's tile API + `pickSmallestBbox` for multi-tile collections |

## Popular public STAC APIs
- **Earth Search (Element 84)**: `https://earth-search.aws.element84.com/v1`
  - Collections: sentinel-2-l2a, landsat-c2-l2, cop-dem-glo-30, naip
- **Microsoft Planetary Computer**: `https://planetarycomputer.microsoft.com/api/stac/v1`
  - Note: Requires token signing for asset URLs
- **NASA CMR STAC**: `https://cmr.earthdata.nasa.gov/stac`

## Steps

### 1. Search, select, and render with TiTiler

Use `templates/stac-layer-example.tsx` as a starting point. It demonstrates the full workflow: configure a STAC search, auto-select the first result, resolve a COG asset URL, build a tile layer via `useTitiler`, and wire up a `MapLegend`.

Key asset names vary by collection — common ones include `"visual"`, `"B04"`, `"red"`, `"data"`. Always inspect `getSTACItemAssets()` output to find the right name.

### 2. Alternative: use `createSTACLayer` shortcut

For simpler cases, use `templates/stac-shortcut.tsx`. It skips manual `useTitiler` wiring by using `createSTACLayer` directly.

Note: `createSTACLayer` throws if no compatible asset is found, so always guard with a `selectedItem` check.

## Planetary Computer direct tiler (no TiTiler needed)

Planetary Computer provides its own tile rendering API that can serve tiles directly from STAC items without running your own TiTiler. Use `templates/planetary-computer-utils.ts` for the `buildPCTileUrl` helper, then pass the result to `createCOGLayer({ id: "my-layer", tileUrl: buildPCTileUrl(...) })`.

### Planetary Computer gotchas

- **Temporal coverage varies by collection** — some collections stop receiving new data. For example, `noaa-cdr-sea-surface-temperature-optimum-interpolation` only has data through mid-2024. Always query recent items with `sortby: [{ field: "datetime", direction: "desc" }]` and inspect the actual date range before building a time-relative search (e.g. "last 30 days from now").
- **Multi-tile collections return multiple spatial items** — collections like `io-lulc-annual-v02` and `esa-worldcover` have multiple spatial tiles per time step. A spatial intersection query may return items covering the same area at different spatial scales. Use `pickSmallestBbox()` from `templates/planetary-computer-utils.ts` to select the item with the smallest bounding box that contains your area of interest.
- **Property names may not match documentation** — for example, `esa-worldcover` items use `"esa_worldcover:product_version": "1.0.0"` (not `"V1.0.0"`). Always inspect the raw STAC response to verify property values before filtering.

## Common mistakes
- **TiTiler not running** — ensure your local TiTiler instance is up (see `setup-map-app` skill, step 0) and `VITE_TITILER_URL` is set in `.env`
- **Missing `StacApiProvider`** — stac-react hooks require the provider to be set up (see `setup-map-app` skill)
- **Planetary Computer URLs expire** — you need their `planetary-computer` npm package to sign asset URLs before passing to TiTiler
- **Asset names vary by collection** — always inspect `getSTACItemAssets()` output to find the right asset name
- **POST search not supported everywhere** — some STAC APIs only support GET. Check the API docs if searches fail.
- **Date-relative STAC searches returning empty results** — if searching for "last N days" returns no items, the collection's temporal coverage may have ended. Query with `sortby desc` and no date filter first to discover the actual data range, then build your time window from that.
- **STAC spatial search returning wrong tile** — when a collection has multiple spatial tiles, the first result may not be the best one for your viewport. Use `pickSmallestBbox()` from the Planetary Computer utils template.

## Reference files
- [`stac-react`](https://github.com/developmentseed/stac-react) — `useStacSearch`, `useItem`, `StacApiProvider`
- `src/utils/stac-helpers.ts` — `getSTACItemAssets`, `extractTimestamps`
- `src/layers/STACLayer.ts` — `createSTACLayer` and `STACLayerOptions`
