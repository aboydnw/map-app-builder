import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useAnimationExport } from "./useAnimationExport";

class MockMediaRecorder {
  state = "inactive" as "inactive" | "recording" | "paused";
  ondataavailable: ((event: { data: Blob }) => void) | null = null;
  onstop: (() => void) | null = null;

  start() {
    this.state = "recording";
  }

  stop() {
    this.state = "inactive";
    this.ondataavailable?.({ data: new Blob(["test"], { type: "video/webm" }) });
    this.onstop?.();
  }
}

function createMockCanvas() {
  const canvas = document.createElement("canvas");
  Object.defineProperty(canvas, "captureStream", {
    value: vi.fn(() => new MediaStream()),
    writable: true
  });
  return canvas;
}

describe("useAnimationExport", () => {
  beforeEach(() => {
    vi.stubGlobal("MediaStream", class MockMediaStream {});
    vi.stubGlobal("MediaRecorder", MockMediaRecorder);
    vi.stubGlobal("URL", {
      createObjectURL: vi.fn(() => "blob:mock-url"),
      revokeObjectURL: vi.fn()
    });
  });

  it("starts in idle state", () => {
    const canvas = createMockCanvas();
    const ref = { current: canvas };

    const { result } = renderHook(() =>
      useAnimationExport({ canvasRef: ref, totalFrames: 10, fps: 2 })
    );

    expect(result.current.isExporting).toBe(false);
    expect(result.current.progress).toBe(0);
  });

  it("transitions to exporting state on startExport", () => {
    const canvas = createMockCanvas();
    const ref = { current: canvas };

    const { result } = renderHook(() =>
      useAnimationExport({ canvasRef: ref, totalFrames: 10, fps: 2 })
    );

    act(() => {
      result.current.startExport();
    });

    expect(result.current.isExporting).toBe(true);
  });

  it("does nothing when canvas ref is null", () => {
    const ref = { current: null };

    const { result } = renderHook(() =>
      useAnimationExport({ canvasRef: ref, totalFrames: 10, fps: 2 })
    );

    act(() => {
      result.current.startExport();
    });

    expect(result.current.isExporting).toBe(false);
  });

  it("resets state on cancelExport", () => {
    const canvas = createMockCanvas();
    const ref = { current: canvas };

    const { result } = renderHook(() =>
      useAnimationExport({ canvasRef: ref, totalFrames: 10, fps: 2 })
    );

    act(() => {
      result.current.startExport();
    });

    expect(result.current.isExporting).toBe(true);

    act(() => {
      result.current.cancelExport();
    });

    expect(result.current.isExporting).toBe(false);
    expect(result.current.progress).toBe(0);
  });

  it("does not start a second export while already exporting", () => {
    const canvas = createMockCanvas();
    const ref = { current: canvas };

    const { result } = renderHook(() =>
      useAnimationExport({ canvasRef: ref, totalFrames: 10, fps: 2 })
    );

    act(() => {
      result.current.startExport();
    });

    const captureStreamCalls = (canvas.captureStream as ReturnType<typeof vi.fn>).mock.calls.length;

    act(() => {
      result.current.startExport();
    });

    expect((canvas.captureStream as ReturnType<typeof vi.fn>).mock.calls.length).toBe(captureStreamCalls);
  });
});
