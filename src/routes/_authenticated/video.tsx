import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ScanLine } from "lucide-react";
import { analyzeVideo, type AnalysisResult } from "@/lib/api";
import { saveAnalysis } from "@/lib/analyses";
import { UploadBox } from "@/components/UploadBox";
import { AnalysisSummary } from "@/components/AnalysisSummary";
import { ViolationCard } from "@/components/ViolationCard";
import { ErrorMessage, InfoMessage, SuccessMessage, WarningMessage } from "@/components/Alert";

export const Route = createFileRoute("/_authenticated/video")({
  head: () => ({
    meta: [
      { title: "Video Detection – SafeVision AI" },
      {
        name: "description",
        content:
          "Upload a traffic video to detect helmet violations frame by frame with number-plate identification.",
      },
      { property: "og:title", content: "Video Detection – SafeVision AI" },
      { property: "og:description", content: "Detect helmet violations in a traffic video." },
    ],
  }),
  component: VideoPage,
});

function VideoPage() {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function pick(candidate: File) {
    setError(null);
    setResult(null);
    setSaved(false);
    setFile(candidate);
  }

  async function run() {
    if (!file) return;
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      const analysis = await analyzeVideo(file);
      setResult(analysis);
      try {
        await saveAnalysis("video", file.name, analysis);
        await queryClient.invalidateQueries({ queryKey: ["analyses"] });
        await queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
        setSaved(true);
      } catch (saveErr) {
        console.error("[SafeVision] Could not save analysis:", saveErr);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "The analysis could not be completed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
      <header>
        <span className="eyebrow">Video detection</span>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
          Analyze a traffic video
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Each frame is analysed and riders are tracked across the clip, so every rider is reported
          once with the number plate of the bike they were riding.
        </p>
      </header>

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <section className="space-y-4">
          <UploadBox
            accept="video/*"
            extensions={[".mp4", ".mov", ".avi", ".mkv", ".webm"]}
            maxSizeMb={100}
            hint="MP4, MOV, AVI, MKV or WEBM up to 100 MB"
            file={file}
            disabled={busy}
            onFile={pick}
            onError={setError}
          />
          {error ? <ErrorMessage>{error}</ErrorMessage> : null}
          <button onClick={run} disabled={!file || busy} className="btn-primary w-full">
            <ScanLine className="h-4 w-4" /> {busy ? "Analyzing video…" : "Analyze Video"}
          </button>
          {busy ? (
            <WarningMessage>
              Longer clips take a while to process. Please keep this page open.
            </WarningMessage>
          ) : null}
          {saved ? <SuccessMessage>Analysis saved to your history.</SuccessMessage> : null}
        </section>

        <section className="surface-card overflow-hidden p-3">
          {result?.annotatedVideoUrl ? (
            <video
              src={result.annotatedVideoUrl}
              controls
              className="block w-full rounded-xl bg-navy"
            />
          ) : (
            <div className="grid aspect-video place-items-center rounded-xl bg-secondary px-6 text-center">
              <p className="text-sm text-muted-foreground">
                The processed video will appear here once the analysis is finished.
              </p>
            </div>
          )}
        </section>
      </div>

      {result ? (
        <div className="mt-10 space-y-8">
          <AnalysisSummary totals={result} />
          {result.framesProcessed ? (
            <p className="text-sm text-muted-foreground">
              {result.framesProcessed} frames were analysed in this clip.
            </p>
          ) : null}

          <section>
            <h2 className="text-xl font-bold tracking-tight">Helmet violations</h2>
            <div className="mt-4">
              {result.violations.length === 0 ? (
                <InfoMessage>No helmet violations were detected in this video.</InfoMessage>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {result.violations.map((v, i) => (
                    <ViolationCard key={`${v.trackingId ?? "v"}-${i}`} violation={v} />
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
