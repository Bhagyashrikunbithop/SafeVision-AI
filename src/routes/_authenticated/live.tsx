import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { Play, Save, Square } from "lucide-react";
import { analyzeFrame, type AnalysisResult } from "@/lib/api";
import { saveAnalysis } from "@/lib/analyses";
import { CameraView } from "@/components/CameraView";
import { AnalysisSummary } from "@/components/AnalysisSummary";
import { DetectionResults } from "@/components/DetectionResults";
import { ViolationCard } from "@/components/ViolationCard";
import { ErrorMessage, InfoMessage, SuccessMessage } from "@/components/Alert";
import { CLASS_BOX_COLORS, classLabel, helmetState } from "@/lib/detection";

export const Route = createFileRoute("/_authenticated/live")({
  head: () => ({
    meta: [
      { title: "Live Detection – SafeVision AI" },
      {
        name: "description",
        content:
          "Use your device camera for continuous helmet violation and number-plate monitoring with SafeVision AI.",
      },
      { property: "og:title", content: "Live Detection – SafeVision AI" },
      { property: "og:description", content: "Live helmet detection from your device camera." },
    ],
  }),
  component: LivePage,
});

const FRAME_INTERVAL_MS = 1200;

function LivePage() {
  const queryClient = useQueryClient();
  const videoRef = useRef<HTMLVideoElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const busyRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [savingSession, setSavingSession] = useState(false);

  const draw = useCallback((analysis: AnalysisResult) => {
    const video = videoRef.current;
    const canvas = overlayRef.current;
    if (!video || !canvas) return;
    const w = video.videoWidth || 640;
    const h = video.videoHeight || 480;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, w, h);
    ctx.lineWidth = Math.max(2, Math.round(w / 320));
    ctx.font = `${Math.max(13, Math.round(w / 44))}px sans-serif`;

    for (const box of analysis.detections) {
      const color = CLASS_BOX_COLORS[helmetState(box.className)];
      ctx.strokeStyle = color;
      ctx.strokeRect(box.x1, box.y1, box.x2 - box.x1, box.y2 - box.y1);
      const label = classLabel(box.className);
      const textWidth = ctx.measureText(label).width + 10;
      const labelHeight = Math.max(18, Math.round(w / 34));
      ctx.fillStyle = color;
      ctx.fillRect(box.x1, Math.max(0, box.y1 - labelHeight), textWidth, labelHeight);
      ctx.fillStyle = "#ffffff";
      ctx.fillText(label, box.x1 + 5, Math.max(labelHeight - 5, box.y1 - 5));
    }
  }, []);

  const captureAndSend = useCallback(async () => {
    const video = videoRef.current;
    if (!video || busyRef.current || video.readyState < 2) return;
    busyRef.current = true;
    try {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), "image/jpeg", 0.8),
      );
      if (!blob) return;
      const analysis = await analyzeFrame(blob);
      setResult(analysis);
      setError(null);
      draw(analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : "The live analysis could not continue.");
    } finally {
      busyRef.current = false;
    }
  }, [draw]);

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    const canvas = overlayRef.current;
    canvas?.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
    setRunning(false);
  }, []);

  async function start() {
    setError(null);
    setSaved(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setRunning(true);
      timerRef.current = setInterval(() => void captureAndSend(), FRAME_INTERVAL_MS);
    } catch (err) {
      console.error("[SafeVision] Camera access failed:", err);
      setError(
        "We could not access your camera. Please allow camera permission in your browser and try again.",
      );
    }
  }

  async function saveSession() {
    if (!result) return;
    setSavingSession(true);
    try {
      await saveAnalysis("live", null, result);
      await queryClient.invalidateQueries({ queryKey: ["analyses"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "We could not save this session.");
    } finally {
      setSavingSession(false);
    }
  }

  useEffect(() => stop, [stop]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
      <header>
        <span className="eyebrow">Live detection</span>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
          Live camera monitoring
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Frames from your camera are analysed continuously for helmet compliance. Save the current
          reading to your history whenever you want to keep it.
        </p>
      </header>

      <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          <CameraView ref={videoRef} running={running} overlayRef={overlayRef} />
          <div className="flex flex-wrap gap-3">
            {running ? (
              <button onClick={stop} className="btn-secondary">
                <Square className="h-4 w-4" /> Stop camera
              </button>
            ) : (
              <button onClick={start} className="btn-primary">
                <Play className="h-4 w-4" /> Start Live Detection
              </button>
            )}
            <button
              onClick={saveSession}
              disabled={!result || savingSession}
              className="btn-secondary"
            >
              <Save className="h-4 w-4" /> {savingSession ? "Saving…" : "Save to history"}
            </button>
          </div>
          {error ? <ErrorMessage>{error}</ErrorMessage> : null}
          {saved ? <SuccessMessage>Live session saved to your history.</SuccessMessage> : null}
        </div>

        <div className="space-y-5">
          {result ? (
            <>
              <AnalysisSummary totals={result} />
              <section>
                <h2 className="text-lg font-bold tracking-tight">Current violations</h2>
                <div className="mt-3">
                  {result.violations.length === 0 ? (
                    <InfoMessage>No helmet violations in the current view.</InfoMessage>
                  ) : (
                    <div className="space-y-3">
                      {result.violations.map((v, i) => (
                        <ViolationCard key={`${v.trackingId ?? "v"}-${i}`} violation={v} />
                      ))}
                    </div>
                  )}
                </div>
              </section>
              <section>
                <h2 className="text-lg font-bold tracking-tight">Detected objects</h2>
                <div className="mt-3">
                  <DetectionResults detections={result.detections} />
                </div>
              </section>
            </>
          ) : (
            <InfoMessage>
              Start the camera to begin live helmet and number-plate detection.
            </InfoMessage>
          )}
        </div>
      </div>
    </div>
  );
}
