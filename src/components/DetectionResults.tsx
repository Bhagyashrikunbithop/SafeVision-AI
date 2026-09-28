import { classLabel, helmetToneClass } from "@/lib/detection";
import type { DetectionBox } from "@/lib/api";

/**
 * Lists the detected objects. Confidence values stay internal — never rendered.
 */
export function DetectionResults({ detections }: { detections: DetectionBox[] }) {
  if (detections.length === 0) {
    return (
      <section className="surface-card p-5">
        <h2 className="text-base font-bold tracking-tight">Detected objects</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Nothing was detected in this input. Try a clearer view of the rider and the bike.
        </p>
      </section>
    );
  }

  const grouped = detections.reduce<Record<string, number>>((acc, d) => {
    acc[d.className] = (acc[d.className] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <section className="surface-card p-5">
      <h2 className="text-base font-bold tracking-tight">Detected objects</h2>
      <ul className="mt-4 space-y-2">
        {Object.entries(grouped)
          .sort((a, b) => b[1] - a[1])
          .map(([className, count]) => (
            <li
              key={className}
              className="flex items-center justify-between gap-3 rounded-xl border border-border bg-secondary/40 px-3.5 py-2.5"
            >
              <span className="flex min-w-0 items-center gap-2.5">
                <span
                  className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full border ${helmetToneClass(
                    className,
                  )}`}
                  aria-hidden
                />
                <span className="truncate text-sm font-medium">{classLabel(className)}</span>
              </span>
              <span className="shrink-0 rounded-lg bg-card px-2.5 py-1 text-xs font-bold tabular-nums text-foreground">
                × {count}
              </span>
            </li>
          ))}
      </ul>
    </section>
  );
}
