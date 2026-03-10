export interface FlightRoute {
  source: [number, number];
  target: [number, number];
  sourceAirport: string;
  targetAirport: string;
  count: number;
}

interface AirportInfo {
  position: [number, number];
  name: string;
  city: string;
  country: string;
}

const AIRPORTS_URL =
  "https://raw.githubusercontent.com/jpatokal/openflights/master/data/airports.dat";
const ROUTES_URL =
  "https://raw.githubusercontent.com/jpatokal/openflights/master/data/routes.dat";

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (const char of line) {
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function parseAirports(text: string): Map<string, AirportInfo> {
  const airports = new Map<string, AirportInfo>();
  for (const line of text.split("\n")) {
    if (!line.trim()) continue;
    const cols = parseCSVLine(line);
    const id = cols[0];
    const lat = parseFloat(cols[6]);
    const lng = parseFloat(cols[7]);
    if (isNaN(lat) || isNaN(lng)) continue;
    airports.set(id, {
      position: [lng, lat],
      name: cols[1]?.replace(/"/g, "") ?? "",
      city: cols[2]?.replace(/"/g, "") ?? "",
      country: cols[3]?.replace(/"/g, "") ?? ""
    });
  }
  return airports;
}

function parseRoutes(
  text: string,
  airports: Map<string, AirportInfo>
): FlightRoute[] {
  const pairCounts = new Map<string, { route: FlightRoute; count: number }>();

  for (const line of text.split("\n")) {
    if (!line.trim()) continue;
    const cols = parseCSVLine(line);
    const sourceId = cols[3];
    const destId = cols[5];
    if (sourceId === "\\N" || destId === "\\N") continue;
    const sourceAirport = airports.get(sourceId);
    const destAirport = airports.get(destId);
    if (!sourceAirport || !destAirport) continue;

    const key = `${sourceId}-${destId}`;
    const existing = pairCounts.get(key);
    if (existing) {
      existing.count++;
    } else {
      pairCounts.set(key, {
        route: {
          source: sourceAirport.position,
          target: destAirport.position,
          sourceAirport: `${sourceAirport.name} (${sourceAirport.city})`,
          targetAirport: `${destAirport.name} (${destAirport.city})`,
          count: 0
        },
        count: 1
      });
    }
  }

  const sorted = Array.from(pairCounts.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 1000);

  return sorted.map(({ route, count }) => ({ ...route, count }));
}

export async function fetchFlightRoutes(): Promise<FlightRoute[]> {
  const [airportsText, routesText] = await Promise.all([
    fetch(AIRPORTS_URL).then((r) => r.text()),
    fetch(ROUTES_URL).then((r) => r.text())
  ]);

  const airports = parseAirports(airportsText);
  return parseRoutes(routesText, airports);
}
