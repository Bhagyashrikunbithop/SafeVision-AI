import { Bike, Layers, ScanLine, ShieldCheck, ShieldOff, TriangleAlert } from "lucide-react";
import type { AnalysisTotals } from "@/lib/api";

type Tone = "indigo" | "teal" | "green" | "amber" | "red";

const TONES: Record<Tone, string> = {
  indigo: "bg-primary/10 text-primary",
  teal: "bg-accent/12 text-accent",
  green: "bg-success/12 text-success",
  amber: "bg-warning/18 text-warning",
  red: "bg-violation/12 text-violation",
};

function Tile({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Bike;
  label: string;
  value: number;
  tone: Tone;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <span className={`grid h-9 w-9 place-items-center rounded-lg ${TONES[tone]}`}>
        <Icon className="h-[18px] w-[18px]" />
      </span>
      <p className="mt-3 text-2xl font-extrabold tracking-tight tabular-nums">{value}</p>
      <p className="mt-0.5 text-xs font-medium text-muted-foreground">{label}</p>
    </div>
  );
}

export function AnalysisSummary({ totals }: { totals: AnalysisTotals }) {
  return (
    <section className="surface-card p-5">
      <h2 className="text-base font-bold tracking-tight">Analysis summary</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        A count of everything SafeVision AI identified in this input.
      </p>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Tile icon={Layers} label="Objects detected" value={totals.totalObjects} tone="indigo" />
        <Tile icon={Bike} label="Bikes detected" value={totals.bikeCount} tone="teal" />
        <Tile icon={ShieldCheck} label="Riders with helmet" value={totals.helmetCount} tone="green" />
        <Tile icon={ShieldOff} label="Riders without helmet" value={totals.noHelmetCount} tone="red" />
        <Tile icon={TriangleAlert} label="Violations" value={totals.violationCount} tone="amber" />
        <Tile
          icon={ScanLine}
          label="Readable number plates"
          value={totals.readablePlateCount}
          tone="green"
        />
      </div>
    </section>
  );
}
