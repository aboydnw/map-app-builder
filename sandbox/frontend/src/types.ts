export type DatasetType = "raster" | "vector";

export type JobStatus =
  | "pending"
  | "scanning"
  | "converting"
  | "validating"
  | "ingesting"
  | "ready"
  | "failed";

export interface ValidationCheck {
  name: string;
  passed: boolean;
  detail: string;
}

export interface Credit {
  tool: string;
  url: string;
  role: string;
}

export interface Dataset {
  id: string;
  filename: string;
  dataset_type: DatasetType;
  format_pair: string;
  tile_url: string;
  bounds: [number, number, number, number] | null;
  band_count: number | null;
  original_file_size: number | null;
  converted_file_size: number | null;
  geoparquet_file_size: number | null;
  feature_count: number | null;
  geometry_types: string[] | null;
  min_zoom: number | null;
  max_zoom: number | null;
  stac_collection_id: string | null;
  pg_table: string | null;
  validation_results: ValidationCheck[];
  credits: Credit[];
  created_at: string;
}

export interface StageInfo {
  name: string;
  status: "pending" | "active" | "done" | "error";
  detail?: string;
}

export interface ConversionJobState {
  jobId: string | null;
  status: JobStatus;
  datasetId: string | null;
  error: string | null;
  stages: StageInfo[];
}
