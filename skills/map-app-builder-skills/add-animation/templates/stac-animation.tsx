// STAC-based temporal animation using stac-react for timestamp discovery.
import { useEffect } from "react";
import { useStacSearch } from "stac-react";
import {
  useAnimationClock,
  AnimationTimeline,
  extractTimestamps,
  getSTACItemAssets,
} from "@maptool/core";
import type { Timestep } from "@maptool/core";

const { result, search, setCollections, setBbox, setDatetime } =
  useStacSearch();

useEffect(() => {
  setCollections(["sentinel-2-l2a"]);
  setBbox([-122.5, 37.5, -122.0, 38.0]);
  setDatetime("2024-01-01/2024-06-30");
}, []);

useEffect(() => {
  search();
}, [search]);

const items = result?.features ?? [];

const temporal = extractTimestamps(items);
const timestamps: Timestep[] = temporal.map((t) => ({ time: t.time }));

const getItemForIndex = (index: number) => {
  const entry = temporal[index];
  if (!entry) return null;
  return items.find((item) => item.id === entry.itemId) ?? null;
};

const currentItem = getItemForIndex(clock.currentIndex);
const cogUrls = currentItem ? getSTACItemAssets(currentItem) : [];
const activeUrl = cogUrls[0]?.href ?? "";
