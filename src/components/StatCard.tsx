import type { LucideIcon } from "lucide-react";

export type StatTone = "indigo" | "red" | "amber" | "teal" | "green";

const TONES: Record<StatTone, string> = {
  indigo: "bg-primary/10 text-primary",
  red: "bg-violation/12 text-violation",
  amber: "bg-warning/18 text-warning",
  teal: "bg-accent/12 text-accent",
  green: "bg-success/12 text-success",
};

export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  tone,
  loading,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  hint: string;
  tone: StatTone;
  loading?: boolean;
}) {
  return (
    <div className="surface-card p-5 transition-shadow hover:shadow-elevated">
      <div className="flex items-start justify-between gap-3">
        <span className={`grid h-10 w-10 place-items-center rounded-xl ${TONES[tone]}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-4 text-3xl font-extrabold tracking-tight tabular-nums">
        {loading ? <span className="text-muted-foreground">—</span> : value}
      </p>
      <p className="mt-1 text-sm font-semibold text-foreground">{label}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}
