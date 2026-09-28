import { Link } from "@tanstack/react-router";
import { Brand } from "./SiteHeader";

const footerLinks = [
  { to: "/", label: "Home" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/live", label: "Live Detection" },
  { to: "/image", label: "Image Detection" },
  { to: "/video", label: "Video Detection" },
  { to: "/history", label: "History" },
  { to: "/about", label: "About" },
  { to: "/profile", label: "Profile" },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div>
          <Brand />
          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
            SafeVision AI detects motorcycle riders, helmet violations and associated vehicle number
            plates from images, videos and live camera streams using computer vision and YOLO.
          </p>
          <p className="mt-4 rounded-xl border border-accent/25 bg-accent/8 px-4 py-3 text-sm font-medium text-foreground">
            A helmet is the simplest protection on the road. Wear one, every ride.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-bold tracking-tight text-foreground">Explore</h3>
          <nav className="mt-4 grid grid-cols-2 gap-2 text-sm">
            {footerLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-muted-foreground transition-colors hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span>© {new Date().getFullYear()} SafeVision AI. All rights reserved.</span>
          <span>YOLO · FastAPI · OpenCV · OCR · React · Supabase</span>
        </div>
      </div>
    </footer>
  );
}
