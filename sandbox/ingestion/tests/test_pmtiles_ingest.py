import subprocess

import geopandas as gpd
import pytest
from moto import mock_aws
import boto3
from shapely.geometry import Polygon

from src.services.pmtiles_ingest import get_pmtiles_tile_url, ingest_pmtiles
from src.services.storage import StorageService


def test_get_pmtiles_tile_url():
    url = get_pmtiles_tile_url("abc-123")
    assert url == "/pmtiles/datasets/abc-123/converted/data.pmtiles"


@pytest.fixture
def mock_storage():
    with mock_aws():
        s3 = boto3.client("s3", region_name="us-east-1")
        s3.create_bucket(Bucket="test-bucket")
        yield StorageService(s3_client=s3, bucket="test-bucket")


@pytest.fixture
def polygon_parquet(tmp_path):
    gdf = gpd.GeoDataFrame(
        {"name": ["poly_0", "poly_1"]},
        geometry=[
            Polygon([(0, 0), (1, 0), (1, 1), (0, 1)]),
            Polygon([(2, 2), (3, 2), (3, 3), (2, 3)]),
        ],
        crs="EPSG:4326",
    )
    path = str(tmp_path / "test.parquet")
    gdf.to_parquet(path)
    return path


@pytest.fixture
def empty_parquet(tmp_path):
    gdf = gpd.GeoDataFrame(
        {"name": []},
        geometry=gpd.GeoSeries([], dtype="geometry"),
        crs="EPSG:4326",
    )
    path = str(tmp_path / "empty.parquet")
    gdf.to_parquet(path)
    return path


def test_ingest_pmtiles_calls_tippecanoe_with_required_flags(
    monkeypatch, polygon_parquet, mock_storage
):
    """ingest_pmtiles runs tippecanoe with all required flags."""
    calls = []

    def fake_run(cmd, **kwargs):
        calls.append(cmd)
        output_flag = next(f for f in cmd if f.startswith("--output="))
        output_path = output_flag.split("=", 1)[1]
        with open(output_path, "wb") as f:
            f.write(b"fake pmtiles")
        return subprocess.CompletedProcess(cmd, 0, "", "")

    monkeypatch.setattr(subprocess, "run", fake_run)

    url = ingest_pmtiles("abc-123", polygon_parquet, _storage=mock_storage)

    assert len(calls) == 1
    cmd = calls[0]
    assert cmd[0] == "tippecanoe"
    assert "--no-feature-limit" in cmd
    assert "--no-tile-size-limit" in cmd
    assert "--force" in cmd
    assert "--maximum-zoom=g" in cmd
    assert "--layer=default" in cmd
    assert url == "/pmtiles/datasets/abc-123/converted/data.pmtiles"


def test_ingest_pmtiles_uploads_to_storage(
    monkeypatch, polygon_parquet, mock_storage
):
    """ingest_pmtiles uploads the generated .pmtiles file to storage."""
    def fake_run(cmd, **kwargs):
        output_flag = next(f for f in cmd if f.startswith("--output="))
        output_path = output_flag.split("=", 1)[1]
        with open(output_path, "wb") as f:
            f.write(b"fake pmtiles")
        return subprocess.CompletedProcess(cmd, 0, "", "")

    monkeypatch.setattr(subprocess, "run", fake_run)

    ingest_pmtiles("abc-123", polygon_parquet, _storage=mock_storage)

    # Verify the file was uploaded to MinIO
    obj = mock_storage.s3.get_object(
        Bucket="test-bucket",
        Key="datasets/abc-123/converted/data.pmtiles",
    )
    assert obj["Body"].read() == b"fake pmtiles"


def test_ingest_pmtiles_raises_on_tippecanoe_failure(
    monkeypatch, polygon_parquet, mock_storage
):
    """ingest_pmtiles raises RuntimeError when tippecanoe exits non-zero."""
    def fake_run(cmd, **kwargs):
        return subprocess.CompletedProcess(cmd, 1, "", "tippecanoe: fatal error")

    monkeypatch.setattr(subprocess, "run", fake_run)

    with pytest.raises(RuntimeError):
        ingest_pmtiles("abc-123", polygon_parquet, _storage=mock_storage)


def test_ingest_pmtiles_raises_on_empty_dataset(empty_parquet, mock_storage):
    """ingest_pmtiles raises ValueError when dataset has no features."""
    with pytest.raises(ValueError):
        ingest_pmtiles("abc-123", empty_parquet, _storage=mock_storage)
