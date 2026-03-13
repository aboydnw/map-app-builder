# Skill: GeoJSON to GeoParquet

## When to use

When you have a GeoJSON file and need to convert it to GeoParquet for efficient columnar storage, smaller file sizes, and cloud-native access.

## Prerequisites

- Python 3.10+
- `pip install geopandas pyarrow shapely`

## Scripts

| File | Purpose |
|------|---------|
| [`scripts/convert.py`](scripts/convert.py) | Convert a GeoJSON file to GeoParquet |
| [`scripts/validate.py`](scripts/validate.py) | Validate that GeoParquet preserves all data from the source GeoJSON |

## Quickstart

    pip install geopandas pyarrow shapely
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

_Populated during development._

## Changelog

_Updated during development._
