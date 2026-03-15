import geopandas as gpd
import pytest
from shapely.geometry import Point, Polygon

from src.models import FormatPair
from src.services.pipeline import _detect_use_pmtiles, _extract_feature_stats, _extract_zoom_range_raster, get_credits


def test_get_credits_raster():
    credits = get_credits(FormatPair.GEOTIFF_TO_COG)
    names = [c["tool"] for c in credits]
    assert "rio-cogeo" in names
    assert "TiTiler" in names
    assert "MapLibre" in names


def test_get_credits_vector():
    credits = get_credits(FormatPair.SHAPEFILE_TO_GEOPARQUET)
    names = [c["tool"] for c in credits]
    assert "GeoPandas" in names
    assert "tipg" in names
    assert "MapLibre" in names


def test_get_credits_netcdf():
    credits = get_credits(FormatPair.NETCDF_TO_COG)
    names = [c["tool"] for c in credits]
    assert "xarray" in names
    assert "rio-cogeo" in names


def test_get_credits_vector_pmtiles():
    credits = get_credits(FormatPair.GEOJSON_TO_GEOPARQUET, use_pmtiles=True)
    names = [c["tool"] for c in credits]
    assert "GeoPandas" in names
    assert "tippecanoe" in names
    assert "PMTiles" in names
    assert "MapLibre" in names
    assert "tipg" not in names


def test_get_credits_vector_tipg_unchanged():
    credits = get_credits(FormatPair.GEOJSON_TO_GEOPARQUET, use_pmtiles=False)
    names = [c["tool"] for c in credits]
    assert "tipg" in names
    assert "tippecanoe" not in names


@pytest.fixture
def polygon_parquet(tmp_path):
    gdf = gpd.GeoDataFrame(
        {"name": ["a"]},
        geometry=[Polygon([(0, 0), (1, 0), (1, 1), (0, 1)])],
        crs="EPSG:4326",
    )
    path = str(tmp_path / "polygons.parquet")
    gdf.to_parquet(path)
    return path


@pytest.fixture
def point_parquet(tmp_path):
    gdf = gpd.GeoDataFrame(
        {"name": ["a"]},
        geometry=[Point(0, 0)],
        crs="EPSG:4326",
    )
    path = str(tmp_path / "points.parquet")
    gdf.to_parquet(path)
    return path


@pytest.fixture
def mixed_parquet(tmp_path):
    gdf = gpd.GeoDataFrame(
        {"name": ["a", "b"]},
        geometry=[Point(0, 0), Polygon([(0, 0), (1, 0), (1, 1), (0, 1)])],
        crs="EPSG:4326",
    )
    path = str(tmp_path / "mixed.parquet")
    gdf.to_parquet(path)
    return path


def test_extract_feature_stats_single_type(polygon_parquet):
    count, types = _extract_feature_stats(polygon_parquet)
    assert count == 1
    assert types == ["Polygon"]


def test_extract_feature_stats_mixed_types(mixed_parquet):
    count, types = _extract_feature_stats(mixed_parquet)
    assert count == 2
    # Point appears once, Polygon appears once — order is by frequency (ties go either way)
    assert set(types) == {"Point", "Polygon"}


def test_extract_feature_stats_empty(tmp_path):
    import geopandas as gpd
    gdf = gpd.GeoDataFrame({"name": []}, geometry=gpd.GeoSeries([], dtype="geometry"), crs="EPSG:4326")
    path = str(tmp_path / "empty.parquet")
    gdf.to_parquet(path)
    count, types = _extract_feature_stats(path)
    assert count == 0
    assert types == []


def test_extract_zoom_range_raster(tmp_path):
    import numpy as np
    import rasterio
    from rasterio.transform import from_bounds

    transform = from_bounds(0, 0, 1, 1, 256, 256)
    path = str(tmp_path / "test.tif")
    with rasterio.open(
        path, "w", driver="GTiff",
        height=256, width=256, count=1,
        dtype=np.uint8, crs="EPSG:4326",
        transform=transform,
    ) as dst:
        dst.write(np.zeros((1, 256, 256), dtype=np.uint8))

    min_zoom, max_zoom = _extract_zoom_range_raster(path)
    assert 0 <= min_zoom <= max_zoom <= 20


def test_detect_use_pmtiles_polygon(polygon_parquet):
    assert _detect_use_pmtiles(polygon_parquet) is True


def test_detect_use_pmtiles_point(point_parquet):
    assert _detect_use_pmtiles(point_parquet) is False


def test_detect_use_pmtiles_mixed(mixed_parquet):
    assert _detect_use_pmtiles(mixed_parquet) is True
