#!/usr/bin/env bash
# Ingest COG files into the local STAC+TiTiler stack.
#
# Usage:
#   ./ingest.sh <collection-json> <data-dir>
#
# Prerequisites:
#   - Local stack running (see setup-local-stac skill)
#   - gdal_translate available (for COG conversion)
#   - Python 3.9+ with rasterio and requests installed

set -euo pipefail

COLLECTION_JSON="${1:?Usage: $0 <collection-json> <data-dir>}"
DATA_DIR="${2:?Usage: $0 <collection-json> <data-dir>}"

# --- Step 1: Convert non-COG TIFFs to Cloud-Optimized GeoTIFFs -----------

for f in "$DATA_DIR"/*.tif; do
  [ -f "$f" ] || continue
  if ! gdalinfo "$f" 2>/dev/null | grep -q "LAYOUT=COG"; then
    echo "Converting $(basename "$f") to COG..."
    gdal_translate -of COG "$f" "${f%.tif}_cog.tif"
    mv "${f%.tif}_cog.tif" "$f"
  fi
done

# --- Step 2: Copy data into the infra data directory ---------------------

echo "Copying data files to infra/data/..."
cp "$DATA_DIR"/*.tif infra/data/

# --- Step 3: Run the Python ingestion script -----------------------------

echo "Running ingestion..."
python infra/scripts/ingest.py "$COLLECTION_JSON" infra/data/

echo "Done. Verify with: curl -s http://localhost:8081/collections | python -m json.tool"
