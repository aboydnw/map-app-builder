import { useState, useCallback, useRef, useEffect } from "react";
import type { ConversionJobState, StageInfo, JobStatus } from "../types";
import { config } from "../config";

const STAGE_NAMES = ["Scanning", "Converting", "Validating", "Ingesting", "Ready"];
const STATUS_ORDER: JobStatus[] = ["scanning", "converting", "validating", "ingesting", "ready"];

function buildInitialStages(): StageInfo[] {
  return STAGE_NAMES.map((name) => ({ name, status: "pending" as const }));
}

function updateStages(status: JobStatus, error?: string): StageInfo[] {
  const idx = STATUS_ORDER.indexOf(status);
  return STAGE_NAMES.map((name, i) => {
    if (status === "failed") {
      if (i < idx) return { name, status: "done" as const };
      if (i === idx || (idx === -1 && i === 0))
        return { name, status: "error" as const, detail: error };
      return { name, status: "pending" as const };
    }
    if (i < idx) return { name, status: "done" as const };
    if (i === idx) return { name, status: "active" as const };
    return { name, status: "pending" as const };
  });
}

export function useConversionJob() {
  const [state, setState] = useState<ConversionJobState>({
    jobId: null,
    status: "pending",
    datasetId: null,
    error: null,
    stages: buildInitialStages(),
  });

  const esRef = useRef<EventSource | null>(null);
  const datasetIdRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      esRef.current?.close();
    };
  }, []);

  const connectSSE = useCallback((jobId: string) => {
    const es = new EventSource(`${config.apiBase}/api/jobs/${jobId}/stream`);
    esRef.current = es;

    es.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const status: JobStatus = data.status;

      setState((prev) => ({
        ...prev,
        status,
        error: data.error || null,
        datasetId: status === "ready" ? datasetIdRef.current : prev.datasetId,
        stages: updateStages(status, data.error),
      }));

      if (status === "ready" || status === "failed") {
        es.close();
      }
    };

    es.onerror = () => {
      // EventSource handles reconnection automatically
    };
  }, []);

  const startUpload = useCallback(
    async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const resp = await fetch(`${config.apiBase}/api/upload`, {
        method: "POST",
        body: formData,
      });

      if (!resp.ok) {
        const detail = await resp.json().catch(() => ({ detail: "Upload failed" }));
        setState((prev) => ({
          ...prev,
          status: "failed",
          error: detail.detail || "Upload failed",
          stages: updateStages("failed", detail.detail),
        }));
        return;
      }

      const { job_id, dataset_id } = await resp.json();
      datasetIdRef.current = dataset_id;
      setState((prev) => ({
        ...prev,
        jobId: job_id,
        datasetId: null,
        status: "pending",
        error: null,
        stages: buildInitialStages(),
      }));
      connectSSE(job_id);
    },
    [connectSSE],
  );

  const startUrlFetch = useCallback(
    async (url: string) => {
      const resp = await fetch(`${config.apiBase}/api/convert-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!resp.ok) {
        const detail = await resp.json().catch(() => ({ detail: "Fetch failed" }));
        setState((prev) => ({
          ...prev,
          status: "failed",
          error: detail.detail || "Fetch failed",
          stages: updateStages("failed", detail.detail),
        }));
        return;
      }

      const { job_id, dataset_id } = await resp.json();
      datasetIdRef.current = dataset_id;
      setState((prev) => ({
        ...prev,
        jobId: job_id,
        datasetId: null,
        status: "pending",
        error: null,
        stages: buildInitialStages(),
      }));
      connectSSE(job_id);
    },
    [connectSSE],
  );

  return { state, startUpload, startUrlFetch };
}
