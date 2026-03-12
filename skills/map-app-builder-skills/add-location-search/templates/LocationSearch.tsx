// LocationSearch component — debounced search input with autocomplete dropdown.
// Place this as an overlay on top of the map. Calls onSelect with coordinates when a result is clicked.

import { useState, useRef } from "react";
import { Box, Input, List } from "@chakra-ui/react";
import { GeocodingResult, searchLocation } from "./geocoding";

function LocationSearch({
  onSelect,
}: {
  onSelect: (lng: number, lat: number, name: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const handleInput = (value: string) => {
    setQuery(value);
    clearTimeout(debounceRef.current);
    if (value.length < 3) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      const data = await searchLocation(value);
      setResults(data);
    }, 300);
  };

  return (
    <Box position="absolute" top={3} left={3} zIndex={1} w="300px">
      <Input
        placeholder="Search location..."
        value={query}
        onChange={(e) => handleInput(e.target.value)}
        bg="white"
        boxShadow="md"
      />
      {results.length > 0 && (
        <List.Root
          bg="white"
          borderRadius="md"
          boxShadow="md"
          mt={1}
          maxH="200px"
          overflowY="auto"
        >
          {results.map((r, i) => (
            <List.Item
              key={i}
              p={2}
              cursor="pointer"
              _hover={{ bg: "gray.100" }}
              onClick={() => {
                onSelect(r.lng, r.lat, r.name);
                setResults([]);
                setQuery(r.name);
              }}
              fontSize="sm"
            >
              {r.name}
            </List.Item>
          ))}
        </List.Root>
      )}
    </Box>
  );
}

export default LocationSearch;
