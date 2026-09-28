import { Bike, Clock, Hash, TriangleAlert } from "lucide-react";
import { classLabel, helmetStatusLabel, helmetToneClass } from "@/lib/detection";
import { NumberPlateResult } from "./NumberPlateResult";
import type { PlateStatus } from "@/lib/api";

export type ViolationCardData = {
  helmetStatus: string;
  vehicleType: string;
  numberPlate: string | null;
  numberPlateStatus: PlateStatus;
  trackingId: string | null;
  firstDetectedAt: string | null;
  lastDetectedAt: string | null;
};

function timeLabel(value: string | null) {
  if (!value) return null;
  const asNumber = Number(value);
  if (Number.isFinite(asNumber) && !value.includes("-")) {
    const seconds = asNumber;
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${String(secs).padStart(2, "0")}`;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toLocaleTimeString();
}

export function ViolationCard({ violation }: { violation: ViolationCardData }) {
  const first = timeLabel(violation.firstDetectedAt);
  const last = timeLabel(violation.lastDetectedAt);

  return (
    <article className="surface-card p-4 sm:p-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-lg border border-violation/30 bg-violation/10 px-2.5 py-1 text-xs font-bold text-violation">
          <TriangleAlert className="h-3.5 w-3.5" /> Helmet violation
        </span>
        <span
          className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold ${helmetToneClass(
            violation.helmetStatus,
          )}`}
        >
          {helmetStatusLabel(violation.helmetStatus)}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground">
          <Bike className="h-3.5 w-3.5" /> {violation.vehicleType || "bike"}
        </span>
      </div>

      <p className="mt-3 text-sm font-semibold text-foreground">
        {classLabel(violation.helmetStatus)}
      </p>

      <div className="mt-3">
        <NumberPlateResult
          plate={violation.numberPlate}
          status={violation.numberPlateStatus}
          compact
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-muted-foreground">
        {violation.trackingId ? (
          <span className="inline-flex items-center gap-1.5">
            <Hash className="h-3.5 w-3.5" /> Tracking ID {violation.trackingId}
          </span>
        ) : null}
        {first ? (
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" /> First seen {first}
          </span>
        ) : null}
        {last && last !== first ? (
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" /> Last seen {last}
          </span>
        ) : null}
      </div>
    </article>
  );
}
