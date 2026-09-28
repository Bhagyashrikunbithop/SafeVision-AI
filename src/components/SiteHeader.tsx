import { Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut, Menu, ShieldCheck, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const publicLinks = [
  { to: "/", label: "Home", exact: true },
  { to: "/about", label: "About" },
] as const;

const memberLinks = [
  { to: "/", label: "Home", exact: true },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/live", label: "Live Detection" },
  { to: "/image", label: "Image Detection" },
  { to: "/video", label: "Video Detection" },
  { to: "/history", label: "History" },
  { to: "/about", label: "About" },
  { to: "/profile", label: "Profile" },
] as const;

export function Brand({ tone = "dark" }: { tone?: "dark" | "light" }) {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <span className="bg-teal-gradient grid h-9 w-9 shrink-0 place-items-center rounded-xl text-primary-foreground">
        <ShieldCheck className="h-[18px] w-[18px]" />
      </span>
      <span className="flex min-w-0 flex-col leading-none">
        <span
          className={`text-[15px] font-extrabold tracking-tight ${
            tone === "light" ? "text-navy-foreground" : "text-foreground"
          }`}
        >
          SafeVision AI
        </span>
        <span
          className={`mt-1 truncate text-[10px] font-medium uppercase tracking-[0.13em] ${
            tone === "light" ? "text-navy-foreground/70" : "text-muted-foreground"
          }`}
        >
          Helmet Detection &amp; Safety Monitoring
        </span>
      </span>
    </Link>
  );
}

export function SiteHeader() {
  const { user } = useAuth();
  const navLinks = user ? memberLinks : publicLinks;
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  async function handleSignOut() {
    setOpen(false);
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    router.navigate({ to: "/login", replace: true });
  }

  const linkBase =
    "rounded-lg px-2.5 py-2 text-[13px] font-medium text-navy-foreground/75 transition-colors hover:bg-primary-foreground/10 hover:text-navy-foreground";
  const linkActive = "bg-primary-foreground/12 text-navy-foreground";

  return (
    <header className="bg-navy-gradient sticky top-0 z-40 border-b border-primary-foreground/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid h-16 grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <Brand tone="light" />
          <div className="flex items-center gap-1">
            <nav className="hidden items-center gap-0.5 xl:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  activeOptions={{ exact: Boolean("exact" in link && link.exact) }}
                  className={linkBase}
                  activeProps={{ className: `${linkBase} ${linkActive}` }}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="ml-2 hidden items-center gap-2 xl:flex">
              {user ? (
                <button onClick={handleSignOut} className="btn-ghost-light !px-3 !py-2 !text-[13px]">
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              ) : (
                <>
                  <Link to="/login" className={linkBase}>
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="rounded-lg bg-primary-foreground px-3.5 py-2 text-[13px] font-semibold text-navy transition-opacity hover:opacity-90"
                  >
                    Create Account
                  </Link>
                </>
              )}
            </div>
            <button
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="grid h-10 w-10 place-items-center rounded-lg border border-primary-foreground/25 text-navy-foreground xl:hidden"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="border-t border-primary-foreground/10 bg-navy xl:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                activeOptions={{ exact: Boolean("exact" in link && link.exact) }}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-navy-foreground/75 hover:bg-primary-foreground/10"
                activeProps={{
                  className:
                    "rounded-lg px-3 py-2.5 text-sm font-semibold bg-primary-foreground/12 text-navy-foreground",
                }}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-primary-foreground/10 pt-3">
              {user ? (
                <button onClick={handleSignOut} className="btn-ghost-light w-full">
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setOpen(false)}
                    className="btn-ghost-light w-full"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setOpen(false)}
                    className="w-full rounded-lg bg-primary-foreground px-3 py-2.5 text-center text-sm font-semibold text-navy"
                  >
                    Create Account
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
