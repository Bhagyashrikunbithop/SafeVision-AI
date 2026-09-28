import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { LogOut, Mail, ShieldCheck, User } from "lucide-react";
import { fetchDashboardStats, fetchProfile, updateProfileName } from "@/lib/analyses";
import { ErrorMessage, SuccessMessage } from "@/components/Alert";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { fieldClass, labelClass } from "@/components/AuthShell";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Your Profile – SafeVision AI" },
      {
        name: "description",
        content: "Manage your SafeVision AI account details and review your detection activity.",
      },
      { property: "og:title", content: "Your Profile – SafeVision AI" },
      { property: "og:description", content: "Manage your SafeVision AI account." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const profile = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: () => fetchProfile(user!.id),
    enabled: Boolean(user?.id),
  });
  const stats = useQuery({ queryKey: ["dashboard-stats"], queryFn: fetchDashboardStats });

  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const initial =
      profile.data?.full_name ?? (user?.user_metadata?.["full_name"] as string | undefined) ?? "";
    setFullName(initial);
  }, [profile.data?.full_name, user]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    const trimmed = fullName.trim();
    if (trimmed.length < 2 || trimmed.length > 100) {
      setError("Please enter a name between 2 and 100 characters.");
      return;
    }
    setBusy(true);
    try {
      await updateProfileName(user!.id, trimmed);
      await supabase.auth.updateUser({ data: { full_name: trimmed } });
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "We could not save your name. Please retry.");
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    router.navigate({ to: "/login", replace: true });
  }

  const memberSince = profile.data?.created_at ?? user?.created_at;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:py-14">
      <header>
        <span className="eyebrow">Profile</span>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Your account</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your SafeVision AI details and a summary of your detection activity.
        </p>
      </header>

      <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,320px)]">
        <section className="surface-card p-6">
          <h2 className="text-lg font-bold tracking-tight">Account details</h2>
          <form onSubmit={save} className="mt-5 space-y-4" noValidate>
            <div>
              <label className={labelClass} htmlFor="fullName">
                Full name
              </label>
              <input
                id="fullName"
                className={fieldClass}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="email">
                Email
              </label>
              <input
                id="email"
                className={`${fieldClass} cursor-not-allowed opacity-70`}
                value={user?.email ?? ""}
                readOnly
              />
              <p className="mt-1.5 text-xs text-muted-foreground">
                Your email is used to sign in and cannot be changed here.
              </p>
            </div>

            {error ? <ErrorMessage>{error}</ErrorMessage> : null}
            {saved ? <SuccessMessage>Your name has been updated.</SuccessMessage> : null}

            <button type="submit" disabled={busy} className="btn-primary">
              {busy ? "Saving…" : "Save changes"}
            </button>
          </form>
        </section>

        <aside className="space-y-4">
          <div className="surface-card p-6">
            <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
              Status
            </h2>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-center gap-2.5">
                <User className="h-4 w-4 text-primary" />
                <span className="truncate font-semibold">{fullName || "Unnamed account"}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-primary" />
                <span className="truncate">{user?.email}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <ShieldCheck className="h-4 w-4 text-success" />
                <span>{user?.email_confirmed_at ? "Email verified" : "Email not verified"}</span>
              </li>
            </ul>
            {memberSince ? (
              <p className="mt-4 text-xs text-muted-foreground">
                Member since {new Date(memberSince).toLocaleDateString()}
              </p>
            ) : null}
          </div>

          <div className="surface-card p-6">
            <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
              Your activity
            </h2>
            <dl className="mt-4 space-y-2.5 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Analyses run</dt>
                <dd className="font-bold">{stats.data?.totalAnalyses ?? 0}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Violations recorded</dt>
                <dd className="font-bold text-violation">{stats.data?.totalViolations ?? 0}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Plates read</dt>
                <dd className="font-bold">{stats.data?.readablePlates ?? 0}</dd>
              </div>
            </dl>
          </div>

          <button onClick={signOut} className="btn-secondary w-full">
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </aside>
      </div>
    </div>
  );
}
