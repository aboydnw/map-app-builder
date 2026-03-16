# CNG Sandbox — GEE Positioning Design Spec

**Date:** 2026-03-16
**Status:** Approved for implementation planning
**Author:** Anthony Boyd / Claude Code

---

## Overview

This spec defines the strategy and user stories for positioning the CNG Sandbox toward Google Earth Engine (GEE) users. The timing is driven by GEE's noncommercial quota tiers taking effect **April 27, 2026**, creating a structural moment where academic and cost-sensitive users are actively evaluating alternatives.

The approach is two-phase:
1. **Content Sprint** — framing, landing page, and one product tweak. Ships before April 27.
2. **v1.75 milestone** — new product features that turn GEE exports into CNG-native data.

This work inserts between the existing v1.5 (temporal stacks) and v2 (scrollytelling) milestones. The existing roadmap sequence is otherwise unchanged.

---

## Strategic Positioning

**CNG Sandbox is not a GEE replacement.** GEE's planetary-scale compute remains unmatched for its core use cases. The sandbox targets a specific, underserved moment: a GEE user has exported their data, left Google's walled garden, and has no idea what to do next.

The primary message to GEE users: **"Learn the formats that let you stop paying for compute you don't need."** Many operations GEE charges EECU-hours for — tile rendering, collection filtering, app serving — are operations that CNG formats handle without a compute layer at all.

Differentiators over leafmap (the closest existing migration path) for this audience:
- Zero setup (no Python, no Jupyter, no conda)
- Interactive format inspection with teaching moments
- Visual map building, not code
- "Built by the makers" trust from DevSeed's authorship of TiTiler, pgSTAC, tipg, rio-cogeo

---

## Roadmap

| Phase | Milestone | Timing | Description |
|-------|-----------|--------|-------------|
| 0 | v1 | Complete | Single file upload, shareable map, credits sidebar |
| 1 | **Content Sprint** | Now → April 27, 2026 | GEE landing page, blog post, file size bump, sidebar callouts |
| 2 | v1.5 | After content sprint | Temporal stacks, time slider, animation, GIF/MP4 export |
| 3 | **v1.75** | After v1.5 | STAC catalog generation, COG optimization teaching, GEE→CNG concept map, multi-tile ingest |
| 4 | v2 | Unchanged | Scrollytelling |
| 5 | v2.5 | Unchanged | Open Data Discovery Panel |
| 6 | v3 | Unchanged | Custom Map Application CTA |

---

## User Stories — Content Sprint

### GEE-1 — Landing page

**As a** GEE user who just exported GeoTIFFs and doesn't know what to do next,
**I want to** find a page that speaks directly to my situation,
**so that** I know the sandbox is built for this exact moment.

**Acceptance criteria:**
- Page lives at `sandbox.devseed.com/from-gee`
- Leads with the "exported from GEE, now what?" framing
- Explains COG, STAC, PMTiles in GEE-comparative terms (two-column table: "In GEE you… / In CNG you…")
- Explains the 5 CNG patterns that eliminate EECU costs: range requests, STAC search, client-side rendering, selective processing, static hosting
- CTA: "Upload your first export →" links to the sandbox upload page

---

### GEE-2 — File size limit

**As a** GEE user,
**I want to** upload exported GeoTIFFs up to 2 GB,
**so that** I don't have to preprocess or split my files before using the sandbox.

**Acceptance criteria:**
- Upload and URL ingest limits raised from 1 GB to 2 GB
- Rate limit unchanged (5 uploads/IP/hour)
- Error message for oversized files references GEE's auto-split behavior: "GEE splits exports over 2 GB into tiles — upload each tile separately and we'll combine them."

---

### GEE-3 — Credits panel GEE callouts

**As a** GEE user viewing my converted data on the map,
**I want to** see a GEE→CNG callout in the credits sidebar,
**so that** I can connect what I already know to what I'm seeing.

**Acceptance criteria:**
- A "Coming from GEE?" expandable section appears in the credits sidebar for raster datasets (GeoTIFF/NetCDF inputs)
- Shows one concept mapping relevant to the conversion path: e.g., "In GEE, you'd visualize this with `Map.addLayer(image)`. Here, TiTiler serves the same tiles via HTTP — no EECU cost per view."
- Links to the `/from-gee` landing page for the full concept map

---

### GEE-4 — Expiry page GEE copy

**As a** GEE user whose sandbox map has expired,
**I want to** see copy that acknowledges the quota context,
**so that** I'm prompted to think about CNG as an alternative rather than just re-uploading.

**Acceptance criteria:**
- Expiry page adds a GEE-specific contextual line: "Hosting this data as a COG on S3 would cost ~$0.02/month and serve tiles with no compute cost."
- "Talk to Dev Seed" CTA present as normal

---

## User Stories — v1.75 "Catalog Your Exports"

### GEE-5 — STAC Item generation

**As a** GEE user with multiple exported GeoTIFFs,
**I want to** have the sandbox generate a STAC Item for each file I upload,
**so that** my data becomes described, searchable, and portable in an open format.

**Acceptance criteria:**
- User can upload multiple GeoTIFFs in a single session and group them into one dataset
- For each file, the sandbox generates a valid STAC Item with: `bbox`, `datetime` (inferred from filename if it matches GEE's export naming pattern, e.g., `image_20230101.tif`), `geometry`, `assets` pointing to the COG in MinIO
- STAC Items displayed in credits sidebar with a collapsible JSON preview
- Items validate against STAC 1.1.0 spec

---

### GEE-6 — Static STAC catalog export

**As a** GEE user who has generated STAC Items,
**I want to** download a static STAC catalog I can host anywhere,
**so that** my data is accessible to any STAC-compatible tool without depending on GEE or Google Cloud.

**Acceptance criteria:**
- "Export catalog" button in credits sidebar downloads a `.zip` containing: `catalog.json`, `collection.json`, one `{item-id}.json` per file
- Catalog is a valid static STAC catalog per the STAC 1.1.0 spec
- A tooltip explains: "Host this on S3, GitHub Pages, or any static server. Any STAC browser or QGIS can read it."
- A "What can I do with this?" expandable section links to STAC Browser, QGIS native STAC, and leafmap

---

### GEE-7 — Non-optimized GeoTIFF detection and teaching

**As a** GEE user who uploaded a standard (non-COG) GeoTIFF,
**I want to** have the sandbox detect this, optimize it inline, and show me what changed,
**so that** I understand why COG matters without reading documentation.

**Acceptance criteria:**
- After conversion, credits sidebar shows a "COG optimization" card if input was not already a valid COG (detected via `rio-cogeo validate`)
- Card displays: file size before/after, presence of overviews (before: none, after: N levels), internal tiling (before: none, after: 512×512 tiles)
- Card includes a one-sentence explanation: "Internal tiling lets any viewer fetch only the pixels it needs via HTTP — no full download required."
- Existing 8-check validation suite runs as normal after optimization

---

### GEE-8 — GEE → CNG concept map panel

**As a** GEE user exploring a map in the sandbox,
**I want to** open a reference panel that maps GEE concepts to open-stack equivalents,
**so that** I can build on my existing mental model without leaving the sandbox.

**Acceptance criteria:**
- "Coming from GEE?" toggle appears in the map page header (desktop) or menu (mobile)
- Panel shows a two-column table: GEE concept → CNG equivalent, covering at minimum: `ee.Image`, `ee.ImageCollection`, `ee.Reducer`, `Export.image.toDrive()`, `Map.addLayer()`, `ee.FeatureCollection`, `GEE App`
- Each CNG equivalent links to the relevant tool's homepage
- Panel is dismissible and does not obscure the map

---

### GEE-9 — Multi-tile export ingest

**As a** GEE user whose large export was auto-split into tiles (e.g., `image-0000000000-0000000000.tif`),
**I want to** upload all tiles together as a single dataset,
**so that** I can work with my full export without manually merging files first.

**Acceptance criteria:**
- Multi-file upload supports up to 10 files per dataset (extends v1.5 temporal stack infrastructure)
- If filenames match GEE's tile naming pattern, sandbox detects them as spatial tiles (not timesteps) and mosaics them into a single COG
- Mosaic bounding box and validation run against the combined output
- Progress tracker reflects the additional mosaic step: `Scanning → Mosaicking → Converting → Validating → Ingesting → Ready`

---

### GEE-10 — Compute pathway callout

**As a** GEE user worried that CNG has no compute layer,
**I want to** see a clear explanation of where I can run analysis,
**so that** I understand what the sandbox is for and have a concrete next step beyond it.

**Acceptance criteria:**
- `/from-gee` landing page includes a "Where do I run my analysis?" section
- Lists three options with one-line descriptions: Google Colab (free, familiar), Microsoft Planetary Computer Hub (managed Jupyter, co-located with data), Pangeo JupyterHub (open, scalable)
- Framing: "CNG Sandbox is the format and catalog layer. These are the compute layers."
- Same callout appears in the credits sidebar under "What's next" for GEE-originated uploads

---

## Out of Scope

| Item | Reason |
|------|--------|
| GEE-compatible compute layer | Off-strategy, massively expensive, competes on Google's strongest ground |
| GEE API compatibility shim | Brittle, sends the wrong message — point is to learn the open stack |
| GEE account integration | Adds complexity, ties us to Google's API changes |
| leafmap feature parity | leafmap already serves Python-comfortable users well — don't compete there |
| Full STAC API (dynamic) | Static catalog export is sufficient for v1.75; dynamic API is eoAPI's role |

---

## Success Metrics

| Phase | Metric | Target |
|-------|--------|--------|
| Content Sprint | `/from-gee` page traffic in first 30 days | — (baseline, no prior data) |
| Content Sprint | Upload volume increase week-over-week after April 27 | Measurable uplift vs. prior 4-week average |
| Content Sprint | Blog post shares / community mentions | ≥ 1 mention in CNG Forum, geemap community, or Spatial Thoughts orbit |
| v1.75 | STAC catalog exports per week | ≥ 10 in first month post-launch |
| v1.75 | Credits panel GEE callout expansion rate | ≥ 30% of raster map page visits |
| v1.75 | Inbound inquiries referencing GEE migration | ≥ 1 per quarter |

---

## Key References

- [GEE Noncommercial Tiers (April 2026)](https://developers.google.com/earth-engine/guides/noncommercial_tiers)
- [CNG Community Challenges 2025](https://cloudnativegeo.org/blog/2025/07/challenges-for-the-cng-community-2025)
- [Spatial Thoughts GEE Quota Monitoring](https://spatialthoughts.com/2026/02/09/gee-quota-monitoring/)
- [Pangeo: Closed Platforms vs. Open Architectures](https://medium.com/pangeo/closed-platforms-vs-open-architectures-for-cloud-native-earth-system-analytics-1ad88708ebb6)
- [GEE Economics (Christopher Ren)](https://christopherren.substack.com/p/the-economics-of-earth-engine)
- [CNG Sandbox PRD v1.0](../CNG_SANDBOX_PRD_v1.0.md)
- [GEE to CNG Migration Opportunity](../GEE_to_CNG_Migration_Opportunity.md)
- [CNG Sandbox Competitive Landscape](../CNG_Sandbox_Competitive_Landscape_and_Market_Opportunity.md)
