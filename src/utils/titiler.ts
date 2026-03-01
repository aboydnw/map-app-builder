export interface TitilerOptions {
  url: string;
  colormap?: string;
  bidx?: number;
  rescale?: [number, number];
  tileMatrixSetId?: string;
}

export interface COGInfo {
  bounds: [number, number, number, number];
  minzoom: number;
  maxzoom: number;
  width: number;
  height: number;
  [key: string]: unknown;
}

export interface BandStatistics {
  min: number;
  max: number;
  mean?: number;
  percentile_2?: number;
  percentile_98?: number;
  [key: string]: unknown;
}

export type COGStatistics = Record<string, BandStatistics>;

export function buildTileUrl(baseUrl: string, options: TitilerOptions): string {
  const { url, colormap = "viridis", bidx = 1, rescale, tileMatrixSetId = "WebMercatorQuad" } = options;
  const params = new URLSearchParams();
  params.set("url", url);
  params.set("bidx", String(bidx));
  if (colormap) params.set("colormap_name", colormap);
  if (rescale) params.set("rescale", rescale.join(","));
  return `${baseUrl}/cog/tiles/${tileMatrixSetId}/{z}/{x}/{y}@1x.png?${params.toString()}`;
}

export async function fetchCOGInfo(baseUrl: string, cogUrl: string): Promise<COGInfo> {
  const params = new URLSearchParams({ url: cogUrl });
  const response = await fetch(`${baseUrl}/cog/info?${params.toString()}`);
  if (!response.ok) throw new Error(`TiTiler info failed: ${response.status} ${response.statusText}`);
  return (await response.json()) as COGInfo;
}

export async function fetchCOGStatistics(
  baseUrl: string,
  cogUrl: string,
  options?: { bidx?: number }
): Promise<COGStatistics> {
  const params = new URLSearchParams({ url: cogUrl });
  if (options?.bidx) params.set("bidx", String(options.bidx));
  const response = await fetch(`${baseUrl}/cog/statistics?${params.toString()}`);
  if (!response.ok) throw new Error(`TiTiler statistics failed: ${response.status} ${response.statusText}`);
  return (await response.json()) as COGStatistics;
}

export async function fetchColormaps(baseUrl: string): Promise<string[]> {
  const response = await fetch(`${baseUrl}/cog/colorMaps`);
  if (!response.ok) throw new Error(`TiTiler colormaps failed: ${response.status} ${response.statusText}`);
  const data = (await response.json()) as { colorMaps?: string[] } | Record<string, unknown>;
  return "colorMaps" in data && Array.isArray(data.colorMaps) ? data.colorMaps : Object.keys(data);
}
