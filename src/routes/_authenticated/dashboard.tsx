import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Bike,
  Camera,
  ClipboardList,
  Image as ImageIcon,
  ScanLine,
  ShieldAlert,
  Video,
} from "lucide-react";
import { fetchAnalyses, fetchDashboardStats } from "@/lib/analyses";
import { StatCard } from "@/components/StatCard";
import { DetectionCard } from "@/components/DetectionCard";
import { EmptyState, ErrorMessage } from "@/components/Alert";
import { useAuth } from "@/hooks/useAuth";
import featureLive from "@/assets/feature-live.jpg";
import featureImage from "@/assets/feature-image.jpg";
import featureVideo from "@/assets/feature-video.jpg";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard – SafeVision AI" },
      {
        name: "description",
        content:
          "Your SafeVision AI dashboard: analyses run, helmet violations found and number plates read.",
      },
      { property: "og:title", content: "Dashboard – SafeVision AI" },
      { property: "og:description", content: "Your SafeVision AI detection overview." },
    ],
  }),
  component: DashboardPage,
});

const TYPE_LABEL = { image: "Image", video: "Video", live: "Live" } as const;

function DashboardPage() {
  const { user } = useAuth();
  const name = (user?.user_metadata?.["full_name"] as string | undefined)?.split(" ")[0];

  const stats = useQuery({ queryKey: ["dashboard-stats"], queryFn: fetchDashboardStats });
  const recent = useQuery({
    queryKey: ["analyses", "recent"],
    queryFn: () => fetchAnalyses("all", 5),
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
      <header>
        <span className="eyebrow">Dashboard</span>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
          {name ? `Welcome back, ${name}` : "Welcome back"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          An overview of everything SafeVision AI has analysed on your account.
        </p>
      </header>

      {stats.isError ? (
        <div className="mt-6">
          <ErrorMessage>{(stats.error as Error).message}</ErrorMessage>
        </div>
      ) : null}

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={ClipboardList}
          label="Analyses run"
          value={stats.data?.totalAnalyses ?? 0}
          hint="Images, videos and live sessions"
          tone="indigo"
          loading={stats.isLoading}
        />
        <StatCard
          icon={ShieldAlert}
          label="Helmet violations"
          value={stats.data?.noHelmetViolations ?? 0}
          hint="Riders detected without a helmet"
          tone="red"
          loading={stats.isLoading}
        />
        <StatCard
          icon={Bike}
          label="Bikes detected"
          value={stats.data?.bikesDetected ?? 0}
          hint="Across all your analyses"
          tone="teal"
          loading={stats.isLoading}
        />
        <StatCard
          icon={ScanLine}
          label="Plates read"
          value={stats.data?.readablePlates ?? 0}
          hint="Number plates that were legible"
          tone="green"
          loading={stats.isLoading}
        />
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-bold tracking-tight">Run a new analysis</h2>
        <div className="mt-5 grid gap-5 md:grid-cols-3">
          <DetectionCard
            icon={Camera}
            badge="Live"
            title="Live Detection"
            description="Monitor helmet compliance continuously with your device camera."
            image={featureLive}
            imageAlt="Traffic monitoring camera above a road"
            cta="Start Live Detection"
            to="/live"
          />
          <DetectionCard
            icon={ImageIcon}
            badge="Image"
            title="Image Detection"
            description="Upload a traffic photo and review riders, helmets and plates."
            image={featureImage}
            imageAlt="Busy urban road with motorbike riders"
            cta="Analyze Image"
            to="/image"
          />
          <DetectionCard
            icon={Video}
            badge="Video"
            title="Video Detection"
            description="Analyse a recorded clip with violation tracking across frames."
            image={featureVideo}
            imageAlt="City traffic at dusk"
            cta="Analyze Video"
            to="/video"
          />
        </div>
      </section>

      <section className="mt-12">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold tracking-tight">Recent analyses</h2>
          <Link to="/history" className="text-sm font-semibold text-primary hover:underline">
            View full history
          </Link>
        </div>

        <div className="mt-4">
          {recent.isLoading ? (
            <div className="surface-card space-y-3 p-5">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-12 animate-pulse rounded-lg bg-secondary" />
              ))}
            </div>
          ) : recent.isError ? (
            <ErrorMessage>{(recent.error as Error).message}</ErrorMessage>
          ) : (recent.data?.length ?? 0) === 0 ? (
            <EmptyState
              title="No analyses yet"
              description="Run your first image, video or live analysis and it will appear here."
              action={
                <Link to="/image" className="btn-primary">
                  Analyze an image
                </Link>
              }
            />
          ) : (
            <ul className="surface-card divide-y divide-border">
              {recent.data!.map((row) => (
                <li key={row.id} className="flex flex-wrap items-center gap-3 px-5 py-4">
                  <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-primary">
                    {TYPE_LABEL[row.type]}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold">
                    {row.original_file_name ?? "Live camera session"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(row.created_at).toLocaleString()}
                  </span>
                  <span className="text-xs font-semibold text-violation">
                    {row.violation_count} violation{row.violation_count === 1 ? "" : "s"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
