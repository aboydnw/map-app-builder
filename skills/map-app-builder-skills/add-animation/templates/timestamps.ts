// Ordered timestamp definitions and COG URL mapping for animation frames.
import type { Timestep } from "@maptool/core";

const timestamps: Timestep[] = [
  { time: "2024-01-01T00:00:00Z" },
  { time: "2024-01-02T00:00:00Z" },
  { time: "2024-01-03T00:00:00Z" },
  // ... more timestamps
];

const cogUrlsByIndex: Record<number, string> = {
  0: "https://example.com/data-20240101.tif",
  1: "https://example.com/data-20240102.tif",
  2: "https://example.com/data-20240103.tif",
};
