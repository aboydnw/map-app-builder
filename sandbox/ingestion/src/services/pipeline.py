"""Pipeline orchestrator: detect -> convert -> validate -> store -> ingest.

Conversion and validation are CPU/IO-bound sync operations. They run in a
thread via asyncio.to_thread() to avoid blocking the event loop (which would
freeze SSE streams and health checks during processing).
"""

import asyncio
import os
import tempfile

from src.config import get_settings
from src.models import Dataset, Job, JobStatus, FormatPair, DatasetType, ValidationCheck
from src.services.detector import detect_format, validate_magic_bytes
from src.services.storage import StorageService
from src.services import stac_ingest, vector_ingest


def get_credits(format_pair: FormatPair) -> list[dict]:
    """Return the credits list for a given conversion path."""
    credits = []

    if format_pair == FormatPair.GEOTIFF_TO_COG:
        credits.append({"tool": "rio-cogeo", "url": "https://github.com/cogeotiff/rio-cogeo", "role": "Converted by"})
    elif format_pair == FormatPair.NETCDF_TO_COG:
        credits.append({"tool": "xarray", "url": "https://xarray.dev", "role": "Read by"})
        credits.append({"tool": "rio-cogeo", "url": "https://github.com/cogeotiff/rio-cogeo", "role": "Converted by"})
    elif format_pair in (FormatPair.SHAPEFILE_TO_GEOPARQUET, FormatPair.GEOJSON_TO_GEOPARQUET):
        credits.append({"tool": "GeoPandas", "url": "https://geopandas.org", "role": "Converted by"})

    if format_pair.dataset_type == DatasetType.RASTER:
        credits.append({"tool": "TiTiler", "url": "https://developmentseed.org/titiler", "role": "Tiles served by"})
        credits.append({"tool": "pgSTAC", "url": "https://github.com/stac-utils/pgstac", "role": "Cataloged by"})
    else:
        credits.append({"tool": "tipg", "url": "https://github.com/developmentseed/tipg", "role": "Tiles served by"})

    credits.append({"tool": "MapLibre", "url": "https://maplibre.org", "role": "Map rendered by"})
    return credits


def _extract_bounds(output_path: str, dataset_type: DatasetType) -> list[float]:
    """Extract [west, south, east, north] bounds in EPSG:4326."""
    if dataset_type == DatasetType.RASTER:
        import rasterio
        from rasterio.warp import transform_bounds
        with rasterio.open(output_path) as src:
            if src.crs and str(src.crs) != "EPSG:4326":
                return list(transform_bounds(src.crs, "EPSG:4326", *src.bounds))
            b = src.bounds
            return [b.left, b.bottom, b.right, b.top]
    else:
        import geopandas as gpd
        gdf = gpd.read_parquet(output_path)
        b = gdf.total_bounds  # [minx, miny, maxx, maxy]
        return [float(b[0]), float(b[1]), float(b[2]), float(b[3])]


async def run_pipeline(job: Job, input_path: str, datasets_store: dict) -> None:
    """Execute the full conversion pipeline. Updates job status in-place.

    This function is called from a BackgroundTask. It catches all exceptions
    and sets job.status = FAILED with an error message rather than crashing.
    """
    settings = get_settings()
    storage = StorageService()

    try:
        # Stage 1: Scan
        job.status = JobStatus.SCANNING
        format_pair = detect_format(job.filename)
        job.format_pair = format_pair
        validate_magic_bytes(input_path, format_pair)

        # Upload raw file to S3
        storage.upload_raw(input_path, job.dataset_id, job.filename)

        # Stage 2: Convert
        job.status = JobStatus.CONVERTING

        if format_pair.dataset_type == DatasetType.RASTER:
            out_filename = os.path.splitext(job.filename)[0] + ".tif"
        else:
            out_filename = os.path.splitext(job.filename)[0] + ".parquet"

        with tempfile.TemporaryDirectory() as tmpdir:
            output_path = os.path.join(tmpdir, out_filename)

            await asyncio.to_thread(_import_and_convert, format_pair, input_path, output_path)

            # Stage 3: Validate
            job.status = JobStatus.VALIDATING
            check_results = await asyncio.to_thread(_import_and_validate, format_pair, input_path, output_path)
            job.validation_results = [
                ValidationCheck(name=c.name, passed=c.passed, detail=c.detail)
                for c in check_results
            ]

            failed = [c for c in check_results if not c.passed]
            if failed:
                job.status = JobStatus.FAILED
                job.error = f"{len(failed)} validation check(s) failed"
                return

            # Extract bounds for auto-zoom
            bounds = await asyncio.to_thread(_extract_bounds, output_path, format_pair.dataset_type)

            # Stage 4: Ingest
            job.status = JobStatus.INGESTING

            converted_key = storage.upload_converted(output_path, job.dataset_id, out_filename)
            s3_href = storage.get_s3_uri(converted_key)

            if format_pair.dataset_type == DatasetType.RASTER:
                tile_url = await stac_ingest.ingest_raster(
                    job.dataset_id, output_path, s3_href, job.filename,
                )
            else:
                tile_url = await asyncio.to_thread(
                    vector_ingest.ingest_vector, job.dataset_id, output_path,
                )

        # Stage 5: Ready
        job.status = JobStatus.READY

        dataset = Dataset(
            id=job.dataset_id,
            filename=job.filename,
            dataset_type=format_pair.dataset_type,
            format_pair=format_pair,
            tile_url=tile_url,
            bounds=bounds,
            stac_collection_id=f"sandbox-{job.dataset_id}" if format_pair.dataset_type == DatasetType.RASTER else None,
            pg_table=vector_ingest.build_table_name(job.dataset_id) if format_pair.dataset_type == DatasetType.VECTOR else None,
            validation_results=job.validation_results,
            credits=get_credits(format_pair),
            created_at=job.created_at,
        )
        datasets_store[job.dataset_id] = dataset

    except Exception as e:
        job.status = JobStatus.FAILED
        job.error = str(e)


def _import_and_convert(format_pair: FormatPair, input_path: str, output_path: str) -> None:
    """Import the appropriate cng-toolkit converter and run it."""
    if format_pair == FormatPair.GEOTIFF_TO_COG:
        from geotiff_to_cog import convert
    elif format_pair == FormatPair.SHAPEFILE_TO_GEOPARQUET:
        from shapefile_to_geoparquet import convert
    elif format_pair == FormatPair.GEOJSON_TO_GEOPARQUET:
        from geojson_to_geoparquet import convert
    elif format_pair == FormatPair.NETCDF_TO_COG:
        from netcdf_to_cog import convert
    else:
        raise ValueError(f"Unknown format pair: {format_pair}")

    convert(input_path, output_path, verbose=True)


def _import_and_validate(format_pair: FormatPair, input_path: str, output_path: str) -> list:
    """Import the appropriate cng-toolkit validator and run checks."""
    if format_pair == FormatPair.GEOTIFF_TO_COG:
        from geotiff_to_cog import run_checks
    elif format_pair == FormatPair.SHAPEFILE_TO_GEOPARQUET:
        from shapefile_to_geoparquet import run_checks
    elif format_pair == FormatPair.GEOJSON_TO_GEOPARQUET:
        from geojson_to_geoparquet import run_checks
    elif format_pair == FormatPair.NETCDF_TO_COG:
        from netcdf_to_cog import run_checks
    else:
        raise ValueError(f"Unknown format pair: {format_pair}")

    return run_checks(input_path, output_path)
