// Wind velocity texture config — PNG R/G channels encode U/V components.
// Source: Mapbox webgl-wind demo (Nov 2016 GFS data).

const WIND_PNG_URL =
  "https://raw.githubusercontent.com/mapbox/webgl-wind/master/demo/wind/2016112000.png";
const WIND_JSON_URL =
  "https://raw.githubusercontent.com/mapbox/webgl-wind/master/demo/wind/2016112000.json";

export interface WindDataConfig {
  image: string;
  metadataUrl: string;
  bounds: [number, number, number, number];
  uMin: number;
  uMax: number;
  vMin: number;
  vMax: number;
}

export const WIND_DATA: WindDataConfig = {
  image: WIND_PNG_URL,
  metadataUrl: WIND_JSON_URL,
  bounds: [-180, -90, 180, 90],
  uMin: -30,
  uMax: 30,
  vMin: -30,
  vMax: 30,
};
