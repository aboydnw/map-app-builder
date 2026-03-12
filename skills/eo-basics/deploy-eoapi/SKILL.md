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

## Template files

| File | Purpose |
|------|---------|
| [`templates/local-setup.sh`](templates/local-setup.sh) | Clone eoAPI, start Docker Compose stack, verify services |
| [`templates/ingest-data.sh`](templates/ingest-data.sh) | pypgstac load, Transaction API POST, mosaic registration |
| [`templates/docker-extra-hosts.yml`](templates/docker-extra-hosts.yml) | Docker Compose `extra_hosts` snippet for Linux (host.docker.internal) |
| [`templates/cloud-deploy.sh`](templates/cloud-deploy.sh) | AWS CDK and Kubernetes Helm deployment commands |

## Prerequisites
- Docker and Docker Compose
- COG files hosted at accessible URLs (S3, GCS, HTTPS — eoAPI has no built-in file server)

## Part 1: Local deployment

Use `templates/local-setup.sh` to clone the eoAPI repo, start the stack, and verify all three services.

> **Check ports:** The port numbers in the template are defaults from eoAPI's `docker-compose.yml` as of early 2025. Run `docker compose ps` to confirm the actual port mappings — they may differ in newer versions.

| Service | Default URL | Purpose |
|---------|-------------|---------|
| STAC API | http://localhost:8081 | STAC catalog (stac-fastapi-pgstac) |
| Raster | http://localhost:8082 | Raster tile server (titiler-pgstac) |
| Vector | http://localhost:8083 | Vector tile server (tipg) |

### Ingest STAC data

Use `templates/ingest-data.sh` for pypgstac ingestion (recommended) or the Transaction API alternative.

> **Check the DSN:** The database credentials and port are defined in eoAPI's `docker-compose.yml`. Inspect the `database` service to find the correct values.

> **Note:** The `ingest-stac-data` skill's Python script is designed for the `setup-local-stac` stack (it generates asset hrefs using `http://fileserver:80/...`). It is **not** directly compatible with eoAPI, which has no built-in file server. You'll need to ensure asset hrefs in your STAC items point to URLs accessible to the eoAPI containers (S3, HTTPS, or a separate file server you run yourself).

### Serving local COG files to eoAPI

eoAPI has no built-in file server. If your COGs are local files (not on S3/HTTPS), serve them separately:

```bash
cd /path/to/your/cogs
python -m http.server 8080
```

Then use `http://host.docker.internal:8080/file.tif` as the asset href in your STAC items.

> **Linux users:** `host.docker.internal` does not resolve by default on Linux. Merge `templates/docker-extra-hosts.yml` into the eoAPI `docker-compose.yml` services that need it (raster, stac). Or use the Docker bridge IP directly (usually `172.17.0.1`).

### Configure your map app

```env
VITE_TITILER_URL=http://localhost:8082
VITE_STAC_API_URL=http://localhost:8081
```

## Part 2: Mosaic rendering (key eoAPI feature)

`titiler-pgstac` supports rendering a STAC search result as a single mosaic — all matching items composited into one tile layer. This is different from plain TiTiler, which visualizes a single COG URL at a time.

> **Verify endpoints:** The mosaic API paths are based on titiler-pgstac conventions but may vary across versions. Check `http://localhost:8082/docs` for the actual OpenAPI spec.

The mosaic registration and tile URL commands are included in `templates/ingest-data.sh`.

## Part 3: Cloud deployment

Use `templates/cloud-deploy.sh` for AWS CDK or Kubernetes Helm deployment.

- **AWS CDK** deploys to Lambda + RDS Aurora Serverless + CloudFront. See [eoapi-cdk docs](https://github.com/developmentseed/eoapi-cdk) for configuration options, custom domains, and IAM setup.
- **Kubernetes Helm** — see [eoapi-k8s docs](https://github.com/developmentseed/eoapi-k8s) for values configuration.

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
