import { ScanLine } from "lucide-react";
import type { PlateStatus } from "@/lib/api";

export function NumberPlateResult({
  plate,
  status,
  compact = false,
}: {
  plate: string | null;
  status: PlateStatus;
  compact?: boolean;
}) {
  const readable = status === "READABLE" && Boolean(plate);

  return (
    <div
      className={`flex items-center gap-3 rounded-xl border px-3.5 ${compact ? "py-2" : "py-3"} ${
        readable
          ? "border-success/30 bg-success/8"
          : "border-warning/35 bg-warning/10"
      }`}
    >
      <span
        className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${
          readable ? "bg-success/15 text-success" : "bg-warning/20 text-warning"
        }`}
      >
        <ScanLine className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
          Number plate
        </p>
        {readable ? (
          <p className="truncate font-mono text-base font-bold tracking-[0.12em] text-foreground">
            {plate}
          </p>
        ) : (
          <p className="text-sm font-semibold text-foreground">Number plate not readable</p>
        )}
      </div>
    </div>
  );
}
