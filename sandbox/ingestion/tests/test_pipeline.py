from src.models import FormatPair
from src.services.pipeline import get_credits


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
