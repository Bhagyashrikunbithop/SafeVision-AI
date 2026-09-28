import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Camera, ScanLine, ShieldCheck } from "lucide-react";
import heroRider from "@/assets/hero-rider.jpg";

const points = [
  { icon: ShieldCheck, text: "Detect riders, passengers and helmet violations" },
  { icon: ScanLine, text: "Read the associated vehicle number plate when it is legible" },
  { icon: Camera, text: "Analyse images, videos or your live camera feed" },
] as const;

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-14 lg:py-16">
      <section className="bg-navy-gradient relative overflow-hidden rounded-3xl p-8 text-navy-foreground shadow-elevated sm:p-10">
        <Link to="/" className="eyebrow !text-teal">
          SafeVision AI
        </Link>
        <h2 className="mt-3 text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl">
          AI-Powered Helmet Detection &amp; Road-Safety Monitoring
        </h2>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-navy-foreground/75">
          Every unhelmeted ride is a preventable risk. SafeVision AI helps identify helmet
          violations and the vehicles involved so road safety can be monitored properly.
        </p>
        <ul className="mt-6 space-y-3">
          {points.map((point) => (
            <li key={point.text} className="flex items-start gap-3 text-sm">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary-foreground/12 text-teal">
                <point.icon className="h-4 w-4" />
              </span>
              <span className="pt-1.5 text-navy-foreground/85">{point.text}</span>
            </li>
          ))}
        </ul>
        <div className="mt-8 overflow-hidden rounded-2xl border border-primary-foreground/15">
          <img
            src={heroRider}
            alt="Motorcycle rider wearing a helmet on a city road"
            width={1600}
            height={1008}
            loading="lazy"
            className="block h-40 w-full object-cover sm:h-48"
          />
        </div>
      </section>

      <section className="surface-card p-6 sm:p-8">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">{title}</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
        <div className="mt-6">{children}</div>
        {footer ? <div className="mt-6 text-sm text-muted-foreground">{footer}</div> : null}
      </section>
    </div>
  );
}

export const fieldClass = "field-input";
export const labelClass = "mb-1.5 block text-sm font-semibold text-foreground";
export const submitClass = "btn-primary w-full";
