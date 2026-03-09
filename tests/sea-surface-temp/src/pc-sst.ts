const STAC_API = "https://planetarycomputer.microsoft.com/api/stac/v1/search";
const COLLECTION = "noaa-cdr-sea-surface-temperature-optimum-interpolation";

interface STACItem {
  id: string;
  properties: { datetime: string; [key: string]: unknown };
}

interface STACSearchResponse {
  features: STACItem[];
}

export interface SSTItem {
  itemId: string;
  datetime: string;
}

export async function fetchRecentSSTItems(count: number = 30): Promise<SSTItem[]> {
  const body = {
    collections: [COLLECTION],
    limit: count,
    sortby: [{ field: "datetime", direction: "desc" }]
  };

  const res = await fetch(STAC_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  if (!res.ok) throw new Error(`STAC search failed: ${res.status}`);
  const data: STACSearchResponse = await res.json();

  return data.features
    .map((f) => ({
      itemId: f.id,
      datetime: f.properties.datetime
    }))
    .reverse();
}

export function buildSSTTileUrl(itemId: string): string {
  const params = new URLSearchParams({
    collection: COLLECTION,
    item: itemId,
    assets: "sst",
    colormap_name: "coolwarm",
    rescale: "-2,35"
  });
  return `https://planetarycomputer.microsoft.com/api/data/v1/item/tiles/WebMercatorQuad/{z}/{x}/{y}@1x?${params}`;
}
