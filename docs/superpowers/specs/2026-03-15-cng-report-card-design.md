# CNG Report Card — Design Spec

**Date:** 2026-03-15
**Status:** Approved for implementation
**Context:** CNG Sandbox (`sandbox/`) — map page at `/map/{dataset-id}`

---

## Problem

The CNG Sandbox successfully converts data and renders it on a map, but a first-time uploader has no way to understand *what just happened* or *why it matters*. The credits panel names the tools but doesn't explain the value. A scientist wanting to advocate for CNG adoption within their organization needs concrete, quotable evidence — not a list of tool names.

---

## Goal

Give uploaders a passive, always-available summary of what their conversion achieved — in terms legible to a non-developer audience. The output should be something they can screenshot and share with a manager or program officer.

**Primary audience:** The uploader (scientist, GIS analyst, conservationist). Not the shared URL recipient.

**Message priority (informed by product discussion):**
1. **Portability** — anyone can view this, no software required
2. **Efficiency** — smaller, faster to load than the original
3. **Capabilities unlocked** — things now possible that weren't before
4. **Open source pipeline** — already covered by the existing credits panel

---

## Design Decision

**Option chosen: CNG Report Card — collapsible bottom drawer**

Rejected alternatives:
- *Enhanced credits panel* — sidebar already dense; insufficient space for visual stats
- *Before/After map toggle* — "before" state would require simulating a broken renderer, which feels contrived and sales-y. A live rendering comparison (e.g. GeoJSON vs PMTiles split map) is feasible but deferred — it only works for vector formats and is better suited as a future active feature once the passive baseline proves its value.

---

## UI Design

### Trigger

A **"See what changed →"** text button appears in the map page header (alongside the existing Share and New Upload buttons). Clicking it slides up the drawer from the bottom of the page. An ✕ button closes it.

### Drawer layout

Full-width panel below the map. Contains:

**1. File header**
- Dataset filename
- Format transformation bar: `[.shp Shapefile] —— GeoPandas → tippecanoe ——→ [.pmtiles PMTiles]`
- Visual gradient arrow from grey (original) to orange (CNG output)

**2. Four stat cards in a 2×2 grid**

| Card | Content |
|------|---------|
| **File size** | Bar chart: original vs. converted size. Headline: "X% smaller". Below: feature count with geometry type (e.g. "24,891 polygon features · all preserved") and sub-label "Attributes, geometry, and CRS intact" |
| **Data fetched for this view** | Highlighted card (orange border, "Live" badge). Large stat: bytes loaded for the current viewport (e.g. "47 KB"). Comparison row: full file size vs. this view. Sub-text: "Pan or zoom to see this update — only the tiles you look at are ever fetched." |
| **To share this map** | Before: "Email a [X MB] file. ~[N min] to download on 4G. Recipient needs ArcGIS or QGIS." After: "Send a URL. Opens in any browser. No software required. No license." |
| **Now possible** | Checklist: shareable URL, zoom to any scale, click to inspect attributes, embed in any webpage, no license/server. Footer: zoom range (e.g. "z0–z14, auto-selected") |

**3. Footer**
- "Converted using open source tools maintained by Development Seed and the community. See the full pipeline →" (links to credits panel / scrolls sidebar into view)

---

## Data Requirements

### Backend: new fields needed on dataset response

The ingestion API's `GET /api/datasets/{id}` response must be extended with:

| Field | Source | Notes |
|-------|--------|-------|
| `original_file_size` | Stored at upload time | Bytes of the raw uploaded file |
| `converted_file_size` | MinIO object size after conversion | Bytes of the .pmtiles or .cog file |
| `feature_count` | GeoParquet row count (vector) or None (raster) | Captured during conversion |
| `geometry_type` | GeoParquet geometry inspection | e.g. `"Polygon"`, `"LineString"`, `"Point"` |
| `max_zoom` | tippecanoe output metadata (vector) or COG overview count (raster) | The highest zoom level available |
| `min_zoom` | Always 0 for PMTiles/COG | Can be hardcoded |

Estimated download time is **derived on the frontend** from `original_file_size` — no backend work needed. Formula: `seconds = (bytes / 1_500_000)` (assumes ~12 Mbps / 4G average throughput), displayed as "~N min" or "~N sec".

### Frontend: Performance API integration

The "data fetched for this view" stat reads from `window.performance.getEntriesByType('resource')` after the map fires its `idle` event. Filter entries by tile URL patterns (PMTiles range requests match `/vector/` or `.pmtiles`; COG tiles match `/raster/`). Sum `transferSize` across matching entries.

This requires a `useTileTransferSize` hook in the sandbox frontend that:
1. Registers a listener on the map's `idle` event
2. Re-reads the Performance API on each idle
3. Returns the cumulative `transferSize` in bytes

The "Live" badge on the card signals the stat updates as the user pans/zooms.

---

## Raster vs Vector handling

| Format | File size card | Data fetched card | Features card |
|--------|---------------|------------------|---------------|
| Vector (PMTiles) | original vs .pmtiles size | sum of range request `transferSize` | polygon/line/point count from GeoParquet |
| Raster (COG) | original vs .cog size | sum of tile request `transferSize` | hidden (not applicable) |

For raster datasets, the "polygon features" section of the file size card is omitted. The remaining three cards apply to all formats.

---

## What's deferred

- **Live split-map comparison** (GeoJSON vs PMTiles side-by-side) — feasible for vector only, deferred until passive baseline proves its value
- **Loading race / performance comparison** — requires more complex timing instrumentation
- **"Data fetched" for the shared URL recipient** — the stat is shown in the drawer, but the recipient framing (vs. the uploader framing) is a separate design question

---

## Success criteria

- A non-developer uploader can screenshot the drawer and explain CNG adoption to their manager using only what's on screen
- The "data fetched for this view" stat visibly updates when the user pans or zooms the map
- All stats are derived from real data — nothing is hardcoded or estimated beyond the 4G download time formula
- The drawer does not require any changes to the existing credits panel or map layout
