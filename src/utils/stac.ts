export interface STACSearchParams {
  collections?: string[];
  bbox?: [number, number, number, number];
  datetime?: string;
  limit?: number;
  query?: Record<string, unknown>;
}

export interface STACAsset {
  href: string;
  type?: string;
  title?: string;
  description?: string;
  roles?: string[];
  [key: string]: unknown;
}

export interface STACItem {
  id: string;
  type: "Feature";
  properties: {
    datetime: string | null;
    [key: string]: unknown;
  };
  assets: Record<string, STACAsset>;
  collection?: string;
  [key: string]: unknown;
}

export interface STACSearchResult {
  type: "FeatureCollection";
  features: STACItem[];
}

export async function searchSTAC(apiUrl: string, params: STACSearchParams): Promise<STACSearchResult> {
  const response = await fetch(`${apiUrl}/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params)
  });
  if (!response.ok) throw new Error(`STAC search failed: ${response.status}`);
  return (await response.json()) as STACSearchResult;
}

export async function fetchSTACItem(apiUrl: string, collectionId: string, itemId: string): Promise<STACItem> {
  const response = await fetch(`${apiUrl}/collections/${collectionId}/items/${itemId}`);
  if (!response.ok) throw new Error(`STAC item fetch failed: ${response.status}`);
  return (await response.json()) as STACItem;
}

export function getSTACItemAssets(item: STACItem, mimeType = "image/tiff"): { name: string; href: string }[] {
  return Object.entries(item.assets)
    .filter(([, asset]) => {
      if (asset.type?.includes(mimeType)) return true;
      return Boolean(asset.roles?.includes("data") && asset.href.endsWith(".tif"));
    })
    .map(([name, asset]) => ({ name, href: asset.href }));
}

export function extractTimestamps(items: STACItem[]): { time: number; itemId: string }[] {
  return items
    .filter((item) => item.properties.datetime)
    .map((item) => ({ time: new Date(item.properties.datetime as string).getTime(), itemId: item.id }))
    .sort((a, b) => a.time - b.time);
}
