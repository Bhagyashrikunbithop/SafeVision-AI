import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type DetectionCardProps = {
  icon: LucideIcon;
  badge: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  cta: string;
  to: "/live" | "/image" | "/video";
};

export function DetectionCard({
  icon: Icon,
  badge,
  title,
  description,
  image,
  imageAlt,
  cta,
  to,
}: DetectionCardProps) {
  return (
    <article className="surface-card group flex flex-col overflow-hidden transition-shadow hover:shadow-elevated">
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={image}
          alt={imageAlt}
          width={1200}
          height={800}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
        <span className="absolute left-3 top-3 rounded-lg bg-card/92 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-primary backdrop-blur">
          {badge}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
            <Icon className="h-[18px] w-[18px]" />
          </span>
          <h3 className="text-base font-bold tracking-tight">{title}</h3>
        </div>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
        <Link to={to} className="btn-primary mt-5 w-full">
          {cta} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}
