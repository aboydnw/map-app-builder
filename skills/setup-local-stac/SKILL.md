# Skill: Setup Local STAC + TiTiler Stack

## When to use
When you need a fully local geospatial backend — a STAC catalog, raster tile server, and file server — for development without depending on external APIs like `openveda.cloud`.

## Prerequisites
- Docker and Docker Compose
- Ports 8000, 8080, and 8081 available

## What gets started

| Service | URL | Purpose |
|---------|-----|---------|
| `stac-api` | http://localhost:8081 | STAC API (pgSTAC-backed) |
| `titiler` | http://localhost:8000 | Raster tile server |
| `fileserver` | http://localhost:8080 | Serves COGs from `infra/data/` |
| `database` | localhost:5439 | PostgreSQL + pgSTAC (not accessed directly) |

## Steps

### 1. Start the stack

From the `map-app-builder` repo root:

```bash
docker compose -f infra/docker-compose.yml up -d
```

Wait for all services to be healthy:

```bash
docker compose -f infra/docker-compose.yml ps
```

### 2. Verify services

```bash
# STAC API — should return the landing page JSON
curl -s http://localhost:8081 | head -20

# TiTiler — should return the OpenAPI docs
curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/docs

# File server — should return nginx default or 403 (both mean it's running)
curl -s -o /dev/null -w "%{http_code}" http://localhost:8080
```

### 3. Configure your map app

In your map application's `.env` file:

```env
VITE_TITILER_URL=http://localhost:8000
VITE_STAC_API_URL=http://localhost:8081
```

### 4. Ingest data

See the `ingest-stac-data` skill for adding COG files and STAC collections to this stack.

### 5. Stop the stack

```bash
docker compose -f infra/docker-compose.yml down
```

To also remove the database volume (full reset):

```bash
docker compose -f infra/docker-compose.yml down -v
```

## How it works

- **TiTiler** fetches COGs over the Docker network from the nginx fileserver using internal URLs (`http://fileserver:80/data/file.tif`).
- **STAC items** store asset hrefs using this internal URL so TiTiler can resolve them.
- **Browser access** to raw files uses `http://localhost:8080/data/file.tif`.
- The STAC API has the Transaction extension enabled, allowing POST/PUT/DELETE of collections and items.

## See also
- `setup-map-app` — scaffold a new map application
- `add-stac-layer` — add a STAC layer to a map app
- `add-cog-layer` — add a COG layer to a map app
- `ingest-stac-data` — ingest COG files into this local stack

## Reference files
- `infra/docker-compose.yml` — Docker Compose configuration
- `infra/scripts/ingest.py` — ingestion script
- `infra/scripts/sample-collection.json` — template collection definition
