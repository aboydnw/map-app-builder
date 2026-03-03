# Skill: Ingest STAC Data

## When to use
When you have COG (Cloud-Optimized GeoTIFF) files and want to register them as STAC items in the local STAC+TiTiler stack so they can be visualized in a map app.

## Prerequisites
- Local stack running (see `setup-local-stac` skill)
- Python 3.9+
- `pip install rasterio requests`

## Steps

### 1. Place COG files in the data directory

Copy your `.tif` files into `infra/data/`:

```bash
cp my-raster.tif infra/data/
```

If your files are not Cloud-Optimized GeoTIFFs, convert them first:

```bash
gdal_translate -of COG input.tif infra/data/output.tif
```

### 2. Create a collection definition

Copy and edit the sample collection:

```bash
cp infra/scripts/sample-collection.json infra/scripts/my-collection.json
```

Edit `my-collection.json` to set the `id`, `title`, `description`, and `extent` fields. The `id` is used as the collection identifier in the STAC API.

Example:
```json
{
  "id": "air-quality",
  "type": "Collection",
  "title": "Air Quality Data",
  "description": "NO2 concentration measurements",
  "license": "proprietary",
  "extent": {
    "spatial": { "bbox": [[-125, 24, -66, 50]] },
    "temporal": { "interval": [["2024-01-01T00:00:00Z", null]] }
  },
  "links": []
}
```

### 3. Run the ingestion script

```bash
python infra/scripts/ingest.py infra/scripts/my-collection.json infra/data/
```

The script will:
- Create the STAC collection (or skip if it already exists)
- Read each `.tif` file's bounds using rasterio
- Create a STAC item for each file with the correct bbox, geometry, and asset href
- Asset hrefs use the Docker-internal fileserver URL so TiTiler can fetch them

### 4. Verify ingestion

```bash
# List collections
curl -s http://localhost:8081/collections | python -m json.tool

# List items in a collection
curl -s http://localhost:8081/collections/my-collection/items | python -m json.tool
```

### 5. Use in a map app

With your app configured to use `VITE_STAC_API_URL=http://localhost:8081` and `VITE_TITILER_URL=http://localhost:8000`, the ingested data is available through the standard `useSTAC` and `useTitiler` hooks.

## Configuration

The ingestion script reads these environment variables:

| Variable | Default | Purpose |
|----------|---------|---------|
| `STAC_API_URL` | `http://localhost:8081` | STAC API endpoint |
| `FILESERVER_INTERNAL_URL` | `http://fileserver:80` | Docker-internal fileserver URL for asset hrefs |

## Tips

- Each `.tif` file becomes one STAC item with `id` set to the filename (without extension)
- To re-ingest after adding files, run the script again — existing items are skipped
- To fully reset: `docker compose -f infra/docker-compose.yml down -v` and restart

## Reference files
- `infra/scripts/ingest.py` — the ingestion script
- `infra/scripts/sample-collection.json` — template collection
- `src/utils/stac-helpers.ts` — `STACItem` interface that matches the ingested items
