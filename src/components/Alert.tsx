import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import type { ReactNode } from "react";

export function ErrorMessage({ children }: { children: ReactNode }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2.5 rounded-xl border border-violation/30 bg-violation/8 px-4 py-3 text-sm text-foreground"
    >
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-violation" />
      <span>{children}</span>
    </div>
  );
}

export function InfoMessage({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-accent/30 bg-accent/8 px-4 py-3 text-sm text-foreground">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
      <span>{children}</span>
    </div>
  );
}

export function SuccessMessage({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-foreground">
      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
      <span>{children}</span>
    </div>
  );
}

export function WarningMessage({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-warning/40 bg-warning/12 px-4 py-3 text-sm text-foreground">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
      <span>{children}</span>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="surface-card grid place-items-center px-6 py-14 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-secondary text-muted-foreground">
        <Info className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-base font-bold tracking-tight">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
