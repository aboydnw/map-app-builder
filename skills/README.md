# maptool Skills

Self-contained prompt documents for common workflows using `@maptool/core`.

## How to use

1. Keep this `skills/` directory in your project root.
2. When working in Cursor or Claude Code, reference a skill explicitly:
   - "Follow `skills/setup-map-app/SKILL.md`"
   - "Use `skills/add-cog-layer/SKILL.md` for this task"
3. Keep the skill instructions close to code by linking the reference files listed in each skill.

---

## Common workflows

Skill chains for typical use cases. Follow these in order.

**"I have COG files and want to see them on a map" (local dev)**
1. `setup-map-app` — scaffold the app
2. `setup-local-stac` — start TiTiler + STAC + file server
3. `ingest-stac-data` — register your COGs in the catalog
4. `add-cog-layer` or `add-stac-layer` — visualize

**"I need a production geospatial API"**
1. `deploy-eoapi` — stand up eoAPI (local Docker or cloud)
2. `setup-map-app` — scaffold a frontend
3. `add-stac-layer` — visualize from the STAC catalog

**"I want a rich dashboard with temporal data"**
1. `setup-map-app` → `set-app-layout` — app structure
2. `add-cog-layer` or `add-stac-layer` — base raster layer
3. `add-animation` — temporal playback
4. `add-pixel-inspector` — point inspection
5. `add-time-series-chart` — charting
6. Or skip steps 2-5 and use `build-climate-dashboard` for an all-in-one

---

## Getting started

| Skill | Description |
|-------|-------------|
| `setup-map-app` | Scaffold a Vite + React + deck.gl + MapLibre app with a local TiTiler instance |
| `set-app-layout` | Establish the spatial layout — sidebars, bottom bars, panel regions around the map |

---

## Infrastructure & data

Skills for standing up backends, ingesting data, and serving rasters.

| Skill | Description |
|-------|-------------|
| `setup-local-stac` | Stand up a local STAC API + TiTiler + nginx file server via Docker Compose (dev-only) |
| `deploy-eoapi` | Deploy the full eoAPI stack (STAC, titiler-pgstac, tipg) locally or to cloud (AWS CDK, Helm) |
| `ingest-stac-data` | Convert local COG files into STAC items and ingest them into the `setup-local-stac` stack |

---

## Raster layers

| Skill | Description |
|-------|-------------|
| `add-cog-layer` | Fetch COG metadata from TiTiler, render a raster tile layer, and add a matching legend |
| `add-stac-layer` | Search a STAC catalog, select items, and render assets as a map layer |
| `add-pmtiles-raster-layer` | Display a pre-rendered raster PMTiles archive with a manually configured legend |
| `manage-colormaps` | Control colormap selection, nodata transparency, and custom colormaps for TiTiler tile URLs |

---

## Vector layers

| Skill | Description |
|-------|-------------|
| `add-vector-layer` | Display GeoJSON or MVT data with feature interaction (hover, click, tooltips) |
| `add-pmtiles-vector-layer` | Display a vector PMTiles archive (e.g. Overture Maps buildings) with color mapping and tooltips |
| `add-animated-arcs` | Visualize directional flows between locations — trade routes, migration, network connections |
| `add-particle-layer` | Animate particles over a flow field (wind, ocean currents) using a custom deck.gl layer |
| `add-raster-vector-overlay` | Combine a COG raster layer with a GeoJSON or PMTiles vector layer on the same map |

---

## Map UI components

| Skill | Description |
|-------|-------------|
| `add-layer-selector` | Floating panel for toggling layer visibility |
| `add-date-selector` | Date picker for filtering temporal map data |
| `add-aoi-selector` | Draw or upload an area of interest for spatial filtering or data scoping |
| `add-location-search` | Geocoding search box that flies the map to a searched location |
| `add-details-panel` | Slide-in side panel for feature details, metadata, or supplemental content |
| `add-compare-swipe` | Side-by-side layer comparison with a draggable divider |
| `add-pixel-inspector` | Hover/click a raster layer to inspect raw band values at that point |
| `add-llm-chat` | Chat-style UI shell for LLM-powered natural language interaction with the map |

---

## Data visualization

| Skill | Description |
|-------|-------------|
| `add-animation` | Add temporal playback with `AnimationTimeline` and `useAnimationClock` |
| `add-time-series-chart` | Display temporal trends for map data using recharts |
| `build-climate-dashboard` | Full-featured climate dashboard combining animation, raster, vector, timeline, legend, and pixel inspection |

---

## Map projection

| Skill | Description |
|-------|-------------|
| `add-globe-view` | Switch to deck.gl's `GlobeView` for 3D globe visualization of global datasets |

---

## Testing

| Skill | Description |
|-------|-------------|
| `write-tests` | Add unit and E2E tests for maptool components, hooks, and utilities |
