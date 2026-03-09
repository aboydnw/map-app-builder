# Data Sources Validation

Validated: 2026-03-09

---

## 1. Overture Maps -- Building Footprints

- **Status**: verified
- **URL(s)**: `https://data.source.coop/cholmes/overture/overture-buildings.pmtiles`
- **Format**: PMTiles vector (~90 GB, global coverage)
- **Key Properties**: This is a July 2023 snapshot. Properties include building footprint geometry. The file contains data from Google Open Buildings, Microsoft Building Footprints, and OpenStreetMap combined. Properties vary by source but typically include `source`, `class`/`type`, `height` where available.
- **Notes**:
  - File is large (96 GB). HTTP range requests are supported, so PMTiles protocol works correctly for streaming tiles on demand.
  - PMTiles magic bytes confirmed (`PMTiles`).
  - This is an older Overture release (Aug 2023). Newer Overture releases (2024+) have moved away from a single global PMTiles file. The S3 bucket `overturemaps-tiles-us` no longer exists. This is the best freely available pre-built PMTiles of building footprints.
  - For a smaller test dataset, `https://r2-public.protomaps.com/protomaps-sample-datasets/nz-buildings-v3.pmtiles` (New Zealand buildings) is also verified and accessible (HTTP 206).

---

## 2. Admin Boundaries

- **Status**: needs-alternative
- **URL(s)**:
  - GeoJSON (verified): `https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_110m_admin_0_countries.geojson`
  - GeoJSON alt (verified): `https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson`
- **Format**: GeoJSON (not PMTiles as originally desired)
- **Key Properties**: `admin` (country name), `adm0_a3` (ISO 3-letter code), `sovereignt`, `type`, `labelrank`, `scalerank`, `level`, `pop_est`, `gdp_md_est`, `economy`, `income_grp`, `continent`, `region_un`, `subregion`
- **Notes**:
  - No freely accessible admin boundary PMTiles file was found on source.coop or other PMTiles hosts. The `cholmes/overture` repo only has `overture-buildings.pmtiles`.
  - Natural Earth 110m GeoJSON from the CloudFront CDN (177 features) works well for country-level choropleth visualization and is lightweight enough to load directly.
  - For higher resolution, use `ne_50m_admin_0_countries.geojson` or `ne_10m_admin_0_countries.geojson` from the same GitHub repo.
  - If PMTiles is required, the app could convert Natural Earth shapefiles to PMTiles at build time using `tippecanoe`, or use the Overture buildings PMTiles (which contains building data, not boundaries).

---

## 3. Sea Surface Temperature (SST)

- **Status**: verified
- **URL(s)**:
  - STAC collection: `https://planetarycomputer.microsoft.com/api/stac/v1/collections/noaa-cdr-sea-surface-temperature-optimum-interpolation`
  - STAC search: `https://planetarycomputer.microsoft.com/api/stac/v1/search` (POST with `collections: ["noaa-cdr-sea-surface-temperature-optimum-interpolation"]`)
  - Tile server: `https://planetarycomputer.microsoft.com/api/data/v1/item/tiles/WebMercatorQuad/{z}/{x}/{y}@1x?collection=noaa-cdr-sea-surface-temperature-optimum-interpolation&item={ITEM_ID}&assets=sst&colormap_name=coolwarm&rescale=-2,35`
  - Tilejson: `https://planetarycomputer.microsoft.com/api/data/v1/item/tilejson.json?collection=noaa-cdr-sea-surface-temperature-optimum-interpolation&item={ITEM_ID}&assets=sst&colormap_name=coolwarm&rescale=-2,35`
- **Format**: COG (Cloud Optimized GeoTIFF) via Planetary Computer tile server
- **Key Properties**:
  - Asset `sst`: sea surface temperature (Celsius, int16 with scale 0.01, nodata -999)
  - Asset `anom`: SST anomaly
  - Asset `ice`: sea ice concentration
  - Asset `err`: estimated error
  - Daily data from 1981-09-01 to present (latest item verified: 2024-06-19)
  - 0.25-degree global grid
- **Notes**:
  - Raw COG files on Azure Blob Storage (`noaacdr.blob.core.windows.net`) require SAS token signing via `https://planetarycomputer.microsoft.com/api/sas/v1/token/noaa-cdr-sea-surface-temperature-optimum-interpolation`. Token endpoint is verified working.
  - Planetary Computer tile server renders tiles without needing SAS tokens in the client -- tilejson endpoint is verified working and returns valid tile URLs.
  - OpenVEDA has `sst-cyclone-beryl` but it covers only June-July 2024 (Cyclone Beryl event), too narrow for a general SST viewer.

---

## 4. NASA FIRMS -- Active Fires

- **Status**: verified (CSV, not GeoJSON)
- **URL(s)**:
  - VIIRS 24h global CSV (no API key): `https://firms.modaps.eosdis.nasa.gov/data/active_fire/suomi-npp-viirs-c2/csv/SUOMI_VIIRS_C2_Global_24h.csv`
  - MODIS 24h global CSV (no API key): `https://firms.modaps.eosdis.nasa.gov/data/active_fire/modis-c6.1/csv/MODIS_C6_1_Global_24h.csv`
  - Shapefiles (no API key): `https://firms.modaps.eosdis.nasa.gov/data/active_fire/suomi-npp-viirs-c2/shapes/zips/SUOMI_VIIRS_C2_Global_24h.zip`
- **Format**: CSV with lat/lon columns (must be converted to GeoJSON client-side)
- **Key Properties**: `latitude`, `longitude`, `bright_ti4` (brightness temp K), `scan`, `track`, `acq_date`, `acq_time`, `satellite`, `confidence` (low/nominal/high), `frp` (fire radiative power MW), `daynight` (D/N), `bright_ti5`
- **Notes**:
  - The FIRMS REST API (`/api/area/`, `/api/country/`) requires a `MAP_KEY` (free registration at https://firms.modaps.eosdis.nasa.gov/api/area/).
  - The direct file download endpoints above do NOT require an API key and are updated every ~3 hours.
  - CSV must be parsed client-side and converted to GeoJSON for deck.gl. This is straightforward -- each row becomes a Point feature.
  - For an alternative that provides native GeoJSON without conversion, consider USGS Earthquakes (see below).

### Alternative: USGS Earthquakes (GeoJSON, no API key)

- **Status**: verified
- **URL(s)**: `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson`
- **Format**: GeoJSON FeatureCollection (Point geometry)
- **Key Properties**: `mag` (magnitude), `place` (description), `time` (unix ms), `type` (earthquake/quarry blast), `felt`, `sig` (significance), `alert`, `tsunami`, `magType`, `title`
- **Notes**: Native GeoJSON, no API key, updated every 5 minutes, ~250 features/day globally. Available in multiple time ranges: `all_hour`, `all_day`, `all_week`, `all_month`. Also filtered versions: `significant_*`, `4.5_*`, `2.5_*`, `1.0_*`.

---

## 5. OpenAQ -- Air Quality Stations

- **Status**: needs-alternative
- **URL(s)**: `https://api.openaq.org/v3/locations?limit=100&order_by=lastUpdated&sort_order=desc`
- **Format**: JSON API
- **Key Properties**: Would include `coordinates.latitude`, `coordinates.longitude`, `parameters[].parameter` (pm25, pm10, o3, no2, etc.)
- **Notes**:
  - OpenAQ v2 API is **retired** (returns "Gone" message).
  - OpenAQ v3 API **requires an API key** (`X-API-Key` header). Returns 401 without one.
  - API keys are free but require registration at https://explore.openaq.org.
  - If an API key is acceptable, v3 works. Otherwise, use the USGS Earthquake feed or FIRMS fire data for the point-data demo app.

### Alternative: OpenWeatherMap / Other

If a key-free air quality source is needed, consider embedding a static GeoJSON snapshot of OpenAQ data, or using the USGS Earthquake feed as the point-data demonstration.

---

## 6. Global Forest Watch -- Tree Cover Loss

- **Status**: needs-alternative
- **URL(s)**: None found as PMTiles
- **Format**: N/A
- **Key Properties**: N/A
- **Notes**:
  - No GFW raster PMTiles files were found on source.coop or other public hosts.
  - GFW data is typically served through their own tile server or as large GeoTIFFs on AWS (s3://gfw2-data/).

### Alternative: Esri 10m Land Use Land Cover (Planetary Computer)

- **Status**: verified
- **URL(s)**:
  - STAC collection: `https://planetarycomputer.microsoft.com/api/stac/v1/collections/io-lulc-annual-v02`
  - Tile server pattern same as ESA WorldCover (see below)
- **Format**: COG via Planetary Computer tile server
- **Key Properties**: 9-class land use/land cover including tree cover, at 10m resolution, annual from 2017-2024
- **Notes**: Could show land cover change over time. Classes include trees, crops, built area, water, etc. Good for demonstrating raster PMTiles or COG layer capabilities.

### Alternative: ALOS Forest/Non-Forest Mosaic (Planetary Computer)

- **Status**: verified (collection exists)
- **URL(s)**: `https://planetarycomputer.microsoft.com/api/stac/v1/collections/alos-fnf-mosaic`
- **Format**: COG
- **Notes**: Annual forest/non-forest classification from JAXA ALOS PALSAR. Binary classification.

---

## 7. ESA WorldCover

- **Status**: verified
- **URL(s)**:
  - STAC collection: `https://planetarycomputer.microsoft.com/api/stac/v1/collections/esa-worldcover`
  - STAC search: POST to `https://planetarycomputer.microsoft.com/api/stac/v1/search` with `collections: ["esa-worldcover"]` and `query: {"esa_worldcover:product_version": {"eq": "1.0.0"}}` for 2020 or `"2.0.0"` for 2021
  - Tile server: `https://planetarycomputer.microsoft.com/api/data/v1/item/tiles/WebMercatorQuad/{z}/{x}/{y}@1x?collection=esa-worldcover&item={ITEM_ID}&assets=map&colormap_name=esa-worldcover&format=png`
  - Tilejson: `https://planetarycomputer.microsoft.com/api/data/v1/item/tilejson.json?collection=esa-worldcover&item={ITEM_ID}&assets=map&colormap_name=esa-worldcover&format=png`
- **Format**: COG (Cloud Optimized GeoTIFF) at 10m resolution, served via Planetary Computer tile server
- **Key Properties**:
  - Product versions: `1.0.0` (2020) and `2.0.0` (2021) -- both confirmed via STAC search
  - Asset `map`: land cover classification
  - Asset `input_quality`: quality layer
  - Based on Sentinel-1 and Sentinel-2
  - Individual tiles cover 3x3 degree areas (e.g., item `ESA_WorldCover_10m_2021_v200_N54W012`)
  - Built-in colormap `esa-worldcover` available on the tile server
- **Notes**:
  - SAS token signing is available at `https://planetarycomputer.microsoft.com/api/sas/v1/token/esa-worldcover` (verified working).
  - For the swipe comparison, query two items at the same location with different product versions (1.0.0 for 2020, 2.0.0 for 2021).
  - The Planetary Computer tile server handles signing internally, so client apps can use the tilejson/tile endpoints directly without managing SAS tokens.
  - Each tile is a separate STAC item covering ~3 degrees. A swipe app would need to pick a specific geographic area and load the corresponding 2020 and 2021 items.

---

## Summary

| # | Source | Status | Format | Key-Free |
|---|--------|--------|--------|----------|
| 1 | Overture Buildings | verified | PMTiles vector | Yes |
| 2 | Admin Boundaries | needs-alternative | GeoJSON (Natural Earth) | Yes |
| 3 | NOAA SST | verified | COG via PC tile server | Yes |
| 4 | NASA FIRMS Fires | verified | CSV (convert to GeoJSON) | Yes |
| 4a| USGS Earthquakes | verified | GeoJSON | Yes |
| 5 | OpenAQ Air Quality | needs-alternative | API (requires key) | No |
| 6 | GFW Tree Cover Loss | needs-alternative | COG via PC (Esri LULC) | Yes |
| 7 | ESA WorldCover | verified | COG via PC tile server | Yes |

### Recommendations

1. **Admin Boundaries**: Use Natural Earth GeoJSON from CDN. 177 countries at 110m resolution is plenty for a choropleth demo. No PMTiles needed for this scale.
2. **Active Fires**: Use FIRMS CSV direct download (no API key). Parse CSV to GeoJSON client-side. Alternatively, swap to USGS Earthquakes for zero-conversion GeoJSON.
3. **Air Quality**: Either register for a free OpenAQ API key, or substitute with USGS Earthquake feed for the point-data demo.
4. **Tree Cover Loss**: Use Esri 10m LULC on Planetary Computer as the raster change layer. Annual coverage 2017-2024 enables temporal comparison.
