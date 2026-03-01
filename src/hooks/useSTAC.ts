import { useEffect, useState } from "react";
import { getSTACItemAssets, searchSTAC, type STACItem, type STACSearchParams } from "../utils/stac";

export interface UseSTACOptions extends STACSearchParams {
  apiUrl: string;
  autoSearch?: boolean;
}

export interface UseSTACReturn {
  items: STACItem[];
  selectedItem: STACItem | null;
  loading: boolean;
  error: string | null;
  search: () => Promise<void>;
  selectItem: (item: STACItem | null) => void;
  getCOGUrls: () => { name: string; href: string }[];
}

export function useSTAC({ apiUrl, autoSearch = false, ...params }: UseSTACOptions): UseSTACReturn {
  const [items, setItems] = useState<STACItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<STACItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await searchSTAC(apiUrl, params);
      setItems(result.features);
      if (!selectedItem && result.features.length > 0) {
        setSelectedItem(result.features[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown STAC error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!autoSearch) return;
    void search();
    // Explicitly tied to API and stable serialized query input.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiUrl, autoSearch, JSON.stringify(params)]);

  return {
    items,
    selectedItem,
    loading,
    error,
    search,
    selectItem: setSelectedItem,
    getCOGUrls: () => (selectedItem ? getSTACItemAssets(selectedItem) : [])
  };
}
