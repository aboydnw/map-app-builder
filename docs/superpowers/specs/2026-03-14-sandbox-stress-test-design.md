# Sandbox Stress Test Design

**Date:** 2026-03-14
**Scope:** CNG Sandbox (`sandbox/`) — ingestion pipeline, frontend UI, geo-conversion skills

## Goal

Stress-test the sandbox with 10 real-world geospatial files of varying formats, sizes, and edge cases. Identify bugs, fix them, update the relevant skills, and commit test files to the repo for manual testing.

## Supported Formats

The sandbox accepts four format pairs:

| Input | Output | Pipeline |
|-------|--------|----------|
| GeoTIFF (`.tif`, `.tiff`) | Cloud-Optimized GeoTIFF | GeoTIFF → COG → MinIO → pgSTAC → titiler-pgstac |
| Shapefile (`.shp`, `.zip`) | GeoParquet | Shapefile → GeoParquet → PostgreSQL → tipg |
| GeoJSON (`.geojson`, `.json`) | GeoParquet | GeoJSON → GeoParquet → PostgreSQL → tipg |
| NetCDF (`.nc`, `.nc4`) | Cloud-Optimized GeoTIFF | NetCDF → COG → MinIO → pgSTAC → titiler-pgstac |

## Test Files

One file per targeted edge case, plus baselines. Ordered by increasing complexity/risk.

| # | Format | File | Source | Est. Size | Edge Case |
|---|--------|------|--------|-----------|-----------|
| 1 | GeoJSON | `countries.geojson` | github.com/nvkelso/natural-earth-vector | ~4MB | Baseline vector, repo-safe |
| 2 | Shapefile | `ne_10m_airports.zip` | naturalearthdata.com | ~1MB | Uppercase column names (`IATA_CODE`, `NAME`) + ZIP |
| 3 | Shapefile | `ne_10m_admin_0_countries.zip` | naturalearthdata.com | ~5MB | Zipped, complex polygons |
| 4 | NetCDF | `air.mon.mean.nc` (GHCN temp) | psl.noaa.gov | ~8MB | Single variable, multiple timesteps — tests `--time-index` selection |
| 5 | NetCDF | `uwnd.mon.mean.nc` (u-wind) | psl.noaa.gov | ~8MB | Multi-variable — upload u-wind and v-wind as separate jobs |
| 6 | GeoTIFF | SRTM 1° DEM tile (`N36W112.tif`) | USGS EarthExplorer | ~25MB | Projected CRS (UTM) — tests STAC bounds reprojection fix |
| 7 | Shapefile | `HydroRIVERS_v10_gr_shp.zip` | hydrosheds.org | ~200MB | Large file, line geometries — download link only |
| 8 | GeoTIFF | Natural Earth Shaded Relief (`NE1_HR_LC.tif`) | naturalearthdata.com | ~86MB | Large baseline raster, WGS84 — download link only |
| 9 | GeoTIFF | NSIDC Arctic sea ice (`seaice_conc_monthly_*.tif`) | nsidc.org | ~1MB | Polar CRS (EPSG:3413) — tests Mercator clamping fix |
| 10 | GeoJSON | US Census County Boundaries | census.gov | ~60MB | Large, many features, complex polygons — download link only |

### Repo policy

- Files ≤ 50MB: committed to `sandbox/sample-data/`
- Files > 50MB: download links in `sandbox/sample-data/README.md` with source credits
- Files already present in `sandbox/sample-data/` (e.g. HydroRIVERS) are reused as-is

## Test Methodology

### Per-file test steps

1. **Start the stack** — `docker compose -f sandbox/docker-compose.yml up -d`; verify all containers healthy
2. **Navigate to frontend** — `http://localhost:5185` via Chrome DevTools MCP
3. **Upload the file** — use `fill`/`click`/`upload_file` MCP tools to submit via the upload UI
4. **Observe progress** — screenshot each SSE status stage (scanning → converting → validating → ingesting → ready)
5. **Inspect the map** — screenshot the rendered map; check tiles load, bounds are correct, no blank viewport
6. **Check console errors** — `list_console_messages` to catch silent JS failures
7. **Document outcome** — pass, fail with error, or visual defect

### Test order

Files are tested smallest-to-largest (fast feedback first). Each test is independent — the stack is not wiped between uploads so the datasets list accumulates.

### Bug classification

| Category | Examples | Fix location |
|----------|----------|-------------|
| Ingestion pipeline | CRS reprojection, column names, file parsing | `sandbox/ingestion/src/` |
| Frontend rendering | Blank map, wrong bounds, tile URL errors | `sandbox/frontend/src/` |
| Skill validation gap | A known failure not caught by `validate.py` | `skills/geo-conversions/<skill>/` |

## Bug Fix Protocol

From `sandbox/CLAUDE.md` — every bug found during this testing cycle must:

1. **Fix the root cause** in the ingestion pipeline or frontend (one atomic commit per bug)
2. **Update `validate.py`** — add a `CheckResult` that would have caught the issue
3. **Update `SKILL.md`** — document the failure mode, root cause, fix, and add a changelog entry

## Deliverables

| Deliverable | Location |
|-------------|----------|
| Repo-safe test files | `sandbox/sample-data/` |
| Download links for large files | `sandbox/sample-data/README.md` |
| Bug fixes (one commit each) | `sandbox/ingestion/`, `sandbox/frontend/` |
| Updated validation scripts | `skills/geo-conversions/<skill>/scripts/validate.py` |
| Updated skill docs | `skills/geo-conversions/<skill>/SKILL.md` |

## Known Pre-existing Edge Cases (already fixed)

These are documented in skill changelogs and should pass without issue — but are good regression checks:

- Projected CRS bounds reprojected to WGS84 before STAC registration (geotiff-to-cog)
- Polar CRS bounds clamped to ±85.051129° for Mercator viewport (geotiff-to-cog)
- Uppercase column names lowercased before PostgreSQL ingest (shapefile-to-geoparquet)
- Zipped shapefiles with nested directory structures (shapefile-to-geoparquet)
