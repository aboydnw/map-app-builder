import { TileLayer } from "@deck.gl/geo-layers";
import { BitmapLayer } from "@deck.gl/layers";

export interface PMTilesRasterLayerOptions {
  id: string;
  url: string;
  bounds?: [number, number, number, number];
  minZoom?: number;
  maxZoom?: number;
  opacity?: number;
  visible?: boolean;
}

/** Creates a deck.gl TileLayer+BitmapLayer for raster PMTiles archives. */
export function createPMTilesRasterLayer({
  id,
  url,
  bounds,
  minZoom = 0,
  maxZoom = 22,
  opacity = 1,
  visible = true
}: PMTilesRasterLayerOptions) {
  return new TileLayer({
    id,
    data: url,
    minZoom,
    maxZoom,
    opacity,
    visible,
    tileSize: 256,
    ...(bounds ? { extent: bounds } : {}),
    renderSubLayers: (props: any) => {
      const { boundingBox } = props.tile;
      return new BitmapLayer(props, {
        data: undefined,
        image: props.data,
        bounds: [
          boundingBox[0][0],
          boundingBox[0][1],
          boundingBox[1][0],
          boundingBox[1][1]
        ]
      });
    }
  });
}
