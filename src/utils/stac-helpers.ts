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
    .filter((item) => item.properties.datetime || item.properties.start_datetime)
    .map((item) => {
      const dt = (item.properties.datetime ?? item.properties.start_datetime) as string;
      return { time: new Date(dt).getTime(), itemId: item.id };
    })
    .sort((a, b) => a.time - b.time);
}
