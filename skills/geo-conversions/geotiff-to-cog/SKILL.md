# Skill: GeoTIFF to Cloud-Optimized GeoTIFF

## When to use

When you have a GeoTIFF file and need to convert it to a Cloud-Optimized GeoTIFF (COG) for efficient cloud-based access, tiling, and visualization.

## Prerequisites

- Python 3.10+
- `pip install rasterio rio-cogeo numpy`

## Scripts

| File | Purpose |
|------|---------|
| [`scripts/convert.py`](scripts/convert.py) | Convert a GeoTIFF to COG with configurable compression |
| [`scripts/validate.py`](scripts/validate.py) | Validate that a COG preserves all data from the source GeoTIFF |

## Quickstart

Install dependencies, convert a file, and validate the result:

    pip install rasterio rio-cogeo numpy
    python scripts/convert.py --input data.tif --output data_cog.tif
    python scripts/validate.py --input data.tif --output data_cog.tif

## CLI flags

### convert.py

| Flag | Required | Default | Description |
|------|----------|---------|-------------|
| `--input` | Yes | — | Path to input GeoTIFF |
| `--output` | Yes | — | Path for output COG |
| `--compression` | No | `DEFLATE` | Compression method: DEFLATE, ZSTD, or LZW |
| `--overwrite` | No | False | Overwrite output if it exists |
| `--verbose` | No | False | Print detailed progress |

### validate.py

| Flag | Required | Default | Description |
|------|----------|---------|-------------|
| `--input` | No | — | Path to original GeoTIFF (omit for self-test) |
| `--output` | No | — | Path to converted COG (omit for self-test) |

When both `--input` and `--output` are omitted, runs a self-test that generates synthetic data, converts it, and validates the result.

## Known failure modes

_Populated during development._

## Changelog

_Updated during development._
