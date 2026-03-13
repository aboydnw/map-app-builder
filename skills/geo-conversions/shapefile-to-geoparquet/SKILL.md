# Skill: Shapefile to GeoParquet

## When to use

When you have a Shapefile and need to convert it to GeoParquet for efficient columnar storage, cloud access, and modern geospatial workflows.

## Prerequisites

- Python 3.10+
- `pip install geopandas pyarrow shapely`

## Scripts

| File | Purpose |
|------|---------|
| [`scripts/convert.py`](scripts/convert.py) | Convert a Shapefile to GeoParquet |
| [`scripts/validate.py`](scripts/validate.py) | Validate that GeoParquet preserves all data from the source Shapefile |

## Quickstart

    pip install geopandas pyarrow shapely
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

_Populated during development._

## Changelog

_Updated during development._
