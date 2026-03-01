# Skill: Writing Tests for maptool Components

## When to use
When writing unit tests for components, hooks, or utils in a project using `@maptool/core`.

## Test stack
- **Vitest** — test runner (Jest-compatible API)
- **React Testing Library** — component rendering and interaction
- **`@testing-library/user-event`** — realistic user event simulation
- **Playwright** — E2E and visual regression

## Patterns

### Testing MapLegend

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { MapLegend } from "@maptool/core";

describe("MapLegend", () => {
  const layers = [{
    type: "continuous" as const,
    id: "temp",
    title: "Temperature",
    unit: "°C",
    domain: [0, 40] as [number, number],
    colors: ["#313695", "#ffffbf", "#a50026"],
    ticks: 3,
  }];

  it("renders title with unit", () => {
    render(<MapLegend layers={layers} />);
    expect(screen.getByText("Temperature (°C)")).toBeInTheDocument();
  });

  it("calls onLayerToggle when toggler clicked", async () => {
    const onToggle = vi.fn();
    const user = userEvent.setup();
    render(
      <MapLegend
        layers={[{ ...layers[0], toggler: true, visible: true }]}
        onLayerToggle={onToggle}
      />
    );
    await user.click(screen.getByRole("button", { name: /toggle temperature/i }));
    expect(onToggle).toHaveBeenCalledWith("temp", false);
  });
});
```

### Testing useAnimationClock

```tsx
import { renderHook, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useAnimationClock } from "@maptool/core";

describe("useAnimationClock", () => {
  it("initializes at index 0, not playing", () => {
    const { result } = renderHook(() =>
      useAnimationClock({ totalFrames: 10, fps: 2 })
    );
    expect(result.current.currentIndex).toBe(0);
    expect(result.current.isPlaying).toBe(false);
  });

  it("clamps setIndex to valid range", () => {
    const { result } = renderHook(() =>
      useAnimationClock({ totalFrames: 5, fps: 2 })
    );
    act(() => result.current.setIndex(99));
    expect(result.current.currentIndex).toBe(4);
    act(() => result.current.setIndex(-1));
    expect(result.current.currentIndex).toBe(0);
  });

  it("stepForward wraps when looping", () => {
    const { result } = renderHook(() =>
      useAnimationClock({ totalFrames: 3, fps: 2, loop: true })
    );
    act(() => result.current.setIndex(2));
    act(() => result.current.stepForward());
    expect(result.current.currentIndex).toBe(0);
  });
});
```

### Testing pure utils

```tsx
import { describe, it, expect } from "vitest";
import { buildTileUrl } from "@maptool/core";

describe("buildTileUrl", () => {
  it("constructs valid TiTiler URL", () => {
    const url = buildTileUrl("http://localhost:8000", {
      url: "https://example.com/data.tif",
      colormap: "viridis",
      bidx: 1,
      rescale: [0, 100],
    });
    expect(url).toContain("{z}/{x}/{y}");
    expect(url).toContain("colormap_name=viridis");
    expect(url).toContain("rescale=0%2C100");
  });
});
```

## Common mistakes
- Forgetting `await` on `userEvent` calls — they return promises
- Forgetting `act()` around hook state updates
- Testing implementation details (class names, DOM structure) instead of behavior (text content, ARIA, callbacks)
- Skipping edge cases: empty arrays, boundary indices, null values

## Reference files
- `vitest.config.ts` — test runner config
- `src/test-setup.ts` — global test setup (`@testing-library/jest-dom`)
- `playwright.config.ts` — E2E config
- `src/components/MapLegend/MapLegend.test.tsx` — existing component tests
- `src/components/AnimationTimeline/AnimationTimeline.test.tsx` — existing component tests
