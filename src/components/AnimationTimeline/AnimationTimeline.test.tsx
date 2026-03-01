import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderWithProvider } from "../../test-utils";
import { AnimationTimeline } from "./AnimationTimeline";

describe("AnimationTimeline", () => {
  const timestamps = [
    { time: "2024-01-01T00:00:00Z" },
    { time: "2024-01-02T00:00:00Z" },
    { time: "2024-01-03T00:00:00Z" }
  ];

  it("renders playback controls and timestamp display", () => {
    renderWithProvider(
      <AnimationTimeline
        timestamps={timestamps}
        currentIndex={0}
        onIndexChange={() => undefined}
        isPlaying={false}
        onPlayingChange={() => undefined}
      />
    );
    expect(screen.getByRole("button", { name: /play/i })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: /animation timeline/i })).toBeInTheDocument();
    expect(screen.getAllByText(/2024/i).length).toBeGreaterThan(0);
  });

  it("emits step and speed callbacks", async () => {
    const user = userEvent.setup();
    const onIndexChange = vi.fn();
    const onSpeedChange = vi.fn();

    renderWithProvider(
      <AnimationTimeline
        timestamps={timestamps}
        currentIndex={1}
        onIndexChange={onIndexChange}
        isPlaying={false}
        onPlayingChange={() => undefined}
        speed={1}
        onSpeedChange={onSpeedChange}
      />
    );

    await user.click(screen.getByRole("button", { name: /step back/i }));
    await user.click(screen.getByRole("button", { name: /step forward/i }));
    await user.click(screen.getByRole("radio", { name: /speed 2x/i }));

    expect(onIndexChange).toHaveBeenCalledWith(0);
    expect(onIndexChange).toHaveBeenCalledWith(2);
    expect(onSpeedChange).toHaveBeenCalledWith(2);
  });

  it("supports window mode", () => {
    renderWithProvider(
      <AnimationTimeline
        timestamps={timestamps}
        mode="window"
        currentIndex={1}
        onIndexChange={() => undefined}
        windowStart={0}
        windowEnd={2}
        onWindowChange={() => undefined}
        isPlaying={false}
        onPlayingChange={() => undefined}
      />
    );
    expect(screen.getByLabelText("Window start")).toBeInTheDocument();
    expect(screen.getByLabelText("Window end")).toBeInTheDocument();
  });
});
