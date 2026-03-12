# Skill: Ingest STAC Data

## When to use
When you have COG (Cloud-Optimized GeoTIFF) files and want to register them as STAC items in the local STAC+TiTiler stack so they can be visualized in a map app.

## Prerequisites
- Local stack running (see `setup-local-stac` skill)
- Python 3.9+
- `pip install rasterio requests`

## Template files

| File | Purpose |
|------|---------|
| [`templates/sample-collection.json`](templates/sample-collection.json) | Sample STAC collection definition — copy and edit for your dataset |
| [`templates/ingest.sh`](templates/ingest.sh) | COG conversion, file copy, and ingestion commands |
| [`templates/verify-ingestion.sh`](templates/verify-ingestion.sh) | Verify ingested collections and items via curl |

## Steps

### 1. Place COG files in the data directory

Copy your `.tif` files into `infra/data/`. If your files are not Cloud-Optimized GeoTIFFs, the ingestion script (see `templates/ingest.sh`) will convert them with `gdal_translate`.

### 2. Create a collection definition

Copy and edit the sample collection template at `templates/sample-collection.json`. Set the `id`, `title`, `description`, and `extent` fields. The `id` is used as the collection identifier in the STAC API.

### 3. Run the ingestion script

Use `templates/ingest.sh` as a reference or run it directly:

```bash
./templates/ingest.sh infra/scripts/my-collection.json infra/data/
```

The underlying Python script (`infra/scripts/ingest.py`) will:
- Create the STAC collection (or skip if it already exists)
- Read each `.tif` file's bounds using rasterio
- Create a STAC item for each file with the correct bbox, geometry, and asset href
- Asset hrefs use the Docker-internal fileserver URL so TiTiler can fetch them

### 4. Verify ingestion

Use `templates/verify-ingestion.sh` to confirm data was loaded:

```bash
./templates/verify-ingestion.sh              # list all collections
./templates/verify-ingestion.sh my-collection # list items in a collection
```

### 5. Use in a map app

With your app configured to use `VITE_STAC_API_URL=http://localhost:8081` and `VITE_TITILER_URL=http://localhost:8000`, the ingested data is available through the standard `useSTAC` and `useTitiler` hooks.

## Configuration

The ingestion script reads these environment variables:

| Variable | Default | Purpose |
|----------|---------|---------|
| `STAC_API_URL` | `http://localhost:8081` | STAC API endpoint |
| `FILESERVER_INTERNAL_URL` | `http://fileserver:80` | Docker-internal fileserver URL for asset hrefs |

## Common mistakes

- Each `.tif` file becomes one STAC item with `id` set to the filename (without extension)
- To re-ingest after adding files, run the script again — existing items are skipped
- To fully reset: `docker compose -f infra/docker-compose.yml down -v` and restart

## Reference files
- `infra/scripts/ingest.py` — the ingestion script
- `infra/scripts/sample-collection.json` — template collection
- `src/utils/stac-helpers.ts` — `STACItem` interface that matches the ingested items
