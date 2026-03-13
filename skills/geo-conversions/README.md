# Geospatial File Conversion Skills

Standalone Python utilities for converting legacy geospatial formats to cloud-native equivalents. Each skill is independently distributable — copy a single skill folder to any machine with Python 3.10+ and use it directly.

## Skills

| Skill | Input | Output |
|-------|-------|--------|
| `geotiff-to-cog` | GeoTIFF (.tif, .tiff) | Cloud-Optimized GeoTIFF |
| `shapefile-to-geoparquet` | Shapefile (.shp + companions) | GeoParquet (.parquet) |
| `geojson-to-geoparquet` | GeoJSON (.geojson, .json) | GeoParquet (.parquet) |

## Usage pattern

Each skill has the same interface:

1. Install dependencies: `pip install <packages listed in SKILL.md>`
2. Convert: `python scripts/convert.py --input <source> --output <destination>`
3. Validate: `python scripts/validate.py --input <source> --output <destination>`

Run `python scripts/validate.py` with no arguments to execute a self-test.
