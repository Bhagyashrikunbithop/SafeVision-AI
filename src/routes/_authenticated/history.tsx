import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { fetchAnalyses, fetchViolations, type AnalysisType } from "@/lib/analyses";
import { EmptyState, ErrorMessage, InfoMessage } from "@/components/Alert";
import { ViolationCard } from "@/components/ViolationCard";

export const Route = createFileRoute("/_authenticated/history")({
  head: () => ({
    meta: [
      { title: "Detection History – SafeVision AI" },
      {
        name: "description",
        content:
          "Review your past SafeVision AI analyses with their helmet violations and number-plate results.",
      },
      { property: "og:title", content: "Detection History – SafeVision AI" },
      { property: "og:description", content: "Your saved SafeVision AI analyses and violations." },
    ],
  }),
  component: HistoryPage,
});

const FILTERS: { key: AnalysisType | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "image", label: "Image" },
  { key: "video", label: "Video" },
  { key: "live", label: "Live" },
];

const TYPE_LABEL = { image: "Image", video: "Video", live: "Live" } as const;

function HistoryPage() {
  const [filter, setFilter] = useState<AnalysisType | "all">("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const analyses = useQuery({
    queryKey: ["analyses", filter],
    queryFn: () => fetchAnalyses(filter, 100),
  });

  const violations = useQuery({
    queryKey: ["violations", openId],
    queryFn: () => fetchViolations(openId!),
    enabled: Boolean(openId),
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
      <header>
        <span className="eyebrow">History</span>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
          Detection history
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Every analysis saved to your account, with its violations and number-plate results.
        </p>
      </header>

      <div className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={
              filter === f.key
                ? "rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
                : "rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
            }
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {analyses.isLoading ? (
          <div className="surface-card space-y-3 p-5">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded-lg bg-secondary" />
            ))}
          </div>
        ) : analyses.isError ? (
          <ErrorMessage>{(analyses.error as Error).message}</ErrorMessage>
        ) : (analyses.data?.length ?? 0) === 0 ? (
          <EmptyState
            title="Nothing here yet"
            description="Analyses you run will be saved to your history automatically."
            action={
              <Link to="/image" className="btn-primary">
                Analyze an image
              </Link>
            }
          />
        ) : (
          <ul className="space-y-3">
            {analyses.data!.map((row) => {
              const open = openId === row.id;
              return (
                <li key={row.id} className="surface-card overflow-hidden">
                  <button
                    onClick={() => setOpenId(open ? null : row.id)}
                    aria-expanded={open}
                    className="flex w-full flex-wrap items-center gap-3 px-5 py-4 text-left"
                  >
                    <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-primary">
                      {TYPE_LABEL[row.type]}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold">
                        {row.original_file_name ?? "Live camera session"}
                      </span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {new Date(row.created_at).toLocaleString()} · {row.bike_count} bike
                        {row.bike_count === 1 ? "" : "s"} · {row.readable_plate_count} plate
                        {row.readable_plate_count === 1 ? "" : "s"} read
                      </span>
                    </span>
                    <span className="text-xs font-bold text-violation">
                      {row.violation_count} violation{row.violation_count === 1 ? "" : "s"}
                    </span>
                    {open ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>

                  {open ? (
                    <div className="border-t border-border bg-secondary/40 px-5 py-4">
                      {violations.isLoading ? (
                        <div className="h-20 animate-pulse rounded-lg bg-secondary" />
                      ) : violations.isError ? (
                        <ErrorMessage>{(violations.error as Error).message}</ErrorMessage>
                      ) : (violations.data?.length ?? 0) === 0 ? (
                        <InfoMessage>
                          No helmet violations were recorded for this analysis.
                        </InfoMessage>
                      ) : (
                        <div className="grid gap-3 sm:grid-cols-2">
                          {violations.data!.map((v) => (
                            <ViolationCard
                              key={v.id}
                              violation={{
                                helmetStatus: v.helmet_status,
                                vehicleType: v.vehicle_type,
                                numberPlate: v.number_plate,
                                numberPlateStatus: v.number_plate_status,
                                trackingId: v.tracking_id,
                                firstDetectedAt: v.first_detected_at,
                                lastDetectedAt: v.last_detected_at,
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
