#!/usr/bin/env bash
# Verify that STAC collections and items were ingested correctly.
#
# Usage:
#   ./verify-ingestion.sh [collection-id]
#
# Without arguments, lists all collections. With a collection ID,
# lists items in that collection.

set -euo pipefail

STAC_API_URL="${STAC_API_URL:-http://localhost:8081}"
COLLECTION_ID="${1:-}"

echo "STAC API: $STAC_API_URL"
echo

# List all collections
echo "=== Collections ==="
curl -sf "$STAC_API_URL/collections" | python -m json.tool
echo

# If a collection ID was provided, list its items
if [ -n "$COLLECTION_ID" ]; then
  echo "=== Items in '$COLLECTION_ID' ==="
  curl -sf "$STAC_API_URL/collections/$COLLECTION_ID/items" | python -m json.tool
fi
