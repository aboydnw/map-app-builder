import { useCallback, useRef, useState } from "react";

export interface UseAnimationExportOptions {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  totalFrames: number;
  fps: number;
}

export interface UseAnimationExportReturn {
  isExporting: boolean;
  progress: number;
  startExport: () => void;
  cancelExport: () => void;
}

export function useAnimationExport({
  canvasRef,
  totalFrames,
  fps
}: UseAnimationExportOptions): UseAnimationExportReturn {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const frameCountRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const cleanup = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    recorderRef.current = null;
    chunksRef.current = [];
    frameCountRef.current = 0;
    setIsExporting(false);
    setProgress(0);
  }, []);

  const triggerDownload = useCallback((blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `animation-${Date.now()}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const startExport = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || isExporting) return;

    setIsExporting(true);
    setProgress(0);
    chunksRef.current = [];
    frameCountRef.current = 0;

    const stream = canvas.captureStream(fps);
    const recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
    recorderRef.current = recorder;

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      triggerDownload(blob);
      cleanup();
    };

    recorder.start();

    intervalRef.current = setInterval(() => {
      frameCountRef.current += 1;
      const currentProgress = Math.min(frameCountRef.current / totalFrames, 1);
      setProgress(currentProgress);

      if (frameCountRef.current >= totalFrames) {
        if (recorderRef.current && recorderRef.current.state === "recording") {
          recorderRef.current.stop();
        }
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    }, 1000 / fps);
  }, [canvasRef, fps, totalFrames, isExporting, cleanup, triggerDownload]);

  const cancelExport = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state === "recording") {
      recorderRef.current.stop();
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    cleanup();
  }, [cleanup]);

  return { isExporting, progress, startExport, cancelExport };
}
