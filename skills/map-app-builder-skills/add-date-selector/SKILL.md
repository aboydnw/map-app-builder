# Skill: Add a Date Selector

## When to use
When your map displays temporal data and users need to pick a specific date — for example, selecting a day for satellite imagery, air quality readings, or fire detections.

## Prerequisites
- Working map app shell (see `setup-map-app` skill)
- `@chakra-ui/react` installed (DateSelector uses Chakra's `Box` and `Input`)

## Template files

| File | Description |
|------|-------------|
| `templates/date-selector-example.tsx` | Complete App with DateSelector, STAC, and TiTiler date-filtering patterns |

## Steps

### 1. Add a date selector

See `templates/date-selector-example.tsx` for the complete integration. The template shows two data-filtering patterns:

- **TiTiler-based** — build a COG URL that includes the date string (e.g. `https://example.com/data/2024-06-15/ndvi.tif`), and pass `enabled: !!cogUrl` to skip fetching when no date is selected.
- **STAC-based** — pass the date string to `useSTAC`'s `datetime` parameter.

Always convert the `Date` to an ISO string (`selectedDate.toISOString().split("T")[0]`) before using it in URLs or queries.

### 2. Verify

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
