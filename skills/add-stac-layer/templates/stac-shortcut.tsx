// Simplified STAC layer using createSTACLayer (no manual useTitiler wiring).
// Requires: stac-react, @tanstack/react-query, @maptool/core
// The app must be wrapped with QueryClientProvider and StacApiProvider.
// Note: createSTACLayer throws if no compatible asset is found, so guard
// with a selectedItem check before constructing the layer array.

import { useState, useEffect } from "react";
import { useStacSearch } from "stac-react";
import { createSTACLayer } from "@maptool/core";

const TITILER_URL = import.meta.env.VITE_TITILER_URL;

export default function STACShortcut() {
  const { result, search, setCollections, setBbox, setDatetime } =
    useStacSearch();

  useEffect(() => {
    setCollections(["sentinel-2-l2a"]);
    setBbox([-122.5, 37.5, -122.0, 38.0]);
    setDatetime("2024-06-01/2024-06-30");
  }, []);

  useEffect(() => {
    search();
  }, [search]);

  const items = result?.features ?? [];
  const [selectedItem, setSelectedItem] = useState<any>(null);

  useEffect(() => {
    if (!selectedItem && items.length > 0) {
      setSelectedItem(items[0]);
    }
  }, [items, selectedItem]);

  const layers = selectedItem
    ? [
        createSTACLayer({
          id: "stac-quick",
          baseUrl: TITILER_URL,
          item: selectedItem,
          assetName: "visual", // optional — defaults to first compatible asset
          colormap: "viridis",
        }),
      ]
    : [];

  return <>{/* Pass `layers` to your DeckGL component */}</>;
}
