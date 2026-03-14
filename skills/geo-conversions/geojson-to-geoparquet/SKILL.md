# Skill: GeoJSON to GeoParquet

## When to use

When you have a GeoJSON file and need to convert it to GeoParquet for efficient columnar storage, smaller file sizes, and cloud-native access.

## Prerequisites

- Python 3.10+
- `pip install geopandas pyarrow shapely numpy`

## Scripts

| File | Purpose |
|------|---------|
| [`scripts/convert.py`](scripts/convert.py) | Convert a GeoJSON file to GeoParquet |
| [`scripts/validate.py`](scripts/validate.py) | Validate that GeoParquet preserves all data from the source GeoJSON |

## Quickstart

    pip install geopandas pyarrow shapely numpy
    python scripts/convert.py --input data.geojson --output data.parquet
    python scripts/validate.py --input data.geojson --output data.parquet

## CLI flags

### convert.py

| Flag | Required | Default | Description |
|------|----------|---------|-------------|
| `--input` | Yes | — | Path to input .geojson or .json file |
| `--output` | Yes | — | Path for output .parquet file |
| `--overwrite` | No | False | Overwrite output if it exists |
| `--verbose` | No | False | Print detailed progress |

### validate.py

| Flag | Required | Default | Description |
|------|----------|---------|-------------|
| `--input` | No | — | Path to original GeoJSON (omit for self-test) |
| `--output` | No | — | Path to converted GeoParquet (omit for self-test) |

When both `--input` and `--output` are omitted, runs a self-test that generates synthetic data, converts it, and validates the result.

## Known failure modes

- Comparing CRS via `str(crs)` fails because GeoJSON and GeoParquet serialize the same CRS differently (e.g. "EPSG:4326" vs full PROJJSON). Must use pyproj CRS equality (`src.crs == dst.crs`).
- **Uppercase column names break PostgreSQL/tipg**: Some GeoJSON files (e.g. Natural Earth data) use uppercase property names. tipg queries columns without quoting, causing `column "NAME" does not exist` errors at tile-serve time. Fix: `convert.py` now lowercases all column names at read time (`gdf.columns = [c.lower() for c in gdf.columns]`). Validation checks are case-insensitive for column matching and attribute fidelity so they don't false-fail after the rename.

## Changelog

- 2026-03-14: Moved lowercase-column fix into convert.py (applied at read time, not ingest time); updated validation checks to be case-insensitive for column matching and attribute fidelity.
- 2026-03-14: Added lowercase column name validation check (PostgreSQL/tipg compatibility).
- 2026-03-13: Fixed CRS comparison in validate.py — use pyproj equality instead of string comparison.
