export interface WindArrow {
  position: [number, number];
  angle: number;
  speed: number;
}

interface WindMetadata {
  source: string;
  date: string;
  width: number;
  height: number;
  uMin: number;
  uMax: number;
  vMin: number;
  vMax: number;
}

const WIND_PNG_URL =
  "https://raw.githubusercontent.com/mapbox/webgl-wind/master/demo/wind/2016112000.png";
const WIND_JSON_URL =
  "https://raw.githubusercontent.com/mapbox/webgl-wind/master/demo/wind/2016112000.json";

const SAMPLE_STEP = 5;

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

export async function fetchWindArrows(): Promise<WindArrow[]> {
  const [img, metaResponse] = await Promise.all([
    loadImage(WIND_PNG_URL),
    fetch(WIND_JSON_URL),
  ]);

  const meta: WindMetadata = await metaResponse.json();

  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0);
  const imageData = ctx.getImageData(0, 0, img.width, img.height);
  const pixels = imageData.data;

  const arrows: WindArrow[] = [];

  for (let lat = -90; lat <= 90; lat += SAMPLE_STEP) {
    for (let lng = -180; lng < 180; lng += SAMPLE_STEP) {
      const x = Math.floor(((lng + 180) / 360) * img.width);
      const y = Math.floor(((90 - lat) / 180) * img.height);

      const idx = (y * img.width + x) * 4;
      const rVal = pixels[idx];
      const gVal = pixels[idx + 1];

      const u = meta.uMin + (rVal / 255) * (meta.uMax - meta.uMin);
      const v = meta.vMin + (gVal / 255) * (meta.vMax - meta.vMin);

      const speed = Math.sqrt(u * u + v * v);
      const angle = (Math.atan2(v, u) * 180) / Math.PI;

      arrows.push({
        position: [lng, lat],
        angle,
        speed,
      });
    }
  }

  return arrows;
}
