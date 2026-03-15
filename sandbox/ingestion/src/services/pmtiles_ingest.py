"""Convert GeoParquet to PMTiles and ingest to MinIO for vector tile serving."""

import os
import subprocess
import tempfile

import geopandas as gpd

from src.services.storage import StorageService


def get_pmtiles_tile_url(dataset_id: str) -> str:
    """Return the frontend-relative tile URL for a PMTiles dataset."""
    return f"/pmtiles/datasets/{dataset_id}/converted/data.pmtiles"


def ingest_pmtiles(
    dataset_id: str,
    parquet_path: str,
    _storage: StorageService | None = None,
) -> str:
    """Convert GeoParquet to PMTiles and upload to MinIO. Returns tile URL.

    Runs tippecanoe as a subprocess. tippecanoe generates zoom-appropriate
    tiles at each zoom level — no features are dropped and no simplification
    is applied to the stored data.

    This is a sync function — call via asyncio.to_thread() from async code.
    """
    storage = _storage or StorageService()

    gdf = gpd.read_parquet(parquet_path)
    gdf.columns = [c.lower() for c in gdf.columns]

    if len(gdf) == 0:
        raise ValueError(f"Dataset {dataset_id} has no features — cannot generate PMTiles")

    with tempfile.TemporaryDirectory() as tmpdir:
        geojson_path = os.path.join(tmpdir, "data.geojson")
        pmtiles_path = os.path.join(tmpdir, "data.pmtiles")

        gdf.to_file(geojson_path, driver="GeoJSON")

        result = subprocess.run(
            [
                "tippecanoe",
                f"--output={pmtiles_path}",
                "--no-feature-limit",
                "--no-tile-size-limit",
                "--force",
                "--maximum-zoom=g",
                "--layer=default",
                geojson_path,
            ],
            capture_output=True,
            text=True,
        )
        if result.returncode != 0:
            raise RuntimeError(f"tippecanoe failed:\n{result.stderr}")

        storage.upload_pmtiles(pmtiles_path, dataset_id)

    return get_pmtiles_tile_url(dataset_id)
