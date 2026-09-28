/**
 * Central client for the SafeVision AI FastAPI service.
 *
 * The service URL comes from the VITE_AI_SERVICE_URL environment variable.
 * A localhost default is only used during local development — production
 * builds must set VITE_AI_SERVICE_URL to the deployed FastAPI URL.
 */

const configured = (import.meta.env["VITE_AI_SERVICE_URL"] as string | undefined)?.trim();
const isDev = Boolean(import.meta.env.DEV);

export const AI_SERVICE_URL = configured || (isDev ? "http://127.0.0.1:8000" : "");

export const SERVICE_UNCONFIGURED_MESSAGE =
  "The AI detection service is not configured yet. Set VITE_AI_SERVICE_URL to your deployed FastAPI service URL.";

export const SERVICE_DOWN_MESSAGE =
  "Cannot reach the AI detection service right now. Please try again in a moment.";

export type PlateStatus = "READABLE" | "NOT_READABLE";

export type DetectionBox = {
  className: string;
  confidence: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  trackingId: string | null;
};

export type ViolationResult = {
  vehicleType: string;
  helmetStatus: string;
  numberPlate: string | null;
  numberPlateStatus: PlateStatus;
  numberPlateConfidence: number | null;
  detectionConfidence: number | null;
  trackingId: string | null;
  firstDetectedAt: string | null;
  lastDetectedAt: string | null;
};

export type AnalysisTotals = {
  totalObjects: number;
  helmetCount: number;
  noHelmetCount: number;
  bikeCount: number;
  numberPlateCount: number;
  readablePlateCount: number;
  violationCount: number;
};

export type AnalysisResult = AnalysisTotals & {
  analysisId: string | null;
  detections: DetectionBox[];
  violations: ViolationResult[];
  width: number | null;
  height: number | null;
  annotatedImage: string | null;
  annotatedVideoUrl: string | null;
  framesProcessed: number | null;
};

type RawDetection = {
  class_name?: string;
  className?: string;
  confidence?: number;
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  tracking_id?: string | number | null;
};

type RawViolation = {
  vehicle_type?: string;
  helmet_status?: string;
  number_plate?: string | null;
  number_plate_status?: string | null;
  number_plate_confidence?: number | null;
  detection_confidence?: number | null;
  tracking_id?: string | number | null;
  first_detected_at?: string | null;
  last_detected_at?: string | null;
};

type RawResult = {
  analysis_id?: string;
  detections?: RawDetection[];
  violations?: RawViolation[];
  summary?: Record<string, number>;
  width?: number;
  height?: number;
  annotated_image?: string | null;
  annotated_video?: string | null;
  frames_processed?: number | null;
};

function num(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function normalizeDetection(raw: RawDetection): DetectionBox {
  return {
    className: String(raw.class_name ?? raw.className ?? "unknown"),
    confidence: num(raw.confidence),
    x1: num(raw.x1),
    y1: num(raw.y1),
    x2: num(raw.x2),
    y2: num(raw.y2),
    trackingId: raw.tracking_id == null ? null : String(raw.tracking_id),
  };
}

function normalizeViolation(raw: RawViolation): ViolationResult {
  const plate = raw.number_plate?.trim() ? raw.number_plate.trim() : null;
  const status: PlateStatus =
    plate && raw.number_plate_status !== "NOT_READABLE" ? "READABLE" : "NOT_READABLE";
  return {
    vehicleType: raw.vehicle_type?.trim() || "bike",
    helmetStatus: raw.helmet_status?.trim() || "driver_without_helmet",
    numberPlate: status === "READABLE" ? plate : null,
    numberPlateStatus: status,
    numberPlateConfidence: raw.number_plate_confidence ?? null,
    detectionConfidence: raw.detection_confidence ?? null,
    trackingId: raw.tracking_id == null ? null : String(raw.tracking_id),
    firstDetectedAt: raw.first_detected_at ?? null,
    lastDetectedAt: raw.last_detected_at ?? null,
  };
}

function absoluteUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return `${AI_SERVICE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

function normalizeResult(raw: RawResult): AnalysisResult {
  const detections = (raw.detections ?? []).map(normalizeDetection);
  const violations = (raw.violations ?? []).map(normalizeViolation);
  const summary = raw.summary ?? {};

  const readablePlates = violations.filter((v) => v.numberPlateStatus === "READABLE").length;

  return {
    analysisId: raw.analysis_id ?? null,
    detections,
    violations,
    width: raw.width ?? null,
    height: raw.height ?? null,
    annotatedImage: raw.annotated_image ?? null,
    annotatedVideoUrl: absoluteUrl(raw.annotated_video),
    framesProcessed: raw.frames_processed ?? null,
    totalObjects: num(summary["total_objects"]) || detections.length,
    helmetCount: num(summary["helmet_count"]),
    noHelmetCount: num(summary["no_helmet_count"]),
    bikeCount: num(summary["bike_count"]),
    numberPlateCount: num(summary["number_plate_count"]),
    readablePlateCount: num(summary["readable_plate_count"]) || readablePlates,
    violationCount: num(summary["violation_count"]) || violations.length,
  };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!AI_SERVICE_URL) throw new Error(SERVICE_UNCONFIGURED_MESSAGE);
  let res: Response;
  try {
    res = await fetch(`${AI_SERVICE_URL}${path}`, init);
  } catch {
    throw new Error(SERVICE_DOWN_MESSAGE);
  }
  if (!res.ok) {
    let message = "The AI service could not process this request. Please try again.";
    try {
      const body = (await res.json()) as { detail?: string };
      if (typeof body?.detail === "string" && body.detail.length < 300) message = body.detail;
    } catch {
      /* keep the friendly default */
    }
    throw new Error(message);
  }
  return (await res.json()) as T;
}

export async function checkHealth(): Promise<boolean> {
  if (!AI_SERVICE_URL) return false;
  try {
    const res = await fetch(`${AI_SERVICE_URL}/health`);
    return res.ok;
  } catch {
    return false;
  }
}

export async function analyzeImage(file: File): Promise<AnalysisResult> {
  const fd = new FormData();
  fd.append("file", file);
  return normalizeResult(await request<RawResult>("/api/analyze-image", { method: "POST", body: fd }));
}

export async function analyzeVideo(file: File): Promise<AnalysisResult> {
  const fd = new FormData();
  fd.append("file", file);
  return normalizeResult(await request<RawResult>("/api/analyze-video", { method: "POST", body: fd }));
}

export async function analyzeFrame(blob: Blob): Promise<AnalysisResult> {
  const fd = new FormData();
  fd.append("file", blob, "frame.jpg");
  return normalizeResult(await request<RawResult>("/api/analyze-frame", { method: "POST", body: fd }));
}

export async function getResults(analysisId: string): Promise<AnalysisResult> {
  return normalizeResult(await request<RawResult>(`/api/results/${encodeURIComponent(analysisId)}`));
}
