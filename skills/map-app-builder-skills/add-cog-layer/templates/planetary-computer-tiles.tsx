// Constructing tile URLs directly from Microsoft Planetary Computer's
// tile rendering API — no local TiTiler or useTitiler needed.
// You must know the rescale range in advance (no auto-detection).

import { createCOGLayer, useColorScale } from "@maptool/core";

const params = new URLSearchParams({
  collection: "noaa-cdr-sea-surface-temperature-optimum-interpolation",
  item: "oisst-avhrr-v02r01.20240619",
  assets: "sst",
  colormap_name: "coolwarm",
  rescale: "-2,35",
});

const tileUrl = `https://planetarycomputer.microsoft.com/api/data/v1/item/tiles/WebMercatorQuad/{z}/{x}/{y}@1x?${params}`;

const layers = [createCOGLayer({ id: "sst", tileUrl })];

// Build legend colors client-side to match the server-side colormap
const colorScale = useColorScale({
  domain: [-2, 35],
  colormap: "coolwarm",
  steps: 8,
});
