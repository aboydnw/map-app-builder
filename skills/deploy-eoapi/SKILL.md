# Skill: Deploy eoAPI

## When to use
When you need a production-grade geospatial API stack — STAC catalog, raster tile server, and vector tile server — either locally or in the cloud. Choose this over `setup-local-stac` when:
- You need STAC-aware mosaic rendering (render multiple items as a single layer via STAC search)
- You're deploying to cloud infrastructure (AWS CDK or Kubernetes Helm)
- You need the vector tile service (tipg / OGC API Features)
- You want a maintained, opinionated reference deployment from Development Seed

## How eoAPI differs from `setup-local-stac`

| | `setup-local-stac` | `deploy-eoapi` |
|-|--------------------|--------------------|
| Raster tiler | plain TiTiler | titiler-pgstac (STAC-aware mosaics) |
| STAC API | stac-fastapi-pgstac | stac-fastapi-pgstac |
| Vector tiles | none | tipg (OGC API Features) |
| File server | nginx (built-in) | none (external hosting required) |
| Auth | none | pluggable (OIDC hooks) |
| Cloud deployment | local only | CDK, Helm charts available |

## Prerequisites
- Docker and Docker Compose
- COG files hosted at accessible URLs (S3, GCS, HTTPS — eoAPI has no built-in file server)

## Part 1: Local deployment

### 1. Clone eoAPI

```bash
git clone https://github.com/developmentseed/eoAPI
cd eoAPI
```

### 2. Start the stack

```bash
docker compose up -d
```

Wait for all services to be healthy:
```bash
docker compose ps
```

### 3. Verify services

> **Check ports:** The port numbers below are defaults from eoAPI's `docker-compose.yml` as of early 2025. Run `docker compose ps` to confirm the actual port mappings — they may differ in newer versions.

| Service | Default URL | Purpose |
|---------|-------------|---------|
| STAC API | http://localhost:8081 | STAC catalog (stac-fastapi-pgstac) |
| Raster | http://localhost:8082 | Raster tile server (titiler-pgstac) |
| Vector | http://localhost:8083 | Vector tile server (tipg) |

```bash
# STAC API landing page
curl -s http://localhost:8081 | python -m json.tool

# Raster tiler docs
curl -s -o /dev/null -w "%{http_code}" http://localhost:8082/docs

# Vector tiler collections
curl -s http://localhost:8083/collections | python -m json.tool
```

### 4. Ingest STAC data

eoAPI's recommended ingestion method is **pypgstac**, which writes directly to the pgSTAC database:

```bash
pip install pypgstac[psycopg]

# Load a collection
pypgstac load collections my-collection.json --dsn postgresql://user:pass@localhost:5439/postgis

# Load items (ndjson format — one JSON object per line)
pypgstac load items my-items.ndjson --dsn postgresql://user:pass@localhost:5439/postgis
```

> **Check the DSN:** The database credentials and port are defined in eoAPI's `docker-compose.yml`. Inspect the `database` service to find the correct values.

Alternatively, if the STAC API has the Transaction extension enabled (check `GET /conformance` for `transaction`), you can POST directly:

```bash
curl -X POST http://localhost:8081/collections \
  -H "Content-Type: application/json" \
  -d @my-collection.json
```

> **Note:** The `ingest-stac-data` skill's Python script is designed for the `setup-local-stac` stack (it generates asset hrefs using `http://fileserver:80/...`). It is **not** directly compatible with eoAPI, which has no built-in file server. You'll need to ensure asset hrefs in your STAC items point to URLs accessible to the eoAPI containers (S3, HTTPS, or a separate file server you run yourself).

### 5. Serving local COG files to eoAPI

eoAPI has no built-in file server. If your COGs are local files (not on S3/HTTPS), you need to serve them separately:

```bash
# Start a simple file server in a separate terminal
cd /path/to/your/cogs
python -m http.server 8080
```

Then use `http://host.docker.internal:8080/file.tif` as the asset href in your STAC items.

> **Linux users:** `host.docker.internal` does not resolve by default on Linux. Add this to the eoAPI `docker-compose.yml` services that need it (raster, stac):
> ```yaml
> extra_hosts:
>   - "host.docker.internal:host-gateway"
> ```
> Or use the Docker bridge IP directly (usually `172.17.0.1`).

### 6. Configure your map app

```env
VITE_TITILER_URL=http://localhost:8082
VITE_STAC_API_URL=http://localhost:8081
```

## Part 2: Mosaic rendering (key eoAPI feature)

`titiler-pgstac` supports rendering a STAC search result as a single mosaic — all matching items composited into one tile layer. This is different from plain TiTiler, which visualizes a single COG URL at a time.

> **Verify endpoints:** The mosaic API paths below are based on titiler-pgstac conventions but may vary across versions. Check `http://localhost:8082/docs` for the actual OpenAPI spec.

Register a mosaic search:
```bash
curl -X POST http://localhost:8082/searches/register \
  -H "Content-Type: application/json" \
  -d '{
    "collections": ["my-collection"],
    "datetime": "2024-01-01T00:00:00Z/2024-12-31T00:00:00Z",
    "bbox": [-125, 24, -66, 50]
  }'
```

The response includes an `id` field. Use it in the tile URL:
```
http://localhost:8082/searches/{id}/tiles/{z}/{x}/{y}
```

## Part 3: Cloud deployment

### AWS (CDK)

Requires: AWS CLI configured with credentials, Node.js, CDK bootstrapped in your target account/region.

```bash
git clone https://github.com/developmentseed/eoapi-cdk
cd eoapi-cdk
npm install

# Bootstrap CDK (once per account/region)
npx cdk bootstrap aws://ACCOUNT_ID/REGION

# Deploy — review the stack config in the repo before running
npx cdk deploy
```

Deploys to Lambda + RDS Aurora Serverless + CloudFront. See [eoapi-cdk docs](https://github.com/developmentseed/eoapi-cdk) for configuration options, custom domains, and IAM setup.

### Kubernetes (Helm)

```bash
git clone https://github.com/developmentseed/eoapi-k8s
cd eoapi-k8s
helm install eoapi ./helm/eoapi -f values.yaml
```

See [eoapi-k8s docs](https://github.com/developmentseed/eoapi-k8s) for values configuration.

## Stop the local stack

```bash
docker compose down

# Full reset including database
docker compose down -v
```

## See also
- `setup-local-stac` — simpler local-only stack with built-in file server (easier for getting started)
- `add-stac-layer` — visualize STAC data in a map app
- `add-cog-layer` — visualize individual COG URLs

## Reference
- [eoAPI GitHub](https://github.com/developmentseed/eoAPI)
- [titiler-pgstac docs](https://developmentseed.org/titiler-pgstac/)
- [eoapi-cdk](https://github.com/developmentseed/eoapi-cdk)
- [eoapi-k8s](https://github.com/developmentseed/eoapi-k8s)
