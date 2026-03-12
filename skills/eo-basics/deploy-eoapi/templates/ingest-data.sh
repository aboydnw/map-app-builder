#!/usr/bin/env bash
# ingest-data.sh — Load STAC collections and items into eoAPI via pypgstac and the Transaction API.
# Update DSN credentials and port from eoAPI's docker-compose.yml database service.

set -euo pipefail

DSN="postgresql://user:pass@localhost:5439/postgis"

# --- pypgstac (direct database ingestion, recommended) ---

pip install pypgstac[psycopg]

# Load a collection
pypgstac load collections my-collection.json --dsn "$DSN"

# Load items (ndjson format — one JSON object per line)
pypgstac load items my-items.ndjson --dsn "$DSN"

# --- Transaction API (alternative, if enabled) ---
# Check GET http://localhost:8081/conformance for "transaction" support.

# curl -X POST http://localhost:8081/collections \
#   -H "Content-Type: application/json" \
#   -d @my-collection.json

# --- Register a mosaic search (titiler-pgstac) ---
# Check http://localhost:8082/docs for the actual mosaic API paths.

# curl -X POST http://localhost:8082/searches/register \
#   -H "Content-Type: application/json" \
#   -d '{
#     "collections": ["my-collection"],
#     "datetime": "2024-01-01T00:00:00Z/2024-12-31T00:00:00Z",
#     "bbox": [-125, 24, -66, 50]
#   }'
#
# Response includes an `id`. Use it in the tile URL:
#   http://localhost:8082/searches/{id}/tiles/{z}/{x}/{y}
