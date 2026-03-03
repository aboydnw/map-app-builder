import type { STACItem } from "@maptool/core";

const STAC_API = "https://planetarycomputer.microsoft.com/api/stac/v1";
const TILER_API = "https://planetarycomputer.microsoft.com/api/data/v1";
const COLLECTION = "noaa-mrms-qpe-1h-pass2";

interface STACSearchResponse {
  features: STACItem[];
  links: { rel: string; href: string }[];
}

export async function fetchRecentItems(hours = 48): Promise<STACItem[]> {
  const now = new Date();
  const start = new Date(now.getTime() - hours * 60 * 60 * 1000);
  const datetime = `${start.toISOString()}/${now.toISOString()}`;

  const items: STACItem[] = [];
  let url: string | null = `${STAC_API}/search`;
  let isFirstRequest = true;

  while (url) {
    const res = isFirstRequest
      ? await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            collections: [COLLECTION],
            datetime,
            "filter-lang": "cql2-json",
            filter: {
              op: "like",
              args: [{ property: "id" }, "CONUS%"]
            },
            limit: 100
          })
        })
      : await fetch(url);

    if (!res.ok) throw new Error(`STAC fetch failed: ${res.status}`);
    const data: STACSearchResponse = await res.json();
    items.push(...data.features);

    const nextLink = data.links.find((l) => l.rel === "next");
    url = nextLink?.href ?? null;
    isFirstRequest = false;
  }

  return items.sort(
    (a, b) =>
      new Date(a.properties.datetime ?? 0).getTime() -
      new Date(b.properties.datetime ?? 0).getTime()
  );
}

const YLGNBU_COLORMAP = JSON.stringify([
  [[0, 1], [0, 0, 0, 0]],
  [[1, 32], [255, 255, 217, 255]],
  [[32, 64], [237, 248, 177, 255]],
  [[64, 96], [199, 233, 180, 255]],
  [[96, 128], [127, 205, 187, 255]],
  [[128, 160], [65, 182, 196, 255]],
  [[160, 192], [29, 145, 192, 255]],
  [[192, 224], [34, 94, 168, 255]],
  [[224, 256], [37, 52, 148, 255]]
]);

export function buildPCTileUrl(itemId: string): string {
  const params = new URLSearchParams({
    collection: COLLECTION,
    item: itemId,
    assets: "cog",
    colormap: YLGNBU_COLORMAP,
    rescale: "0,25",
    nodata: "-1"
  });
  return `${TILER_API}/item/tiles/WebMercatorQuad/{z}/{x}/{y}@1x.png?${params}`;
}
