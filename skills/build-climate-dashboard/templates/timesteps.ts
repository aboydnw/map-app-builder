// Time-series COG definitions for the climate dashboard.
// Replace URLs and labels with your actual data.

export interface Timestep {
  label: string;
  url: string;
}

export const TIMESTEPS: Timestep[] = [
  { label: "Jan 2024", url: "https://example.com/sst/sst-2024-01.tif" },
  { label: "Feb 2024", url: "https://example.com/sst/sst-2024-02.tif" },
  { label: "Mar 2024", url: "https://example.com/sst/sst-2024-03.tif" },
];
