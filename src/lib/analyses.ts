import { supabase } from "@/integrations/supabase/client";
import type { AnalysisResult } from "@/lib/api";

export type AnalysisType = "image" | "video" | "live";

export type AnalysisRow = {
  id: string;
  type: AnalysisType;
  original_file_name: string | null;
  status: "processing" | "completed" | "failed";
  total_objects: number;
  helmet_count: number;
  no_helmet_count: number;
  bike_count: number;
  number_plate_count: number;
  readable_plate_count: number;
  violation_count: number;
  created_at: string;
};

export type ViolationRow = {
  id: string;
  analysis_id: string;
  vehicle_type: string;
  helmet_status: string;
  number_plate: string | null;
  number_plate_status: "READABLE" | "NOT_READABLE";
  source: AnalysisType;
  tracking_id: string | null;
  first_detected_at: string | null;
  last_detected_at: string | null;
  created_at: string;
};

export type DashboardStats = {
  totalAnalyses: number;
  totalViolations: number;
  noHelmetViolations: number;
  bikesDetected: number;
  readablePlates: number;
};

const ANALYSIS_COLUMNS =
  "id, type, original_file_name, status, total_objects, helmet_count, no_helmet_count, bike_count, number_plate_count, readable_plate_count, violation_count, created_at";

export const DB_ERROR_MESSAGE =
  "We could not reach your SafeVision AI data right now. Please check your connection and try again.";

function fail(error: unknown): never {
  console.error("[SafeVision] Supabase error:", error);
  throw new Error(DB_ERROR_MESSAGE);
}

/** Saves a completed analysis together with its detections and violations. */
export async function saveAnalysis(
  type: AnalysisType,
  fileName: string | null,
  result: AnalysisResult,
): Promise<string> {
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id;
  if (!userId) throw new Error("Your session has expired. Please log in again.");

  const { data: analysis, error } = await supabase
    .from("analyses")
    .insert({
      user_id: userId,
      type,
      original_file_name: fileName,
      status: "completed",
      total_objects: result.totalObjects,
      helmet_count: result.helmetCount,
      no_helmet_count: result.noHelmetCount,
      bike_count: result.bikeCount,
      number_plate_count: result.numberPlateCount,
      readable_plate_count: result.readablePlateCount,
      violation_count: result.violationCount,
    })
    .select("id")
    .single();

  if (error || !analysis) fail(error);

  if (result.detections.length > 0) {
    const { error: detError } = await supabase.from("detections").insert(
      result.detections.slice(0, 500).map((d) => ({
        analysis_id: analysis.id,
        user_id: userId,
        class_name: d.className,
        confidence: d.confidence,
        x1: d.x1,
        y1: d.y1,
        x2: d.x2,
        y2: d.y2,
        tracking_id: d.trackingId,
      })),
    );
    if (detError) console.error("[SafeVision] Could not store detections:", detError);
  }

  if (result.violations.length > 0) {
    const { error: vioError } = await supabase.from("violations").insert(
      result.violations.map((v) => ({
        user_id: userId,
        analysis_id: analysis.id,
        vehicle_type: v.vehicleType,
        helmet_status: v.helmetStatus,
        number_plate: v.numberPlateStatus === "READABLE" ? v.numberPlate : null,
        number_plate_status: v.numberPlateStatus,
        number_plate_confidence: v.numberPlateConfidence,
        detection_confidence: v.detectionConfidence,
        source: type,
        tracking_id: v.trackingId,
        first_detected_at: v.firstDetectedAt,
        last_detected_at: v.lastDetectedAt,
      })),
    );
    if (vioError) console.error("[SafeVision] Could not store violations:", vioError);
  }

  return analysis.id;
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const [analyses, violations] = await Promise.all([
    supabase.from("analyses").select("bike_count, readable_plate_count, violation_count"),
    supabase.from("violations").select("helmet_status"),
  ]);

  if (analyses.error) fail(analyses.error);
  if (violations.error) fail(violations.error);

  const rows = analyses.data ?? [];
  return {
    totalAnalyses: rows.length,
    totalViolations: violations.data?.length ?? 0,
    noHelmetViolations: (violations.data ?? []).filter((v) =>
      String(v.helmet_status).includes("without"),
    ).length,
    bikesDetected: rows.reduce((sum, r) => sum + (r.bike_count ?? 0), 0),
    readablePlates: rows.reduce((sum, r) => sum + (r.readable_plate_count ?? 0), 0),
  };
}

export async function fetchAnalyses(
  type: AnalysisType | "all" = "all",
  limit = 50,
): Promise<AnalysisRow[]> {
  let query = supabase
    .from("analyses")
    .select(ANALYSIS_COLUMNS)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (type !== "all") query = query.eq("type", type);

  const { data, error } = await query;
  if (error) fail(error);
  return (data ?? []) as AnalysisRow[];
}

export async function fetchViolations(analysisId: string): Promise<ViolationRow[]> {
  const { data, error } = await supabase
    .from("violations")
    .select(
      "id, analysis_id, vehicle_type, helmet_status, number_plate, number_plate_status, source, tracking_id, first_detected_at, last_detected_at, created_at",
    )
    .eq("analysis_id", analysisId)
    .order("created_at", { ascending: true });
  if (error) fail(error);
  return (data ?? []) as ViolationRow[];
}

export type ProfileRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  created_at: string;
};

export async function fetchProfile(userId: string): Promise<ProfileRow | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, created_at")
    .eq("id", userId)
    .maybeSingle();
  if (error) fail(error);
  return (data as ProfileRow | null) ?? null;
}

export async function updateProfileName(userId: string, fullName: string): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .upsert({ id: userId, full_name: fullName })
    .eq("id", userId);
  if (error) fail(error);
}
