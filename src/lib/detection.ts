/**
 * Shared helpers for turning raw YOLO class names into clean UI labels.
 *
 * The trained model classes (indexes unchanged on the backend) are:
 *   driver_with_helmet, bike, driver, passenger_with_helmet,
 *   passenger, driver_without_helmet, passenger_without_helmet
 */

export const MODEL_CLASSES = [
  "driver_with_helmet",
  "bike",
  "driver",
  "passenger_with_helmet",
  "passenger",
  "driver_without_helmet",
  "passenger_without_helmet",
] as const;

const LABELS: Record<string, string> = {
  driver_with_helmet: "Driver with helmet",
  bike: "Bike",
  driver: "Driver",
  passenger_with_helmet: "Passenger with helmet",
  passenger: "Passenger",
  driver_without_helmet: "Driver without helmet",
  passenger_without_helmet: "Passenger without helmet",
};

export function classLabel(className: string): string {
  const key = className.trim().toLowerCase().replace(/[-\s]+/g, "_");
  return (
    LABELS[key] ??
    key
      .split("_")
      .filter(Boolean)
      .map((part, i) => (i === 0 ? part.charAt(0).toUpperCase() + part.slice(1) : part))
      .join(" ")
  );
}

export type HelmetState = "with_helmet" | "without_helmet" | "unknown";

export function helmetState(className: string): HelmetState {
  const key = className.toLowerCase();
  if (key.includes("without")) return "without_helmet";
  if (key.includes("with_helmet") || key.includes("with helmet")) return "with_helmet";
  return "unknown";
}

export function helmetStatusLabel(status: string): string {
  switch (helmetState(status)) {
    case "with_helmet":
      return "Helmet detected";
    case "without_helmet":
      return "No helmet";
    default:
      return "Helmet status unknown";
  }
}

/** Semantic token classes for a helmet state — never colour alone, always paired with text. */
export function helmetToneClass(status: string): string {
  switch (helmetState(status)) {
    case "with_helmet":
      return "border-success/30 bg-success/10 text-success";
    case "without_helmet":
      return "border-violation/30 bg-violation/10 text-violation";
    default:
      return "border-border bg-secondary text-muted-foreground";
  }
}

export function isBike(className: string): boolean {
  return className.toLowerCase().includes("bike");
}

export const CLASS_BOX_COLORS: Record<HelmetState, string> = {
  with_helmet: "#15803d",
  without_helmet: "#dc2626",
  unknown: "#4f46e5",
};
