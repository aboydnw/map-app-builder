#!/usr/bin/env bash
# local-setup.sh — Clone eoAPI repo, start Docker Compose stack, and verify services.
# Default ports: STAC 8081, Raster 8082, Vector 8083 (confirm with `docker compose ps`).

set -euo pipefail

git clone https://github.com/developmentseed/eoAPI
cd eoAPI

docker compose up -d

echo "Waiting for services to start..."
sleep 10
docker compose ps

echo ""
echo "=== Verifying services ==="

echo -n "STAC API (8081): "
curl -sf http://localhost:8081 | python -m json.tool > /dev/null && echo "OK" || echo "FAILED"

echo -n "Raster tiler (8082): "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8082/docs)
[ "$STATUS" = "200" ] && echo "OK" || echo "FAILED (HTTP $STATUS)"

echo -n "Vector tiler (8083): "
curl -sf http://localhost:8083/collections | python -m json.tool > /dev/null && echo "OK" || echo "FAILED"

echo ""
echo "Configure your map app with:"
echo "  VITE_TITILER_URL=http://localhost:8082"
echo "  VITE_STAC_API_URL=http://localhost:8081"
echo ""
echo "To stop:  docker compose down"
echo "To reset: docker compose down -v"
