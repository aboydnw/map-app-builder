# Band Metadata Detection & Band Selector

**Date:** 2026-03-17
**Status:** Approved

## Problem

Multi-band raster datasets (e.g., RGB imagery) show a colormap selector that has no effect, and users get no information about what bands the dataset contains. Single-band datasets work correctly but don't surface dtype or band description metadata.

## Design

### Backend: Band metadata extraction

Extend the existing `_extract_band_count` step in the pipeline (runs after COG conversion) to also extract:

- **`band_names: list[str]`** — from `src.descriptions` (rasterio). Falls back to `["Band 1", "Band 2", ...]` if the file has no descriptions embedded.
- **`color_interpretation: list[str]`** — from `src.colorinterp` (e.g., `["red", "green", "blue"]`). Determines whether the file is true RGB vs arbitrary multi-band.
- **`dtype: str`** — from `src.dtypes[0]` (e.g., `"float32"`, `"uint8"`).

These fields are added to the `Dataset` model (`sandbox/ingestion/src/models.py`) and returned via the existing `/api/datasets/{id}` endpoint. No new endpoints needed.

### Frontend: Dataset type interface

Add to the `Dataset` TypeScript interface:

```typescript
band_names: string[] | null;
color_interpretation: string[] | null;
dtype: string | null;
```

### Frontend: CreditsPanel metadata display

Add a "Raster" metadata section to CreditsPanel (similar to the existing "Temporal" section) showing:

- Band count and type label derived from `color_interpretation`:
  - `["red", "green", "blue"]` → "3-band RGB"
  - `["red", "green", "blue", "undefined"]` → "4-band (Red, Green, Blue, Band 4)"
  - `["gray"]` → "Single-band float32" (includes dtype)
  - Fallback: "{n}-band" with listed band names

### Frontend: RasterMap controls

The controls panel (bottom-right) adapts based on band count:

**Single-band (band_count === 1):**
- Colormap selector + opacity slider (unchanged from current behavior)

**Multi-band (band_count > 1):**
- **Band selector dropdown** listing:
  - "RGB" option at the top (default selection) — renders the default multi-band composite
  - Individual bands by name (e.g., "Red", "Green", "Blue", "NIR" or fallback "Band 1", "Band 2", ...)
- **Colormap selector** — shown only when a specific band is selected, hidden when "RGB" is selected
- **Opacity slider** — always shown
- **Legend** — shown only when a specific band is selected, hidden when "RGB" is selected

### Tile URL construction

Three cases in the `tileUrl` memo:

1. **Single-band dataset:** `...?assets=data&colormap_name={colormap}` (unchanged)
2. **Multi-band, "RGB" selected:** `...?assets=data` (no colormap, no bidx)
3. **Multi-band, specific band selected:** `...?assets=data&bidx={n}&colormap_name={colormap}`

The `bidx` query parameter tells titiler to extract one band and return it as single-band, at which point `colormap_name` applies normally. Auto-rescaling by titiler is acceptable for v1 (no per-band min/max stored).

### Skill update

Add a `check_band_metadata` function to the `geotiff-to-cog` validation script (`skills/geo-conversions/geotiff-to-cog/scripts/validate.py`) that extracts and returns band descriptions and color interpretation. Follows the existing skill feedback loop pattern.

## Files to modify

### Backend
- `sandbox/ingestion/src/models.py` — add `band_names`, `color_interpretation`, `dtype` fields to Dataset
- `sandbox/ingestion/src/services/pipeline.py` — extend `_extract_band_count` to also extract band names, color interp, dtype
- `sandbox/ingestion/src/services/temporal_pipeline.py` — same extraction for temporal datasets

### Frontend
- `sandbox/frontend/src/types.ts` — add new fields to Dataset interface
- `sandbox/frontend/src/components/RasterMap.tsx` — band selector dropdown, conditional colormap/legend, bidx URL param
- `sandbox/frontend/src/components/CreditsPanel.tsx` — raster metadata section

### Skills
- `skills/geo-conversions/geotiff-to-cog/scripts/validate.py` — add `check_band_metadata`

## Out of scope

- RGB band compositor (assigning arbitrary bands to R/G/B channels)
- Per-band min/max statistics (would improve colormap consistency but not needed for v1)
- Band math expressions (e.g., NDVI computation)
