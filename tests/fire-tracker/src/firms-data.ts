const FIRMS_CSV_URL =
  "https://firms.modaps.eosdis.nasa.gov/data/active_fire/suomi-npp-viirs-c2/csv/SUOMI_VIIRS_C2_Global_24h.csv";

interface FireFeature {
  type: "Feature";
  geometry: { type: "Point"; coordinates: [number, number] };
  properties: {
    bright_ti4: number;
    confidence: string;
    frp: number;
    acq_date: string;
    daynight: string;
  };
}

export interface FireCollection {
  type: "FeatureCollection";
  features: FireFeature[];
}

export async function fetchFIRMSData(): Promise<FireCollection> {
  const res = await fetch(FIRMS_CSV_URL);
  if (!res.ok) throw new Error(`FIRMS fetch failed: ${res.status}`);
  const text = await res.text();
  const lines = text.trim().split("\n");
  const headers = lines[0].split(",");

  const idx = (name: string) => headers.indexOf(name);
  const latIdx = idx("latitude");
  const lonIdx = idx("longitude");
  const brightIdx = idx("bright_ti4");
  const confIdx = idx("confidence");
  const frpIdx = idx("frp");
  const dateIdx = idx("acq_date");
  const dnIdx = idx("daynight");

  const features: FireFeature[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",");
    const lat = parseFloat(cols[latIdx]);
    const lon = parseFloat(cols[lonIdx]);
    if (isNaN(lat) || isNaN(lon)) continue;

    features.push({
      type: "Feature",
      geometry: { type: "Point", coordinates: [lon, lat] },
      properties: {
        bright_ti4: parseFloat(cols[brightIdx]),
        confidence: cols[confIdx],
        frp: parseFloat(cols[frpIdx]),
        acq_date: cols[dateIdx],
        daynight: cols[dnIdx]
      }
    });
  }

  return { type: "FeatureCollection", features };
}
