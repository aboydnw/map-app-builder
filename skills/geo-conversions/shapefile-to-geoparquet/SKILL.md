# Skill: Shapefile to GeoParquet

## When to use

When you have a Shapefile and need to convert it to GeoParquet for efficient columnar storage, cloud access, and modern geospatial workflows.

## Prerequisites

- Python 3.10+
- `pip install geopandas pyarrow shapely numpy`

## Scripts

| File | Purpose |
|------|---------|
| [`scripts/convert.py`](scripts/convert.py) | Convert a Shapefile to GeoParquet |
| [`scripts/validate.py`](scripts/validate.py) | Validate that GeoParquet preserves all data from the source Shapefile |

## Quickstart

    pip install geopandas pyarrow shapely numpy
    python scripts/convert.py --input data.shp --output data.parquet
    python scripts/validate.py --input data.shp --output data.parquet

## CLI flags

### convert.py

| Flag | Required | Default | Description |
|------|----------|---------|-------------|
| `--input` | Yes | — | Path to input .shp file (companion .dbf, .shx, .prj resolved automatically) |
| `--output` | Yes | — | Path for output .parquet file |
| `--overwrite` | No | False | Overwrite output if it exists |
| `--verbose` | No | False | Print detailed progress |

### validate.py

| Flag | Required | Default | Description |
|------|----------|---------|-------------|
| `--input` | No | — | Path to original Shapefile (omit for self-test) |
| `--output` | No | — | Path to converted GeoParquet (omit for self-test) |

When both `--input` and `--output` are omitted, runs a self-test that generates synthetic data, converts it, and validates the result.

## Known failure modes

- Comparing CRS via `str(crs)` fails because Shapefile and GeoParquet serialize the same CRS differently (e.g. "EPSG:4326" vs full PROJJSON). Must use pyproj CRS equality (`src.crs == dst.crs`).
- **Zipped Shapefiles with nested directories**: `gpd.read_file("data.zip")` fails if the .shp is inside a subdirectory within the zip. The convert/validate scripts extract the zip and walk the directory tree to find the .shp file.
- **Uppercase column names break PostgreSQL/tipg**: Shapefiles commonly have uppercase column names (e.g. `NAME`, `AREA_KM2`). GeoPandas preserves case when writing to PostgreSQL via `to_postgis()`, using quoted identifiers. But tipg queries columns without quoting, causing `column "name" does not exist` errors. Fix: `convert.py` now lowercases all columns immediately after reading (`gdf.columns = [c.lower() for c in gdf.columns]`). The validate script checks for this and uses case-insensitive column comparison so it doesn't false-fail on the lowercasing.

## Changelog

- 2026-03-14: Fixed uppercase column names — convert.py now lowercases all columns after read. Updated validate.py to use case-insensitive column comparison and case-aware attribute fidelity check. Added lowercase column name validation check (PostgreSQL/tipg compatibility). Documented nested zip and uppercase column failure modes.
- 2026-03-13: Fixed CRS comparison in validate.py — use pyproj equality instead of string comparison.
