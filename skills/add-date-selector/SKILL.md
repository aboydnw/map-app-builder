# Skill: Add a Date Selector

## When to use
When your map displays temporal data and users need to pick a specific date — for example, selecting a day for satellite imagery, air quality readings, or fire detections.

## Prerequisites
- Working map app shell (see `setup-map-app` skill)
- `@chakra-ui/react` installed (DateSelector uses Chakra's `Box` and `Input`)

## Steps

### 1. Import the component

```tsx
import { DateSelector } from "@maptool/core";
```

### 2. Set up date state

```tsx
import { useState } from "react";

const [selectedDate, setSelectedDate] = useState<Date | null>(new Date(2024, 5, 15));
```

### 3. Render the DateSelector

Place inside your map container div, as a sibling to `<DeckGL>`:

```tsx
<div style={{ width: "100%", height: "100%", position: "relative" }}>
  <DeckGL viewState={viewState} layers={layers} onViewStateChange={...}>
    <Map mapStyle="..." />
  </DeckGL>
  <DateSelector
    value={selectedDate}
    onChange={setSelectedDate}
    minDate={new Date(2020, 0, 1)}
    maxDate={new Date(2024, 11, 31)}
    position="top-right"
  />
</div>
```

### 4. Use the date to filter data

React to date changes to update your layers. For example, with a STAC search:

```tsx
import { useSTAC, createSTACLayer } from "@maptool/core";

const dateStr = selectedDate
  ? selectedDate.toISOString().split("T")[0]
  : undefined;

const stac = useSTAC({
  catalogUrl: "https://planetarycomputer.microsoft.com/api/stac/v1",
  collectionId: "sentinel-2-l2a",
  datetime: dateStr,
  bbox: [-122.5, 37.5, -121.5, 38.5],
});
```

Or for a TiTiler-based layer where the COG URL includes the date:

```tsx
const cogUrl = selectedDate
  ? `https://example.com/data/${dateStr}/ndvi.tif`
  : undefined;

const titiler = useTitiler({
  baseUrl: import.meta.env.VITE_TITILER_URL,
  url: cogUrl ?? "",
  colormap: "RdYlGn",
  enabled: !!cogUrl,
});
```

### 5. Verify

Run `npm run dev` and confirm:
- [ ] The date picker appears in the chosen corner
- [ ] Selecting a date updates the map layer data
- [ ] Dates outside `minDate`/`maxDate` are not selectable
- [ ] Clearing the date input calls `onChange` with `null`

## Props reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `Date \| null` | required | Currently selected date |
| `onChange` | `(date: Date \| null) => void` | required | Called when user picks a date or clears it |
| `minDate` | `Date` | — | Earliest selectable date |
| `maxDate` | `Date` | — | Latest selectable date |
| `position` | `"top-left" \| "top-right" \| "bottom-left" \| "bottom-right"` | `"top-right"` | Corner placement on the map |

## Common mistakes
- **Timezone mismatches** — `DateSelector` constructs dates using local time (`new Date(y, m-1, d)`), not UTC. If your data uses UTC dates, convert accordingly before querying.
- **Forgetting to guard null** — `onChange` can return `null` when the user clears the input. Always check for `null` before using the date to build URLs or queries.
- **Not setting `minDate`/`maxDate`** — without bounds, users can select dates outside your data's temporal range, resulting in empty responses.

## Reference files
- `src/components/DateSelector/DateSelector.tsx` — component source, `DateSelectorProps`
