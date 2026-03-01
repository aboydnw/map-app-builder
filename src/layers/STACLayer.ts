import { getSTACItemAssets, type STACItem } from "../utils/stac";
import { buildTileUrl } from "../utils/titiler";
import { createCOGLayer, type COGLayerOptions } from "./COGLayer";

export interface STACLayerOptions {
  id: string;
  baseUrl: string;
  item: STACItem;
  assetName?: string;
  mimeType?: string;
  colormap?: string;
  bidx?: number;
  rescale?: [number, number];
  opacity?: number;
  visible?: boolean;
  minZoom?: number;
  maxZoom?: number;
}

export function createSTACLayer({
  id,
  baseUrl,
  item,
  assetName,
  mimeType = "image/tiff",
  colormap = "viridis",
  bidx = 1,
  rescale,
  opacity,
  visible,
  minZoom,
  maxZoom
}: STACLayerOptions) {
  const assets = getSTACItemAssets(item, mimeType);
  const selectedAsset = assetName ? assets.find((asset) => asset.name === assetName) : assets[0];
  if (!selectedAsset?.href) {
    throw new Error(`No compatible STAC asset found for item "${item.id}"`);
  }

  const tileUrl = buildTileUrl(baseUrl, {
    url: selectedAsset.href,
    colormap,
    bidx,
    rescale
  });

  const options: COGLayerOptions = {
    id,
    tileUrl,
    bounds: Array.isArray(item.bbox) && item.bbox.length === 4 ? (item.bbox as [number, number, number, number]) : undefined,
    opacity,
    visible,
    minZoom,
    maxZoom
  };

  return createCOGLayer(options);
}
