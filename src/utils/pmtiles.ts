import { PMTiles, Protocol, TileType } from "pmtiles";

export interface PMTilesMetadata {
  bounds: [number, number, number, number];
  minZoom: number;
  maxZoom: number;
  tileType: "raster" | "vector";
  layers?: string[];
}

export interface PMTilesProtocolResult {
  protocol: InstanceType<typeof Protocol>;
  cleanup: () => void;
}

/** Creates a MapLibre-compatible protocol handler for pmtiles:// URLs. */
export function createPMTilesProtocol(): PMTilesProtocolResult {
  const protocol = new Protocol();

  return {
    protocol,
    cleanup: () => {}
  };
}

/** Fetches metadata from a PMTiles archive. */
export async function fetchPMTilesMetadata(
  url: string
): Promise<PMTilesMetadata> {
  const pmtiles = new PMTiles(url);
  const header = await pmtiles.getHeader();
  const metadata = (await pmtiles.getMetadata()) as Record<string, unknown>;

  const tileType =
    header.tileType === TileType.Mvt ? "vector" : "raster";

  const vectorLayers = metadata?.vector_layers as
    | Array<{ id: string }>
    | undefined;
  const layers =
    tileType === "vector" && vectorLayers
      ? vectorLayers.map((l) => l.id)
      : undefined;

  return {
    bounds: [
      header.minLon,
      header.minLat,
      header.maxLon,
      header.maxLat
    ],
    minZoom: header.minZoom,
    maxZoom: header.maxZoom,
    tileType,
    layers
  };
}
